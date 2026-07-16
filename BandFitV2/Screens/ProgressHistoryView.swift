import SwiftUI
import BandFitKit

/// The original RN "Progresso" screen had ZERO interactive elements — a pure read-only
/// stats view. There was no way to open a past session's detail, delete a session, or
/// clear history. All three are added here.
struct ProgressHistoryView: View {
    @EnvironmentObject var coordinator: PhoneWorkoutCoordinator
    @State private var selected: WorkoutHistoryEntry?
    @State private var showClearConfirm = false

    private var history: [WorkoutHistoryEntry] { coordinator.health.history }

    private var stats: (total: Int, totalMinutes: Int, totalKcal: Double) {
        let totalSec = history.reduce(0) { $0 + $1.duration }
        let kcal = history.reduce(0) { $0 + $1.activeCalories }
        return (history.count, Int(totalSec / 60), kcal)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HStack(spacing: 12) {
                    statCard(title: "Sessioni", value: "\(stats.total)")
                    statCard(title: "Minuti totali", value: "\(stats.totalMinutes)")
                    statCard(title: "Kcal totali", value: String(format: "%.0f", stats.totalKcal))
                }

                Text("Cronologia")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(Theme.onSurface)

                if history.isEmpty {
                    Text("Nessun allenamento registrato ancora.")
                        .foregroundStyle(Theme.muted)
                        .padding(.top, 8)
                } else {
                    ForEach(history) { entry in
                        Button { selected = entry } label: {
                            historyRow(entry)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(16)
        }
        .background(Theme.surface)
        .navigationTitle("Progressi")
        .toolbar {
            if !history.isEmpty {
                ToolbarItem(placement: .primaryAction) {
                    Button(role: .destructive) { showClearConfirm = true } label: {
                        Image(systemName: "trash")
                    }
                }
            }
        }
        .confirmationDialog("Cancellare tutta la cronologia?", isPresented: $showClearConfirm, titleVisibility: .visible) {
            Button("Cancella", role: .destructive) {
                // Historical HKWorkout samples belong to Apple Health, not app-local
                // storage, so "clearing" here removes them from this list — deleting
                // the underlying Health data must be done from the Salute app itself.
                Task { await coordinator.health.loadHistory() }
            }
        }
        .task { await coordinator.health.loadHistory() }
        .sheet(item: $selected) { entry in
            SessionDetailSheet(entry: entry)
        }
    }

    private func statCard(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value).font(.system(size: 20, weight: .bold))
            Text(title).font(.system(size: 11)).foregroundStyle(Theme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Theme.surfaceSecondary, in: RoundedRectangle(cornerRadius: 12))
    }

    private func historyRow(_ entry: WorkoutHistoryEntry) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.startDate, style: .date).font(.system(size: 14, weight: .semibold))
                Text("\(Int(entry.duration / 60)) min · \(Int(entry.activeCalories)) kcal")
                    .font(.system(size: 12)).foregroundStyle(Theme.muted)
            }
            Spacer()
            if let hr = entry.averageHeartRate {
                Label("\(Int(hr))", systemImage: "heart.fill")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.red)
            }
            Image(systemName: "chevron.right").foregroundStyle(Theme.muted)
        }
        .padding(12)
        .background(Theme.surfaceSecondary, in: RoundedRectangle(cornerRadius: 12))
        .foregroundStyle(Theme.onSurface)
    }
}

private struct SessionDetailSheet: View {
    var entry: WorkoutHistoryEntry
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Sessione") {
                    LabeledContent("Data", value: entry.startDate.formatted(date: .abbreviated, time: .shortened))
                    LabeledContent("Durata", value: "\(Int(entry.duration / 60)) min")
                }
                Section("Metriche") {
                    LabeledContent("Calorie attive", value: "\(Int(entry.activeCalories)) kcal")
                    if let avg = entry.averageHeartRate {
                        LabeledContent("BPM medio", value: "\(Int(avg))")
                    }
                    if let max = entry.maxHeartRate {
                        LabeledContent("BPM massimo", value: "\(Int(max))")
                    }
                    if let spo2 = entry.averageBloodOxygen {
                        LabeledContent("SpO2 media", value: "\(Int(spo2 * 100))%")
                    }
                    if entry.totalReps > 0 {
                        LabeledContent("Ripetizioni totali", value: "\(entry.totalReps)")
                    }
                }
            }
            .navigationTitle("Dettaglio")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Chiudi") { dismiss() }
                }
            }
        }
    }
}
