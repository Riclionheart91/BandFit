import SwiftUI
import BandFitKit

struct HomeView: View {
    @EnvironmentObject var coordinator: PhoneWorkoutCoordinator
    @EnvironmentObject var planStore: PlanStore
    @State private var showBuilder = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header

                // Quick actions row — was missing entirely in the old app: on the RN
                // version, from Home there was no direct button into Library or Builder,
                // only the tab bar. Added explicit shortcuts here.
                HStack(spacing: 12) {
                    NavigationLink {
                        LibraryView()
                    } label: {
                        quickActionLabel(title: "Libreria", icon: "square.grid.2x2.fill")
                    }
                    .buttonStyle(.plain)

                    Button {
                        showBuilder = true
                    } label: {
                        quickActionLabel(title: "Crea allenamento", icon: "plus.circle.fill")
                    }
                    .buttonStyle(.plain)
                }

                Text("Allenamenti predefiniti")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(Theme.onSurface)

                ForEach(PredefinedWorkouts.all) { plan in
                    WorkoutPlanRow(plan: plan) {
                        coordinator.start(plan: plan)
                    }
                }

                if !planStore.customPlans.isEmpty {
                    Text("I tuoi allenamenti")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(Theme.onSurface)
                        .padding(.top, 8)

                    ForEach(planStore.customPlans) { plan in
                        WorkoutPlanRow(plan: plan, onStart: {
                            coordinator.start(plan: plan)
                        }, onDelete: {
                            planStore.delete(plan)
                        })
                    }
                }
            }
            .padding(16)
        }
        .background(Theme.surface)
        .navigationTitle("BandFit")
        .sheet(isPresented: $showBuilder) {
            NavigationStack { BuilderView(existingPlan: nil) }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Pronto ad allenarti?")
                .font(.system(size: 26, weight: .heavy))
                .foregroundStyle(Theme.onSurface)
            watchStatusLine
        }
    }

    @ViewBuilder
    private var watchStatusLine: some View {
        if !coordinator.connectivity.isWatchAppInstalled {
            Text("App BandFit V2 non trovata sull'Apple Watch — installala aprendo l'app Watch sull'iPhone, sezione \"App disponibili\".")
                .font(.system(size: 13))
                .foregroundStyle(Theme.warning)
        } else if coordinator.connectivity.isReachable {
            Text("Apple Watch collegato — battito, calorie e SpO2 in tempo reale.")
                .font(.system(size: 13))
                .foregroundStyle(Theme.muted)
        } else {
            Text("Watch installato ma non raggiungibile ora: aprilo sul polso prima di avviare, oppure procedi — verranno usati i sensori dell'iPhone finché non si ricollega.")
                .font(.system(size: 13))
                .foregroundStyle(Theme.warning)
        }
    }

    private func quickActionLabel(title: String, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon).font(.title2)
            Text(title).font(.system(size: 13, weight: .semibold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .foregroundStyle(Theme.onSurface)
        .background(Theme.surfaceSecondary, in: RoundedRectangle(cornerRadius: 14))
    }
}
