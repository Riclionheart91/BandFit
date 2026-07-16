import SwiftUI
import BandFitKit

struct BuilderView: View {
    var existingPlan: WorkoutPlan?
    @EnvironmentObject var planStore: PlanStore
    @Environment(\.dismiss) var dismiss

    @State private var name: String
    @State private var entries: [WorkoutExerciseEntry]
    @State private var selectedGroup: MuscleGroup? = nil

    init(existingPlan: WorkoutPlan?) {
        self.existingPlan = existingPlan
        _name = State(initialValue: existingPlan?.name ?? "Nuovo allenamento")
        _entries = State(initialValue: existingPlan?.entries ?? [])
    }

    private var candidateExercises: [Exercise] {
        ExerciseLibrary.all.filter { selectedGroup == nil || $0.muscleGroups.contains(selectedGroup!) }
    }

    var body: some View {
        Form {
            Section("Nome") {
                TextField("Nome allenamento", text: $name)
            }

            if !entries.isEmpty {
                Section("Esercizi selezionati") {
                    ForEach($entries) { $entry in
                        if let exercise = ExerciseLibrary.byId[entry.exerciseId] {
                            EntryEditorRow(exercise: exercise, entry: $entry) {
                                entries.removeAll { $0.id == entry.id }
                            }
                        }
                    }
                }
            }

            Section {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        chip(title: "Tutti", isSelected: selectedGroup == nil) { selectedGroup = nil }
                        ForEach(MuscleGroup.allCases) { group in
                            chip(title: group.displayName, isSelected: selectedGroup == group) {
                                selectedGroup = (selectedGroup == group) ? nil : group
                            }
                        }
                    }
                }
                .listRowInsets(EdgeInsets())
                .padding(.horizontal)
                .padding(.vertical, 4)

                ForEach(candidateExercises) { exercise in
                    Button {
                        entries.append(WorkoutExerciseEntry(exerciseId: exercise.id, band: exercise.defaultBand, sets: 3, reps: 12, restSeconds: 45))
                    } label: {
                        ExerciseRow(exercise: exercise, trailing: AnyView(Image(systemName: "plus.circle.fill").foregroundStyle(Theme.brand)))
                    }
                    .buttonStyle(.plain)
                }
            } header: {
                Text("Aggiungi esercizi")
            }
        }
        .navigationTitle(existingPlan == nil ? "Crea allenamento" : "Modifica allenamento")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Annulla") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Salva") {
                    let plan = WorkoutPlan(id: existingPlan?.id ?? UUID(), name: name, entries: entries, isPredefined: false)
                    planStore.save(plan)
                    dismiss()
                }
                .disabled(entries.isEmpty || name.trimmingCharacters(in: .whitespaces).isEmpty)
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

private struct EntryEditorRow: View {
    var exercise: Exercise
    @Binding var entry: WorkoutExerciseEntry
    var onRemove: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(exercise.name).font(.system(size: 15, weight: .semibold))
                Spacer()
                Button(role: .destructive, action: onRemove) {
                    Image(systemName: "trash")
                }
            }
            HStack(spacing: 16) {
                stepper(label: "Serie", value: $entry.sets, range: 1...10)
                stepper(label: "Rip.", value: $entry.reps, range: 1...50)
                stepper(label: "Riposo", value: $entry.restSeconds, range: 0...180, step: 5, suffix: "s")
            }
        }
        .padding(.vertical, 4)
    }

    private func stepper(label: String, value: Binding<Int>, range: ClosedRange<Int>, step: Int = 1, suffix: String = "") -> some View {
        VStack(spacing: 2) {
            Text(label).font(.system(size: 10)).foregroundStyle(Theme.muted)
            HStack(spacing: 6) {
                Button {
                    value.wrappedValue = max(range.lowerBound, value.wrappedValue - step)
                } label: {
                    Image(systemName: "minus.circle.fill")
                }
                Text("\(value.wrappedValue)\(suffix)")
                    .font(.system(size: 13, weight: .bold))
                    .frame(minWidth: 32)
                Button {
                    value.wrappedValue = min(range.upperBound, value.wrappedValue + step)
                } label: {
                    Image(systemName: "plus.circle.fill")
                }
            }
        }
        .buttonStyle(.plain)
    }
}
