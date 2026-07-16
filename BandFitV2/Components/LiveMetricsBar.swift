import SwiftUI
import BandFitKit

struct LiveMetricsBar: View {
    var metrics: LiveMetrics
    var compact: Bool = false

    var body: some View {
        HStack(spacing: compact ? 10 : 16) {
            pill(icon: "heart.fill", tint: .red, value: metrics.heartRateBPM.map { "\(Int($0))" } ?? "–", unit: "bpm")
            pill(icon: "flame.fill", tint: .orange, value: String(format: "%.0f", metrics.activeCalories), unit: "kcal")
            pill(icon: "drop.fill", tint: .blue, value: metrics.bloodOxygenPercent.map { "\(Int($0 * 100))" } ?? "–", unit: "% SpO2")
            pill(icon: "repeat", tint: .green, value: "\(metrics.reps)", unit: "reps")
        }
    }

    private func pill(icon: String, tint: Color, value: String, unit: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).foregroundStyle(tint).font(.system(size: compact ? 12 : 14))
            VStack(alignment: .leading, spacing: 0) {
                Text(value).font(.system(size: compact ? 13 : 15, weight: .bold))
                if !compact {
                    Text(unit).font(.system(size: 9)).foregroundStyle(Theme.muted)
                }
            }
        }
        .padding(.horizontal, compact ? 8 : 10)
        .padding(.vertical, compact ? 4 : 6)
        .background(Theme.surfaceSecondary, in: Capsule())
    }
}
