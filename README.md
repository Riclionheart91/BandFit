# BandFit V2 — App nativa iOS 26 + watchOS 26

## Aggiornamento più recente

- **Transizione tra serie più evidente**: banner grande "Serie completata!" con icona,
  riposo minimo garantito di 5 secondi anche se un piano personalizzato ne configura
  meno.
- **Popup di pausa**: mettendo in pausa (da iPhone o da Watch) compare automaticamente
  un avviso con "Riprendi" / "Termina allenamento". Il timer è **davvero** fermo durante
  la pausa (il motore annulla il timer interno, non solo visivamente).
- **Pausa idratazione**: saltando un esercizio parte una pausa di 30s con icona 💧 e
  pulsante "Salta pausa idratazione" per proseguire subito.
- **Consegna più affidabile iPhone→Watch**: l'avvio allenamento ora viaggia anche via
  `updateApplicationContext`/`transferUserInfo`, non solo `sendMessage` — vedi sezione
  dedicata più sotto sul perché questo era necessario.
- **Bug corretto**: i coordinator non inoltravano i cambiamenti dei loro sotto-oggetti
  (motore allenamento, dati salute) a SwiftUI — la UI sembrava "non partire" anche se
  lo stato cambiava correttamente sotto il cofano.

---


Riscrittura completa e nativa (Swift/SwiftUI) dell'app BandFit, con vera app companion
per Apple Watch. Sostituisce la versione Expo/React Native.

## Come aprire il progetto

1. Serve **Xcode 26** (per iOS/watchOS 26 SDK) e **XcodeGen** (`brew install xcodegen`) —
   il progetto è definito in `project.yml`, non c'è un `.xcodeproj` già pronto perché
   generarlo a mano richiede Xcode.
2. Da terminale, nella cartella `BandFitV2/`:
   ```
   xcodegen generate
   open BandFitV2.xcodeproj
   ```
3. In Xcode, seleziona entrambi i target (**BandFitV2** e **BandFitV2WatchApp**) →
   scheda *Signing & Capabilities* → imposta il tuo Team di sviluppo (il Bundle ID
   `com.bandfit.appv2` è solo un placeholder, cambialo se necessario in entrambi i
   target, mantenendo `com.bandfit.appv2.watchkitapp` per il Watch se rinomini quello
   iPhone di conseguenza).
4. Scheme **BandFitV2** → Run su iPhone reale (HealthKit e i sensori non funzionano nel
   simulatore). L'app Watch si installa automaticamente come companion se hai un Apple
   Watch abbinato.

## Cosa fa l'app

- **Home**: allenamenti predefiniti + i tuoi allenamenti custom, avvio rapido, e
  collegamenti diretti a Libreria/Builder (prima mancanti, vedi sotto).
- **Libreria**: 26 esercizi con filtro per gruppo muscolare ed elastico, dettaglio con
  istruzioni (prima il tap non apriva nulla).
- **Builder**: crea/modifica allenamenti personalizzati, con serie/ripetizioni/riposo
  regolabili per ogni esercizio.
- **Allenamento attivo**: timer, progress ring, e — quando indossi l'Apple Watch —
  **battito cardiaco, calorie attive, SpO2 e conteggio ripetizioni in tempo reale**,
  sincronizzati via WatchConnectivity. Senza Watch, l'app usa l'accelerometro
  dell'iPhone come fallback (niente battito/SpO2 in quel caso: l'iPhone non ha un
  sensore PPG).
- **Progressi**: cronologia sessioni da HealthKit — ora con **dettaglio sessione al
  tap**, e pulsante per aggiornare/ripulire la vista (prima lo schermo era
  completamente statico, zero pulsanti).
- **Watch app**: schermata di attesa/avvio allenamento, pagina metriche live (HR,
  calorie, SpO2, ripetizioni), pagina controlli (pausa/riprendi/set completato/salta/
  termina). L'allenamento viene salvato automaticamente su Salute tramite
  `HKWorkoutSession`.

## Come funziona il conteggio ripetizioni

Non esiste un sensore diretto per "una ripetizione con l'elastico", quindi uso un
rilevatore di picchi (`RepDetector` in BandFitKit) sull'accelerometro/giroscopio del
Watch (o dell'iPhone in fallback): ogni esercizio ha un "pattern di movimento"
(pressione verticale, rotazione, tirata laterale, squat) con soglie pre-calibrate. È
una stima ragionevole ma non perfetta al 100% — se in test vedi troppi/pochi conteggi
su un esercizio specifico, possiamo tarare le soglie in `RepDetector.Thresholds`.

## Nota sulla SpO2

L'Apple Watch misura l'ossigenazione **in modo opportunistico** (una lettura ogni
tot minuti in background), non in streaming continuo — e dal 2024 Apple ha dovuto
disattivare la funzione "Ossigeno nel sangue" sui Watch venduti nuovi negli USA per una
disputa brevettuale (i Watch già posseduti e i mercati fuori USA non sono interessati).
L'app mostra l'ultima lettura disponibile; su alcuni Watch/regioni potrebbe restare
vuota.

## Icona adattiva

Ho isolato la grafica degli elastici dallo sfondo bianco che mi hai mandato e creato
tre varianti nell'asset catalog (`AppIcon.appiconset`, sia per iPhone che per Watch):
chiara, scura (sfondo nero) e "tinted". iOS/watchOS sceglie automaticamente quella
scura in Dark Mode — nessun codice necessario, è gestito dal sistema.

## Struttura del progetto

```
BandFitV2/
  project.yml                 ← spec XcodeGen (genera il .xcodeproj)
  BandFitKit/                 ← Swift Package condiviso (modelli, motore allenamento,
                                 protocollo messaggi Watch<->iPhone, rilevatore ripetizioni)
  Shared/                     ← file compilati in entrambi i target (motion manager)
  BandFitV2/                  ← app iPhone (SwiftUI)
  BandFitV2WatchApp/        ← app Watch (SwiftUI + HealthKit + CoreMotion)
```
