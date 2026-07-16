import SwiftUI
import BandFitKit

struct WorkoutPlanRow: View {
    var plan: WorkoutPlan
    var onStart: () -> Void
    var onEdit: (() -> Void)? = nil
    var onDelete: (() -> Void)? = nil

    var body: some View {
        Button(action: onStart) {
            HStack(spacing: 12) {
                Image(systemName: "play.circle.fill")
                    .font(.title2)
                    .foregroundStyle(Theme.brand)
                VStack(alignment: .leading, spacing: 2) {
                    Text(plan.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Theme.onSurface)
                    Text("\(plan.entries.count) esercizi · ~\(plan.estimatedMinutes) min")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.muted)
                }
                Spacer()
                Image(systemName: "chevron.right").foregroundStyle(Theme.muted)
            }
            .padding(14)
            .background(Theme.surfaceSecondary, in: RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
        .contextMenu {
            if let onEdit, !plan.isPredefined {
                Button("Modifica", systemImage: "pencil", action: onEdit)
            }
            if let onDelete, !plan.isPredefined {
                Button("Elimina", systemImage: "trash", role: .destructive, action: onDelete)
            }
        }
    }
}

struct ExerciseRow: View {
    var exercise: Exercise
    var trailing: AnyView? = nil

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(Theme.bandColor(exercise.defaultBand).opacity(0.18))
                Image(systemName: exercise.imageSystemName)
                    .foregroundStyle(Theme.bandColor(exercise.defaultBand))
            }
            .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: 2) {
                Text(exercise.name)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.onSurface)
                Text(exercise.muscleGroups.map(\.displayName).joined(separator: ", "))
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.muted)
            }
            Spacer()
            if let trailing { trailing }
        }
        .padding(.vertical, 6)
    }
}
