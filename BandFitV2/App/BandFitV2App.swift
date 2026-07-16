import SwiftUI

@main
struct BandFitV2App: App {
    @StateObject private var coordinator = PhoneWorkoutCoordinator()
    @StateObject private var planStore = PlanStore()

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(coordinator)
                .environmentObject(planStore)
                .preferredColorScheme(nil) // follow system Light/Dark automatically
                .task { await coordinator.requestAuthorization() }
        }
    }
}
