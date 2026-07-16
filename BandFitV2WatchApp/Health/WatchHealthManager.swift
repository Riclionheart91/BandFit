import Foundation
import HealthKit
import Combine
import BandFitKit

/// Runs a real HKWorkoutSession on the Watch — this is what makes the workout show up
/// in Apple's Fitness/Salute app, and what lets watchOS auto-collect heart rate and
/// active energy at full sensor rate even when the screen is off.
///
/// Blood oxygen: Apple Watch only takes SpO2 readings opportunistically (background
/// "Blood Oxygen" measurements every ~few minutes on models/regions that support it —
/// Apple removed the feature from watches sold new in the US after Dec 2023 due to a
/// patent dispute, though existing watches keep it and other regions are unaffected).
/// We surface the most recent sample instead of promising a continuous readout.
@MainActor
public final class WatchHealthManager: NSObject, ObservableObject {
    @Published public private(set) var isAuthorized = false
    @Published public private(set) var liveMetrics = LiveMetrics()

    private let store = HKHealthStore()
    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var spo2Query: HKAnchoredObjectQuery?

    private let hrType = HKObjectType.quantityType(forIdentifier: .heartRate)!
    private let energyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
    private let spo2Type = HKObjectType.quantityType(forIdentifier: .oxygenSaturation)!

    public func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        let share: Set = [HKObjectType.workoutType()]
        let read: Set = [hrType, energyType, spo2Type, HKObjectType.workoutType()]
        do {
            try await store.requestAuthorization(toShare: share, read: read)
            isAuthorized = true
        } catch {
            print("[WatchHealthManager] auth error: \(error)")
            isAuthorized = false
        }
    }

    public func startWorkout() {
        let config = HKWorkoutConfiguration()
        config.activityType = .traditionalStrengthTraining
        config.locationType = .indoor

        do {
            let session = try HKWorkoutSession(healthStore: store, configuration: config)
            let builder = session.associatedWorkoutBuilder()
            builder.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: config)
            session.delegate = self
            builder.delegate = self

            self.session = session
            self.builder = builder

            let now = Date()
            session.startActivity(with: now)
            builder.beginCollection(withStart: now) { [weak self] success, error in
                if let error { print("[WatchHealthManager] beginCollection error: \(error)") }
                Task { @MainActor in self?.startSpO2Observer() }
            }
        } catch {
            print("[WatchHealthManager] startWorkout error: \(error)")
        }
    }

    public func pause() { session?.pause() }
    public func resume() { session?.resume() }

    public func endWorkout() async -> WorkoutHistoryEntry? {
        guard let session, let builder else { return nil }
        session.end()
        return await withCheckedContinuation { continuation in
            builder.endCollection(withEnd: Date()) { [weak self] _, _ in
                builder.finishWorkout { workout, _ in
                    self?.spo2Query.map { self?.store.stop($0) }
                    guard let workout else { continuation.resume(returning: nil); return }
                    let entry = WorkoutHistoryEntry(
                        planName: workout.workoutActivityType.name,
                        startDate: workout.startDate,
                        endDate: workout.endDate,
                        totalReps: self?.liveMetrics.reps ?? 0,
                        averageHeartRate: nil,
                        maxHeartRate: nil,
                        activeCalories: self?.liveMetrics.activeCalories ?? 0,
                        averageBloodOxygen: self?.liveMetrics.bloodOxygenPercent
                    )
                    continuation.resume(returning: entry)
                }
            }
        }
    }

    public func recordReps(_ reps: Int) {
        liveMetrics.reps = reps
    }

    private func startSpO2Observer() {
        let query = HKAnchoredObjectQuery(
            type: spo2Type, predicate: nil, anchor: nil, limit: HKObjectQueryNoLimit
        ) { [weak self] _, samples, _, _, _ in
            Task { @MainActor in self?.handleSpO2(samples) }
        }
        query.updateHandler = { [weak self] _, samples, _, _, _ in
            Task { @MainActor in self?.handleSpO2(samples) }
        }
        store.execute(query)
        spo2Query = query
    }

    private func handleSpO2(_ samples: [HKSample]?) {
        guard let sample = samples?.compactMap({ $0 as? HKQuantitySample }).last else { return }
        let value = sample.quantity.doubleValue(for: .percent())
        liveMetrics.bloodOxygenPercent = value
    }
}

extension WatchHealthManager: HKWorkoutSessionDelegate {
    nonisolated public func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {}
    nonisolated public func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("[WatchHealthManager] session error: \(error)")
    }
}

extension WatchHealthManager: HKLiveWorkoutBuilderDelegate {
    nonisolated public func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        Task { @MainActor in
            for type in collectedTypes {
                guard let quantityType = type as? HKQuantityType else { continue }
                guard let statistics = workoutBuilder.statistics(for: quantityType) else { continue }

                if quantityType == self.hrType {
                    let value = statistics.mostRecentQuantity()?.doubleValue(for: .count().unitDivided(by: .minute()))
                    if let value { self.liveMetrics.heartRateBPM = value }
                } else if quantityType == self.energyType {
                    let value = statistics.sumQuantity()?.doubleValue(for: .kilocalorie())
                    if let value { self.liveMetrics.activeCalories = value }
                }
            }
        }
    }

    nonisolated public func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}
}

private extension HKWorkoutActivityType {
    var name: String { "BandFit" }
}
