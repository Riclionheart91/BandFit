import SwiftUI

struct RootTabView: View {
    @EnvironmentObject var coordinator: PhoneWorkoutCoordinator

    var body: some View {
        TabView {
            NavigationStack { HomeView() }
                .tabItem { Label("Home", systemImage: "house.fill") }

            NavigationStack { LibraryView() }
                .tabItem { Label("Libreria", systemImage: "square.grid.2x2.fill") }

            NavigationStack { ActiveWorkoutView() }
                .tabItem { Label("Allenamento", systemImage: "figure.strengthtraining.traditional") }
                .badge(coordinator.engine.plan != nil ? "•" : nil)

            NavigationStack { ProgressHistoryView() }
                .tabItem { Label("Progressi", systemImage: "chart.bar.fill") }
        }
        .tint(Theme.brand)
    }
}
