import SwiftUI

@main
struct BandFitV2WatchApp: App {
    @StateObject private var coordinator = WatchWorkoutCoordinator()

    var body: some Scene {
        WindowGroup {
            WatchRootView()
                .environmentObject(coordinator)
                .task { await coordinator.requestAuthorization() }
        }
    }
}
