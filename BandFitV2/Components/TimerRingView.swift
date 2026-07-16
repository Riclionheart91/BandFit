import SwiftUI

struct TimerRingView: View {
    var progress: Double
    var color: Color
    var primaryText: String
    var secondaryText: String

    var body: some View {
        ZStack {
            Circle()
                .stroke(Theme.surfaceSecondary, lineWidth: 14)
            Circle()
                .trim(from: 0, to: min(1, max(0, progress)))
                .stroke(color, style: StrokeStyle(lineWidth: 14, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.3), value: progress)
            VStack(spacing: 4) {
                Text(primaryText)
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.onSurface)
                Text(secondaryText)
                    .font(.system(size: 13, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(Theme.muted)
            }
        }
        .frame(width: 220, height: 220)
    }
}
