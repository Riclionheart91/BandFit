import SwiftUI
import BandFitKit

struct WatchActiveWorkoutView: View {
    @EnvironmentObject var coordinator: WatchWorkoutCoordinator

    var body: some View {
        TabView {
            metricsPage
            controlsPage
        }
        .tabViewStyle(.verticalPage)
    }

    private var exercise: Exercise? {
        coordinator.engine.currentEntry.flatMap { ExerciseLibrary.byId[$0.exerciseId] }
    }

    private var metricsPage: some View {
        let snapshot = coordinator.engine.snapshot
        let metrics = coordinator.health.liveMetrics
        let isPause = snapshot.state == .rest || snapshot.state == .hydration
        return ScrollView {
            VStack(spacing: 6) {
                Text(snapshot.state == .hydration ? "💧 IDRATAZIONE" : (snapshot.state == .rest ? "RIPOSO" : exercise?.name ?? "—"))
                    .font(.system(size: 15, weight: .bold))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                if let entry = coordinator.engine.currentEntry {
                    Text("Set \(snapshot.setIndex + 1)/\(entry.sets) · \(snapshot.repsInCurrentSet)/\(entry.reps) rip.")
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                }

                if isPause {
                    Text(fmt(snapshot.restRemainingSeconds))
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                    Button {
                        coordinator.handle(action: .skipRest)
                    } label: {
                        Text("Salta")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .tint(.cyan)
                }

                HStack(spacing: 10) {
                    metricTile(systemImage: "heart.fill", tint: .red,
                               value: metrics.heartRateBPM.map { "\(Int($0))" } ?? "–", unit: "bpm")
                    metricTile(systemImage: "flame.fill", tint: .orange,
                               value: String(format: "%.0f", metrics.activeCalories), unit: "kcal")
                }
                HStack(spacing: 10) {
                    metricTile(systemImage: "drop.fill", tint: .blue,
                               value: metrics.bloodOxygenPercent.map { "\(Int($0 * 100))" } ?? "–", unit: "% SpO2")
                    metricTile(systemImage: "repeat", tint: .green,
                               value: "\(snapshot.repsInCurrentSet)", unit: "reps")
                }
            }
            .padding(.horizontal, 4)
        }
    }

    private func fmt(_ seconds: Int) -> String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }

    private func metricTile(systemImage: String, tint: Color, value: String, unit: String) -> some View {
        VStack(spacing: 2) {
            Image(systemName: systemImage).foregroundStyle(tint).font(.caption)
            Text(value).font(.system(size: 16, weight: .semibold))
            Text(unit).font(.system(size: 9)).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(Color.gray.opacity(0.2), in: RoundedRectangle(cornerRadius: 10))
    }

    private var controlsPage: some View {
        let state = coordinator.engine.snapshot.state
        return VStack(spacing: 10) {
            HStack(spacing: 14) {
                Button {
                    if state == .paused {
                        coordinator.handle(action: .resume)
                    } else {
                        coordinator.handle(action: .pause)
                    }
                } label: {
                    Image(systemName: state == .paused ? "play.fill" : "pause.fill")
                }
                .tint(.yellow)

                Button {
                    coordinator.handle(action: .completeSet)
                } label: {
                    Image(systemName: "checkmark")
                }
                .tint(.green)

                Button {
                    coordinator.handle(action: .skipExercise)
                } label: {
                    Image(systemName: "forward.fill")
                }
                .tint(.blue)
            }
            .buttonStyle(.borderedProminent)

            Button(role: .destructive) {
                Task { await coordinator.endWorkout() }
            } label: {
                Label("Termina", systemImage: "xmark.circle.fill")
            }
        }
        .alert("In pausa", isPresented: .constant(state == .paused)) {
            Button("Riprendi") { coordinator.handle(action: .resume) }
            Button("Termina", role: .destructive) {
                Task { await coordinator.endWorkout() }
            }
        }
    }
}
