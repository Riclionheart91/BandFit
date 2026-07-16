import SwiftUI
import BandFitKit

struct LibraryView: View {
    @State private var selectedGroup: MuscleGroup? = nil
    @State private var selectedBand: BandStrength? = nil
    @State private var showBuilder = false
    @State private var selectedExercise: Exercise? = nil

    private var filtered: [Exercise] {
        ExerciseLibrary.all.filter { ex in
            (selectedGroup == nil || ex.muscleGroups.contains(selectedGroup!)) &&
            (selectedBand == nil || ex.defaultBand == selectedBand!)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                filterRow(title: "Gruppo muscolare", items: MuscleGroup.allCases, selection: $selectedGroup) { $0.displayName }
                filterRow(title: "Elastico", items: BandStrength.allCases, selection: $selectedBand) { $0.displayName }

                LazyVStack(spacing: 4) {
                    ForEach(filtered) { exercise in
                        Button { selectedExercise = exercise } label: {
                            ExerciseRow(exercise: exercise)
                        }
                        .buttonStyle(.plain)
                        Divider()
                    }
                }
            }
            .padding(16)
        }
        .background(Theme.surface)
        .navigationTitle("Libreria")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showBuilder = true } label: {
                    Image(systemName: "plus.circle.fill")
                }
            }
        }
        .sheet(isPresented: $showBuilder) {
            NavigationStack { BuilderView(existingPlan: nil) }
        }
        .sheet(item: $selectedExercise) { exercise in
            ExerciseDetailSheet(exercise: exercise)
        }
    }

    private func filterRow<T: Identifiable & Hashable>(title: String, items: [T], selection: Binding<T?>, label: @escaping (T) -> String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.system(size: 13, weight: .semibold)).foregroundStyle(Theme.muted)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    chip(title: "Tutti", isSelected: selection.wrappedValue == nil) { selection.wrappedValue = nil }
                    ForEach(items) { item in
                        chip(title: label(item), isSelected: selection.wrappedValue == item) {
                            selection.wrappedValue = (selection.wrappedValue == item) ? nil : item
                        }
                    }
                }
            }
        }
    }

    private func chip(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background(isSelected ? Theme.brand : Theme.surfaceSecondary, in: Capsule())
                .foregroundStyle(isSelected ? .white : Theme.onSurface)
        }
        .buttonStyle(.plain)
    }
}

/// Detail sheet — the RN library screen had no way to view an exercise's full
/// instructions before adding it to a plan; tapping a row did nothing. Fixed here.
struct ExerciseDetailSheet: View {
    var exercise: Exercise
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        ZStack {
                            Circle().fill(Theme.bandColor(exercise.defaultBand).opacity(0.18))
                            Image(systemName: exercise.imageSystemName).font(.title).foregroundStyle(Theme.bandColor(exercise.defaultBand))
                        }
                        .frame(width: 64, height: 64)
                        VStack(alignment: .leading) {
                            Text(exercise.name).font(.title3.bold())
                            Text("Elastico consigliato: \(exercise.defaultBand.displayName)").font(.subheadline).foregroundStyle(Theme.muted)
                        }
                    }
                    Text("Muscoli coinvolti").font(.headline)
                    Text(exercise.muscleGroups.map(\.displayName).joined(separator: ", "))
                    Text("Come eseguirlo").font(.headline)
                    Text(exercise.instructions)
                }
                .padding()
            }
            .navigationTitle("Dettaglio esercizio")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Chiudi") { dismiss() }
                }
            }
        }
    }
}
