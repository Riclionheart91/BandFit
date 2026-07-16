import SwiftUI
import BandFitKit

struct WatchRootView: View {
    @EnvironmentObject var coordinator: WatchWorkoutCoordinator

    var body: some View {
        Group {
            if coordinator.engine.plan != nil {
                WatchActiveWorkoutView()
            } else {
                WatchIdleView()
            }
        }
        .animation(.default, value: coordinator.engine.plan != nil)
    }
}

/// Shown before a workout starts. Normally the iPhone pushes the plan automatically
/// (WCMessageKind.startWorkout) the moment the person taps "Avvia" there, but we also
/// let the person start one of the last-used predefined plans directly from the wrist.
struct WatchIdleView: View {
    @EnvironmentObject var coordinator: WatchWorkoutCoordinator

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Image(systemName: coordinator.connectivity.isReachable ? "iphone.gen3.radiowaves.left.and.right" : "iphone.slash")
                    .font(.title2)
                    .foregroundStyle(.secondary)
                Text(coordinator.connectivity.isReachable ? "In attesa dall'iPhone…" : "iPhone non raggiungibile")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                Divider().padding(.vertical, 4)

                Text("Oppure avvia qui:")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                ForEach(PredefinedWorkouts.all) { plan in
                    Button {
                        coordinator.start(plan: plan)
                    } label: {
                        Text(plan.name)
                            .font(.system(size: 14, weight: .semibold))
                            .frame(maxWidth: .infinity)
                    }
                    .tint(.red)
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("BandFit")
    }
}
