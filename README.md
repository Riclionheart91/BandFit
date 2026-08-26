# BandFit — Web App (PWA) con Supabase e Google Auth

Guida completa per installare, configurare e pubblicare la webapp su GitHub Pages, partendo da questo pacchetto già pronto.

Questo progetto è **universale**: stessa codebase per iOS nativo (cartella `ios/`, HealthKit, EventKit — invariati) e per il web (Supabase, Google Login, Audio Coach, IA periodizzazione). Metro sceglie automaticamente i file giusti in base alla piattaforma di build (`health.web.ts` vs `health.ts`, ecc.), quindi non stai "buttando via" la parte iOS.

Il README originale del progetto è conservato in `README_ORIGINAL.md`.

---

## 0. Cosa contiene questo pacchetto

```
app/                          rotte Expo Router (schermate)
  (tabs)/
    index.tsx                 Home
    library.tsx                Libreria esercizi
    active.tsx                 Allenamento attivo (+ step RPE per il piano IA)
    progress.tsx                Progresso
    profile.tsx                 NUOVO — login Google, Battery Saver, piano 6 settimane
    _layout.tsx                 Tab bar (aggiunta tab Profilo)
  builder.tsx                  Creazione scheda personalizzata (invariato, già presente)
  _layout.tsx                  Layout radice (aggiunto DisclaimerGate)
  +html.tsx                    Shell HTML (aggiunti meta PWA + manifest)
  index.tsx                    Redirect radice (invariato)

src/
  config.ts                    NUOVO — centralizzazione totale impostazioni/testi
  theme.ts, data/*, services/workoutEngine.ts, storage.ts   invariati
  services/health.ts, calendar.ts                            invariati (solo nativi)
  services/health.web.ts, calendar.web.ts                     NUOVI — stub web
  services/externalDisplay.ts                                 invariato (nativo, mirroring TV)
  services/externalDisplay.web.ts                              NUOVO — soglia breakpoint desktop
  services/cloudStorage.ts, cloudStorage.web.ts                NUOVI — Supabase (web) / no-op (nativo)
  services/periodization.ts                                    NUOVO — motore IA mesociclo 6 settimane
  context/WorkoutContext.tsx                                   esteso (audio coach, IA, cloud sync)
  components/DisclaimerGate.tsx                                NUOVO — consenso medico bloccante
  components/Timer.tsx, MobileWorkoutController.tsx, TVWorkoutView.tsx, HeartRateDisplay.tsx, ExerciseCard.tsx   invariati

public/manifest.json, public/icons/                           NUOVI — PWA installabile
setup_supabase.sql                                            script SQL completo (tabelle + RLS + storage)
.env.example                                                  template variabili ambiente
app.json, package.json                                        aggiornati (vedi sezioni sotto)
```

Build già validata in questa sessione: `npm install` ✅, `npx tsc --noEmit` (zero errori) ✅, `npx expo export -p web` ✅ (13 rotte generate, manifest e icone PWA confermate nell'output).

---

## 1. Prerequisiti

| Tool | Verifica |
|---|---|
| Node.js 18+ | `node -v` |
| npm | `npm -v` |
| Git | `git -v` |
| Account GitHub | — |
| Account Supabase | https://supabase.com |
| Account Google Cloud | https://console.cloud.google.com |

**Nota permessi npm (macOS):** se in passato hai usato `sudo npm install -g`, la cache `~/.npm` potrebbe avere permessi root e dare errori `EACCES`/`EEXIST`. Se capita:
```bash
sudo chown -R $(whoami) ~/.npm
```
Non usare mai più `sudo` con npm — non serve, tutti i comandi di questa guida girano da utente normale.

---

## 2. Posiziona il progetto

Estrai lo zip in una cartella a tua scelta, es.:
```bash
cd /Users/TUO_UTENTE/Documents/BandFit
```
Da qui in poi tutti i comandi si intendono lanciati **dalla root di questa cartella** — verificalo sempre con `pwd` prima di ogni blocco di comandi se hai più terminali aperti.

---

## 3. Repository Git + GitHub

```bash
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
```

Crea il repo remoto (serve `gh` CLI: `brew install gh && gh auth login` se non ce l'hai):
```bash
gh repo create BandFit --public --source=. --remote=origin --push
```
**Importante:** il repo deve essere **pubblico** per usare GitHub Pages gratuitamente su un account personale (a meno che tu non abbia GitHub Pro/Team).

---

## 4. Installa le dipendenze

```bash
npm install
```

Se vedi warning gialli su pacchetti deprecati o vulnerabilità moderate/alte in dipendenze transitive: **normale**, non bloccano nulla. **Non lanciare** `npm audit fix --force` — su progetti Expo spesso disallinea le versioni pinnate dall'SDK.

---

## 5. Crea il progetto Supabase

1. https://supabase.com/dashboard → **New Project** → scegli nome, password DB, regione.
2. **Project Settings → API**: copia **Project URL** e **anon public key**.
3. **SQL Editor → New query**: incolla **tutto** il contenuto di `setup_supabase.sql` incluso in questo pacchetto → **Run**.

Questo unico script crea:
- tabelle `sessions`, `custom_workouts`, `weekly_programs` con le colonne esatte usate dal codice (verificate contro i tipi reali `Session`/`Workout`/`WeeklyProgram`)
- indici, trigger `updated_at`
- Row Level Security con policy separate select/insert/update/delete (ogni utente vede solo i propri dati)
- bucket storage pubblico `gifs` per le GIF degli esercizi

È idempotente: puoi rilanciarlo senza errori se già eseguito una volta.

---

## 6. Configura Google OAuth

### 6.1 Google Cloud Console
1. https://console.cloud.google.com/ → nuovo progetto (es. `BandFit`).
2. **API e servizi → Schermata consenso OAuth** → Tipo utente **Esterno** → compila nome app/email → Salva.
3. **API e servizi → Credenziali → Crea credenziali → ID client OAuth**:
   - Tipo: **Applicazione web**
   - **Origini JavaScript autorizzate**: `http://localhost:8081` + `https://TUO-USER.github.io`
   - **URI di reindirizzamento autorizzati**: `https://TUO-PROJECT-REF.supabase.co/auth/v1/callback`
   - Crea → copia **Client ID** e **Client Secret**

### 6.2 Collega Google a Supabase
**Authentication → Providers → Google** → attiva → incolla Client ID/Secret → Salva.

### 6.3 Redirect URL
**Authentication → URL Configuration**:
- **Site URL**: `https://TUO-USER.github.io/BandFit/`
- **Redirect URLs**: aggiungi sia quello sopra sia `http://localhost:8081`

Nota: Google non offre un modo per creare un client OAuth "Applicazione Web" via CLI/script — questi passaggi vanno fatti dalla Console.

---

## 7. Variabili d'ambiente

```bash
cp .env.example .env
```

Apri `.env` e sostituisci i placeholder con i valori reali di Supabase/redirect:
```bash
nano .env
```
oppure `code .env` se usi VS Code. Il file `.env` è già escluso da `.gitignore` — non va mai committato.

---

## 8. Test in locale

```bash
npx expo start --web
```

Apri `http://localhost:8081`. Checklist:
1. Compare il disclaimer medico bloccante → **Accetto**
2. Tab **Profilo** → **Accedi con Google** → dopo il login compare "Sincronizzato con il cloud"
3. In Profilo, genera un piano (`2x`/`3x`/`4x`) → compare "Settimana 1/6 · Attivo" + pulsante "Inizia l'allenamento di oggi"
4. Attiva/disattiva **Risparmio Batteria**
5. Avvia un allenamento (dalla Home o dal piano) → l'Audio Coach annuncia vocalmente cambio esercizio/riposo (controlla il volume del browser)
6. Ridimensiona la finestra oltre 1024px → il layout passa alla vista TV orizzontale
7. Cambia scheda per qualche secondo durante un allenamento attivo e torna → il timer recupera il tempo trascorso
8. Termina un allenamento generato dal piano IA → compare lo step RPE (1-10) → verifica su Supabase (**Table Editor → sessions**) che la riga sia salvata

---

## 9. GIF degli esercizi (opzionale)

1. **Supabase → Storage** → il bucket `gifs` è già stato creato dallo script SQL come pubblico.
2. Carica un file `<id>.gif` per ogni esercizio in `src/data/exercises.ts` (campo `id`, es. `thruster.gif`).
3. L'URL pubblico del bucket va in `EXPO_PUBLIC_CDN_BASE_URL` nel `.env`.

Senza GIF caricate l'app funziona comunque, mostra solo un placeholder.

---

## 10. Build di produzione

```bash
npx expo export -p web
```

`app.json` è già configurato con `experiments.baseUrl: "/BandFit"` per servire correttamente l'app sotto `https://TUO-USER.github.io/BandFit/`. **Se rinomini il repository**, aggiorna questo valore di conseguenza prima della build.

---

## 11. Deploy su GitHub Pages

```bash
npx gh-pages -d dist -b gh-pages
```

(la prima volta scarica il pacchetto `gh-pages` automaticamente via `npx`, nessuna installazione globale necessaria)

Poi attiva Pages:
```bash
gh api -X PUT repos/TUO-USER/BandFit/pages -f "source[branch]=gh-pages" -f "source[path]=/"
```
Se risponde che la risorsa non esiste ancora, usa `-X POST` invece di `-X PUT`.

**Nota zsh:** i flag con parentesi quadre come `source[branch]=...` vanno sempre tra virgolette — senza, zsh li interpreta come pattern glob e fallisce con `no matches found`.

Dopo 1-2 minuti l'app è live su `https://TUO-USER.github.io/BandFit/`.

---

## 12. Automazione opzionale (GitHub Actions)

Crea `.github/workflows/deploy.yml`:
```yaml
name: Deploy Web
on:
  push:
    branches: [main]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npx expo export -p web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
          EXPO_PUBLIC_AUTH_REDIRECT_URL: ${{ secrets.EXPO_PUBLIC_AUTH_REDIRECT_URL }}
          EXPO_PUBLIC_CDN_BASE_URL: ${{ secrets.EXPO_PUBLIC_CDN_BASE_URL }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```
Aggiungi i 4 secrets in **Settings → Secrets and variables → Actions** con gli stessi valori del tuo `.env`.

---

## 13. Risoluzione problemi comuni

| Problema | Causa | Soluzione |
|---|---|---|
| `EACCES`/`EEXIST` su `npm install` | Cache npm con permessi root da un `sudo` precedente | `sudo chown -R $(whoami) ~/.npm` |
| `git checkout` si rifiuta per `.DS_Store` | File macOS tracciato per errore | È già in `.gitignore`; se persiste: `git rm --cached .DS_Store` |
| Pagina bianca dopo login Google | `redirect_uri_mismatch` | Verifica che URL in Google Console, Supabase e `.env` coincidano esattamente (slash finale incluso) |
| Audio Coach muto | Browser blocca `speechSynthesis` senza interazione utente | Parte solo dopo un tap; controlla anche il volume di sistema |
| Wake Lock non attivo | Browser non supportato o pagina non HTTPS | GitHub Pages è già HTTPS; in locale `localhost` è considerato sicuro |
| 404 sugli asset dopo il deploy | `baseUrl` in `app.json` non coincide col nome del repo | Vedi punto 10 |
| RLS error su Supabase | Policy non create o utente non loggato | Rilancia `setup_supabase.sql`, verifica login effettuato |
| `no matches found: source[branch]=...` (zsh) | Flag non quotato | Vedi punto 11, usa le virgolette |

---

## 14. Nota sul preinstall script

`package.json` esegue `./scripts/check-pkg.js` come step `preinstall` (blocca l'installazione di alcuni pacchetti nativi non più supportati). Se `npm install` fallisce con un errore di permessi su questo script:
```bash
chmod +x scripts/*.js scripts/*.sh
```
