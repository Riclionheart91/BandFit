import Foundation
import HealthKit
import BandFitKit

/// On iPhone, HealthKit is used for two things:
///  1. Requesting the read/share authorization the person sees once at first launch
///     (both iPhone and Watch must each request their own authorization — HealthKit
///     stores are per-device but the underlying Health data is the same iCloud-synced
///     record, so a workout saved by the Watch shows up in the Progress screen here).
///  2. Reading past workouts to populate the Progress tab, and running a standalone
///     HKWorkoutSession fallback when no Watch is paired/worn so heart rate/calories
///     still work using the iPhone's own sensors (accelerometer-only estimate — the
///     iPhone has no PPG heart rate sensor, so HR will stay "–" without a Watch;
///     calories fall back to a MET-based estimate).
@MainActor
public final class PhoneHealthManager: ObservableObject {
    @Published public private(set) var isAuthorized = false
    @Published public private(set) var history: [WorkoutHistoryEntry] = []

    private let store = HKHealthStore()
    private let hrType = HKObjectType.quantityType(forIdentifier: .heartRate)!
    private let energyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
    private let spo2Type = HKObjectType.quantityType(forIdentifier: .oxygenSaturation)!

    // ✅ FIX #4: Session management for iPhone-only workouts
    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var workoutMetrics: (reps: Int, calories: Double) = (0, 0)

    public func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        let share: Set = [HKObjectType.workoutType()]
        let read: Set = [hrType, energyType, spo2Type, HKObjectType.workoutType()]
        do {
            try await store.requestAuthorization(toShare: share, read: read)
            isAuthorized = true
            await loadHistory()
        } catch {
            print("[PhoneHealthManager] auth error: \(error)")
        }
    }

    // ✅ FIX #4: Start a HealthKit workout session (iPhone-only, fallback when no Watch)
    public func startWorkoutSession() {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        let config = HKWorkoutConfiguration()
        config.activityType = .traditionalStrengthTraining
        config.locationType = .indoor

        do {
            let session = try HKWorkoutSession(healthStore: store, configuration: config)
            let builder = session.associatedWorkoutBuilder()
            builder.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: config)

            self.session = session
            self.builder = builder
            workoutMetrics = (0, 0)

            let now = Date()
            session.startActivity(with: now)
            builder.beginCollection(withStart: now) { [weak self] success, error in
                if let error {
                    print("[PhoneHealthManager] beginCollection error: \(error)")
                }
            }
        } catch {
            print("[PhoneHealthManager] startWorkoutSession error: \(error)")
        }
    }

    // ✅ FIX #4: Record metrics during workout (reps, calories)
    public func recordMetrics(reps: Int, calories: Double) {
        workoutMetrics = (reps, calories)
    }

    // ✅ FIX #4: End the HealthKit session and save the workout
    public func endWorkoutSession() async -> WorkoutHistoryEntry? {
        guard let session, let builder else { return nil }

        let endDate = Date()
        session.end()

        return await withCheckedContinuation { continuation in
            builder.endCollection(withEnd: endDate) { [weak self] success, error in
                if let error {
                    print("[PhoneHealthManager] endCollection error: \(error)")
                }

                builder.finishWorkout { [weak self] workout, error in
                    if let error {
                        print("[PhoneHealthManager] finishWorkout error: \(error)")
                        continuation.resume(returning: nil)
                        return
                    }

                    guard let workout else {
                        continuation.resume(returning: nil)
                        return
                    }

                    let entry = WorkoutHistoryEntry(
                        planName: "BandFit",
                        startDate: workout.startDate,
                        endDate: workout.endDate,
                        totalReps: self?.workoutMetrics.reps ?? 0,
                        averageHeartRate: nil,  // iPhone has no PPG sensor
                        maxHeartRate: nil,
                        activeCalories: self?.workoutMetrics.calories ?? 0,
                        averageBloodOxygen: nil
                    )

                    continuation.resume(returning: entry)
                }
            }
        }
    }

    public func loadHistory() async {
        let predicate = HKQuery.predicateForWorkouts(with: .traditionalStrengthTraining)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let workouts: [HKWorkout] = await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: .workoutType(), predicate: predicate, limit: 50, sortDescriptors: [sort]) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKWorkout]) ?? [])
            }
            store.execute(query)
        }

        var entries: [WorkoutHistoryEntry] = []
        for workout in workouts {
            let stats = workout.statistics(for: hrType)
            let avgHR = stats?.averageQuantity()?.doubleValue(for: .count().unitDivided(by: .minute()))
            let maxHR = stats?.maximumQuantity()?.doubleValue(for: .count().unitDivided(by: .minute()))
            let calories = workout.statistics(for: energyType)?.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? 0

            entries.append(WorkoutHistoryEntry(
                planName: "BandFit",
                startDate: workout.startDate,
                endDate: workout.endDate,
                totalReps: 0,
                averageHeartRate: avgHR,
                maxHeartRate: maxHR,
                activeCalories: calories,
                averageBloodOxygen: nil
            ))
        }
        history = entries
    }

    // ✅ FIX #5: Delete all workout history from HealthKit
    public func deleteAllWorkouts() async {
        let predicate = HKQuery.predicateForWorkouts(with: .traditionalStrengthTraining)
        do {
            try await store.deleteAllObjects(matching: predicate)
            history = []
            print("[PhoneHealthManager] All workouts deleted successfully")
        } catch {
            print("[PhoneHealthManager] deleteAllWorkouts error: \(error)")
        }
    }
}
