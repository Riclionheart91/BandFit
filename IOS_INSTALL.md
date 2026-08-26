# Band Fit — Installazione su iOS via Xcode

Guida completa per installare Band Fit sul tuo iPhone usando MacBook + Xcode, senza App Store.

## Requisiti

- macOS con **Xcode 15+** installato (App Store gratis)
- **Apple ID** (anche gratuito basta per installare sul TUO iPhone — durata 7 giorni)
- Apple Developer Account a pagamento ($99/anno) consigliato per durata 1 anno
- Node.js 20+ e Yarn installati sul Mac
- Cavo USB-C/Lightning per collegare l'iPhone al Mac

## Step 1 — Salva il codice da Emergent

1. Su Emergent clicca **"Save to GitHub"** (in alto a destra)
2. Crea il repository e fai push
3. Sul Mac, clona:
   ```bash
   git clone https://github.com/<tuo-user>/<tuo-repo>.git band-fit
   cd band-fit/frontend
   ```

## Step 2 — Installa dipendenze

```bash
yarn install
```

## Step 3 — Genera la cartella iOS nativa

Expo userà `app.json` + il plugin `withHealthKitBridge` per:
- Generare `ios/BandFit.xcworkspace`
- Copiare `HealthKitBridge.h/.m` nella project root
- Linkare `HealthKit.framework`
- Configurare entitlements + Info.plist

```bash
npx expo prebuild --platform ios --clean
cd ios
pod install
cd ..
```

## Step 4 — Apri in Xcode

```bash
open ios/BandFit.xcworkspace
```

⚠️ **Apri sempre `.xcworkspace`, MAI `.xcodeproj`** (CocoaPods non funzionerà).

## Step 5 — Configura Signing & Capabilities

1. In Xcode, seleziona il target **BandFit** nel project navigator
2. Tab **Signing & Capabilities**:
   - **Team**: scegli il tuo Apple ID Personal Team (o developer team)
   - **Bundle Identifier**: cambialo in qualcosa di unico, es. `com.tuonome.bandfit`
   - **Automatically manage signing**: ✅ ON
3. Verifica che siano già presenti:
   - **HealthKit** capability (aggiunto dal plugin)
   - **Background Modes** → Workout processing
   - Se mancano, clicca **+ Capability** e aggiungili manualmente

## Step 6 — Collega l'iPhone

1. Collega l'iPhone al Mac via cavo
2. Sull'iPhone: **Impostazioni → Privacy e sicurezza → Modalità sviluppatore** → **ON** (richiede riavvio)
3. In Xcode in alto, seleziona il tuo iPhone come destinazione (non un simulatore)

## Step 7 — Compila e installa

Premi **▶︎ (Run)** o `Cmd+R`.

Xcode farà:
1. Compilazione (5-10 minuti la prima volta)
2. Installazione dell'app sull'iPhone
3. Lancio automatico

Se vedi errore "Untrusted Developer" sull'iPhone:
- Impostazioni → Generali → **VPN e gestione dispositivo** → Apple Development: tuo@email.com → **Autorizza**

## Step 8 — Verifica HealthKit

1. All'avvio l'app chiederà permessi: Calendario, HealthKit, Motion → autorizza
2. Indossa un Apple Watch e avvia un allenamento → il BPM deve apparire al posto di "–"
3. Termina l'allenamento → verifica che la sessione appaia in **Salute** > Allenamenti

## Generare un IPA per condivisione (opzionale)

Per condividere con altri tester senza App Store:

1. In Xcode: **Product → Archive** (con destinazione "Any iOS Device")
2. Al termine si apre Organizer → **Distribute App**
3. Scegli:
   - **Development**: per dispositivi del tuo team (max 100 UDID/anno)
   - **Ad Hoc**: per tester esterni (UDID registrati)
   - **TestFlight & App Store**: per beta esterna su TestFlight
4. Esporta `.ipa`
5. Distribuisci via:
   - **TestFlight** (consigliato, gratis)
   - **Apple Configurator 2** + cavo USB
   - Servizi come **diawi.com** o **InstallOnAir**

## Build durata limitata (Apple ID gratuito)

Se usi un Apple ID gratuito (senza $99/anno):
- App scade dopo **7 giorni** sull'iPhone
- Massimo 3 app contemporaneamente
- Devi ricompilare via Xcode ogni settimana
- ✅ HealthKit funziona ugualmente

Con Developer Account a pagamento:
- App valida **1 anno** prima del rinnovo
- Distribuzione TestFlight illimitata
- Ad-Hoc fino a 100 dispositivi/anno

## Troubleshooting

| Errore | Soluzione |
|--------|-----------|
| `pod install` fallisce | `sudo gem install cocoapods`, poi `cd ios && pod repo update && pod install` |
| Xcode non vede l'iPhone | Sblocca iPhone + "Fidati di questo computer" |
| "Failed to create provisioning profile" | Cambia il Bundle ID con uno univoco |
| "HealthKit entitlement missing" | Verifica capability in Signing & Capabilities |
| App crash all'avvio | Verifica che `HealthKitBridge.m` sia nel target (Target Membership) |
| HealthKit permission denied | Impostazioni iPhone → Salute → Accesso e dispositivi → Band Fit |

## File chiave del progetto

- `app.json` — configurazione Expo + plugin HealthKit
- `plugins/withHealthKitBridge.js` — config plugin che inietta il bridge
- `ios/HealthKitBridge.h/.m` — codice nativo Objective-C
- `src/services/health.ts` — JS layer che chiama il bridge
