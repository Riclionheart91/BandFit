import Foundation
import BandFitKit

@MainActor
public final class PlanStore: ObservableObject {
    @Published public private(set) var customPlans: [WorkoutPlan] = []

    private var fileURL: URL {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return dir.appendingPathComponent("custom_plans.json")
    }

    public init() { load() }

    public var allPlans: [WorkoutPlan] { PredefinedWorkouts.all + customPlans }

    public func save(_ plan: WorkoutPlan) {
        if let idx = customPlans.firstIndex(where: { $0.id == plan.id }) {
            customPlans[idx] = plan
        } else {
            customPlans.append(plan)
        }
        persist()
    }

    public func delete(_ plan: WorkoutPlan) {
        customPlans.removeAll { $0.id == plan.id }
        persist()
    }

    private func load() {
        guard let data = try? Data(contentsOf: fileURL) else { return }
        customPlans = (try? JSONDecoder().decode([WorkoutPlan].self, from: data)) ?? []
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(customPlans) else { return }
        try? data.write(to: fileURL)
    }
}
