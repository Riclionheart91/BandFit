// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "BandFitKit",
    platforms: [
        .iOS(.v26),
        .watchOS(.v26)
    ],
    products: [
        .library(name: "BandFitKit", targets: ["BandFitKit"])
    ],
    targets: [
        .target(name: "BandFitKit")
    ]
)
