import SwiftUI
import BandFitKit

struct ActiveWorkoutView: View {
    @EnvironmentObject var coordinator: PhoneWorkoutCoordinator
    @EnvironmentObject var planStore: PlanStore
    @State private var showBuilder = false
    @State private var showCancelConfirm = false

    var body: some View {
        Group {
            if coordinator.engine.plan == nil {
                emptyState
            } else {
                activeContent
            }
        }
        .background(Theme.surface)
        .navigationTitle("Allenamento")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: Empty state

    private var emptyState: some View {
        ScrollView {
            VStack(spacing: 14) {
                Image(systemName: "figure.strengthtraining.traditional")
                    .font(.system(size: 44))
                    .foregroundStyle(Theme.muted)
                Text("Nessun allenamento attivo")
                    .font(.title3.bold())
                    .foregroundStyle(Theme.onSurface)
                Text("Scegli un allenamento per iniziare")
                    .font(.subheadline)
                    .foregroundStyle(Theme.muted)

                // Fix: the original screen only listed predefined workouts here with no
                // way to reach the Library or Builder without switching tabs manually.
                HStack(spacing: 12) {
                    NavigationLink {
                        LibraryView()
                    } label: {
                        Label("Libreria", systemImage: "square.grid.2x2.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)

                    Button {
                        showBuilder = true
                    } label: {
                        Label("Crea nuovo", systemImage: "plus")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
                .padding(.vertical, 8)

                ForEach(planStore.allPlans) { plan in
                    WorkoutPlanRow(plan: plan) {
                        coordinator.start(plan: plan)
                    }
                }
            }
            .padding(20)
        }
        .sheet(isPresented: $showBuilder) {
            NavigationStack { BuilderView(existingPlan: nil) }
        }
    }

    // MARK: Active workout

    private var activeContent: some View {
        let snapshot = coordinator.engine.snapshot
        let entry = coordinator.engine.currentEntry
        let exercise = entry.flatMap { ExerciseLibrary.byId[$0.exerciseId] }
        let nextExercise = coordinator.engine.nextEntry.flatMap { ExerciseLibrary.byId[$0.exerciseId] }
        let band = exercise.map { Theme.bandColor($0.defaultBand) } ?? Theme.brand
        let isPause = snapshot.state == .rest || snapshot.state == .hydration
        let isHydration = snapshot.state == .hydration
        let restTotal = max(1, isHydration ? WorkoutEngine.hydrationBreakSeconds : (entry?.restSeconds ?? 1))
        let progress = isPause
            ? 1 - Double(snapshot.restRemainingSeconds) / Double(restTotal)
            : Double(snapshot.setIndex + 1) / Double(max(1, entry?.sets ?? 1))
        let timerText = isPause ? fmt(snapshot.restRemainingSeconds) : fmt(snapshot.elapsedSeconds)
        let pauseColor: Color = isHydration ? .cyan : .orange

        return VStack(spacing: 0) {
            // "Sync Watch→iPhone silenziosamente fallisce" — a failed WatchConnectivity
            // send no longer disappears into the console only; it shows up here so the
            // person knows the Watch might be out of sync.
            if let warning = coordinator.connectivity.syncWarning {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text(warning)
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundStyle(.black)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(Theme.warning)
                .transition(.move(edge: .top).combined(with: .opacity))
            }

            HStack {
                Button(role: .destructive) {
                    showCancelConfirm = true
                } label: {
                    Label("Annulla", systemImage: "xmark")
                        .labelStyle(.iconOnly)
                        .font(.title3)
                }
                Spacer()
                VStack {
                    Text(coordinator.engine.plan?.name ?? "")
                        .font(.system(size: 15, weight: .bold))
                    Text(stateLabel(snapshot.state))
                        .font(.system(size: 11, weight: .bold))
                        .tracking(2)
                        .foregroundStyle(isPause ? pauseColor : band)
                }
                Spacer()
                LiveMetricsBar(metrics: coordinator.liveMetrics, compact: true)
            }
            .padding()

            Spacer()

            // Big, impossible-to-miss banner during rest/hydration — this is the
            // "rendi più evidente il passaggio da una serie all'altra" fix. It replaces
            // the exercise name area entirely so the transition really stands out.
            if isPause {
                VStack(spacing: 14) {
                    Image(systemName: isHydration ? "drop.fill" : "checkmark.circle.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(pauseColor)
                    Text(isHydration ? "Pausa idratazione" : "Serie completata!")
                        .font(.system(size: 24, weight: .heavy))
                    if let entry, !isHydration {
                        Text("Prossima: set \(snapshot.setIndex + 1) di \(entry.sets)")
                            .font(.system(size: 15))
                            .foregroundStyle(Theme.muted)
                    }

                    TimerRingView(progress: progress, color: pauseColor, primaryText: timerText, secondaryText: isHydration ? "IDRATAZIONE" : "RIPOSO")
                        .padding(.vertical, 12)

                    Button {
                        coordinator.skipRest()
                    } label: {
                        Text(isHydration ? "Salta pausa idratazione" : "Salta riposo")
                            .font(.system(size: 14, weight: .semibold))
                            .padding(.horizontal, 18).padding(.vertical, 10)
                    }
                    .buttonStyle(.bordered)
                    .tint(pauseColor)

                    if let nextExercise {
                        HStack {
                            Image(systemName: "arrow.forward.circle").foregroundStyle(Theme.muted)
                            Text("Prossimo:").foregroundStyle(Theme.muted)
                            Text(nextExercise.name).fontWeight(.semibold)
                        }
                        .font(.subheadline)
                        .padding(.horizontal, 16).padding(.vertical, 10)
                        .background(Theme.surfaceSecondary, in: Capsule())
                    }
                }
                .padding(.horizontal, 20)
                .transition(.scale.combined(with: .opacity))
            } else {
                VStack(spacing: 10) {
                    Text(exercise?.name ?? "—")
                        .font(.system(size: 26, weight: .heavy))
                        .multilineTextAlignment(.center)
                    if let entry {
                        Text("\(snapshot.setIndex + 1) / \(entry.sets) · \(entry.reps) rip.")
                            .font(.system(size: 16))
                            .foregroundStyle(Theme.muted)
                    }

                    TimerRingView(progress: progress, color: band, primaryText: timerText, secondaryText: "TEMPO")
                        .padding(.vertical, 12)

                    LiveMetricsBar(metrics: coordinator.liveMetrics)

                    if let nextExercise {
                        HStack {
                            Image(systemName: "arrow.forward.circle").foregroundStyle(Theme.muted)
                            Text("Prossimo:").foregroundStyle(Theme.muted)
                            Text(nextExercise.name).fontWeight(.semibold)
                        }
                        .font(.subheadline)
                        .padding(.horizontal, 16).padding(.vertical, 10)
                        .background(Theme.surfaceSecondary, in: Capsule())
                    } else {
                        HStack {
                            Image(systemName: "trophy.fill").foregroundStyle(Theme.warning)
                            Text("Ultimo esercizio")
                        }
                        .font(.subheadline)
                        .padding(.horizontal, 16).padding(.vertical, 10)
                        .background(Theme.surfaceSecondary, in: Capsule())
                    }
                }
                .padding(.horizontal, 20)
            }

            Spacer()

            controls(state: snapshot.state)
                .padding(.horizontal, 20)
                .padding(.top, 20)

            Button(role: .destructive) {
                showCancelConfirm = true
            } label: {
                Text("Annulla allenamento")
                    .font(.system(size: 14, weight: .semibold))
            }
            .padding(.vertical, 14)
        }
        .animation(.easeInOut(duration: 0.3), value: snapshot.state)
        .confirmationDialog("Annullare l'allenamento in corso?", isPresented: $showCancelConfirm, titleVisibility: .visible) {
            Button("Annulla allenamento", role: .destructive) {
                Task { await coordinator.cancel() }
            }
            Button("Continua ad allenarti", role: .cancel) {}
        }
        // "se metto in pausa crea un popup" — the moment the workout enters .paused,
        // this alert appears automatically offering Riprendi/Termina. While paused the
        // engine's timer is fully stopped (WorkoutEngine.pause() cancels it), so nothing
        // moves in the background while this is up.
        .alert("Allenamento in pausa", isPresented: .constant(snapshot.state == .paused)) {
            Button("Riprendi") { coordinator.resume() }
            Button("Termina allenamento", role: .destructive) {
                Task { await coordinator.cancel() }
            }
        } message: {
            Text("Il timer è fermo. Cosa vuoi fare?")
        }
    }

    private func controls(state: WorkoutState) -> some View {
        HStack(spacing: 14) {
            Button {
                state == .paused ? coordinator.resume() : coordinator.pause()
            } label: {
                Image(systemName: state == .paused ? "play.fill" : "pause.fill")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(.yellow)

            Button {
                coordinator.completeSet()
            } label: {
                Image(systemName: "checkmark")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)

            Button {
                coordinator.skipExercise()
            } label: {
                Image(systemName: "forward.fill")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(.blue)
        }
    }

    private func fmt(_ seconds: Int) -> String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }

    private func stateLabel(_ state: WorkoutState) -> String {
        switch state {
        case .rest: return "RIPOSO"
        case .hydration: return "IDRATAZIONE"
        case .paused: return "IN PAUSA"
        case .done: return "COMPLETATO"
        default: return "ATTIVO"
        }
    }
}
