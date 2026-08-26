/**
 * withHealthKitBridge.js
 *
 * Expo Config Plugin che:
 * 1. Copia HealthKitBridge.h e HealthKitBridge.m dalla cartella `/ios` del progetto
 *    nella cartella nativa generata da `expo prebuild` (es. ios/BandFit/).
 * 2. Registra entrambi i file nel target principale dell'Xcode project.
 * 3. Aggiunge il framework HealthKit.framework al target.
 *
 * Uso: già referenziato in app.json sotto "plugins".
 */
const { withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SOURCE_FILES = ["HealthKitBridge.h", "HealthKitBridge.m"];

function copySource(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const projectName = cfg.modRequest.projectName; // es. BandFit
      const iosDir = cfg.modRequest.platformProjectRoot; // .../ios
      const destDir = path.join(iosDir, projectName);
      const srcDir = path.join(cfg.modRequest.projectRoot, "ios");

      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      for (const fname of SOURCE_FILES) {
        const src = path.join(srcDir, fname);
        const dst = path.join(destDir, fname);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }
      return cfg;
    },
  ]);
}

function registerInXcode(config) {
  return withXcodeProject(config, async (cfg) => {
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName;

    // Add files to project
    for (const fname of SOURCE_FILES) {
      const exists = project.hasFile(`${projectName}/${fname}`);
      if (!exists) {
        project.addSourceFile(
          `${projectName}/${fname}`,
          { target: project.getFirstTarget().uuid }
        );
      }
    }

    // Link HealthKit.framework
    project.addFramework("HealthKit.framework", {
      target: project.getFirstTarget().uuid,
    });

    return cfg;
  });
}

module.exports = function withHealthKitBridge(config) {
  config = copySource(config);
  config = registerInXcode(config);
  return config;
};
