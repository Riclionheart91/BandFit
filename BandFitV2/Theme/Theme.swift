import SwiftUI
import BandFitKit

/// All colors are semantic/dynamic so the whole UI automatically follows the system
/// Light/Dark appearance — in Dark Mode the background goes to true black (like the
/// original app's forced-dark theme), in Light Mode it's a clean white/gray surface.
public enum Theme {
    public static let surface = Color(uiColor: .init(dynamicProvider: { trait in
        trait.userInterfaceStyle == .dark ? .black : .white
    }))

    public static let surfaceSecondary = Color(uiColor: .init(dynamicProvider: { trait in
        trait.userInterfaceStyle == .dark ? UIColor(white: 0.11, alpha: 1) : UIColor(white: 0.95, alpha: 1)
    }))

    public static let onSurface = Color(uiColor: .label)
    public static let muted = Color(uiColor: .secondaryLabel)
    public static let brand = Color(red: 0.90, green: 0.28, blue: 0.30) // matches band red
    public static let warning = Color(red: 0.96, green: 0.85, blue: 0.04)
    public static let success = Color(red: 0.19, green: 0.65, blue: 0.42)

    public static func bandColor(_ band: BandStrength) -> Color {
        Color(hex: band.hex)
    }
}

public extension Color {
    init(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&rgb)
        let r = Double((rgb & 0xFF0000) >> 16) / 255
        let g = Double((rgb & 0x00FF00) >> 8) / 255
        let b = Double(rgb & 0x0000FF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
