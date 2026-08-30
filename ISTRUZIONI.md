# Patch — GIF esercizi reali (hotlink, zero storage) + fix precedenti

## File inclusi

```
migration_exercise_gifs.sql          NUOVO — lancia questo su Supabase
src/services/exerciseGifs.web.ts     NUOVO — recupera le gif da Supabase, cache locale 7gg
src/services/exerciseGifs.ts         NUOVO — stub nativo
src/services/cloudStorage.ts         aggiunto getClient() allo stub nativo (richiesto dal punto sopra)
src/components/ExerciseCard.tsx      mostra la gif al posto dell'icona quando disponibile
app/(tabs)/library.tsx               carica le gif e le passa alle card (include anche il fix FAB della patch precedente)
app/(tabs)/active.tsx                mostra la gif grande dell'esercizio corrente, la nasconde a riposo se Risparmio Batteria è attivo
```

Build validata: `npx tsc --noEmit` zero errori, `npx expo export -p web` riuscita, 14 rotte generate.

---

## Come ho trovato le GIF (metodo, non solo risultato)

Ho cercato database di esercizi gratuiti, hotlinkabili, senza costi di storage. La scelta migliore: **[ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB)** — 1323 esercizi, serviti gratis via jsDelivr CDN direttamente da GitHub, nessuna chiave API, nessun limite di richieste, categoria attrezzatura `band` dedicata.

Ho scaricato i dati reali (non indovinato nulla) e verificato **uno per uno** che i file GIF esistano davvero (richiesta HTTP con risposta 200 per tutti e 28):

- **22 esercizi** hanno un match diretto con variante a elastico (es. `Band Bench Press`, `Band Front Raise`, `Band Bicycle Crunch`)
- **6 esercizi** non avevano un equivalente a elastico nel database, ho usato il miglior movimento equivalente con cavo o corpo libero (es. `chest-fly` → `Cable Standing Fly`, `monster-walk` → `Monster Walk` a corpo libero)
- **2 esercizi senza alcun match utile**: `thruster` (movimento combinato squat+spinta, nessuna voce corrispondente nel database) e `hip-flexion` (solo stretching trovato, nessun esercizio di forza equivalente) — questi restano senza GIF, mostrano l'icona come prima

## Nota legale sulla fonte

L'autore del database dichiara esplicitamente di aver raccolto le immagini da internet **senza rivendicarne i diritti d'autore**. È una zona grigia comune a molte librerie gratuite di questo tipo (stessa situazione di ExerciseDB, la più usata del settore). Va bene per un progetto personale; se in futuro vuoi pubblicare l'app commercialmente, andrebbe sostituita con una fonte a licenza chiara (es. un pacchetto a pagamento con licenza esplicita, o GIF create ad hoc).

---

## Come si aggiornano in futuro

Le GIF **non sono nel codice** — sono in una tabella Supabase (`exercise_gifs`), l'app le scarica una volta e le mette in cache locale per 7 giorni. Per cambiare/aggiungere una GIF basta modificare la riga nella tabella su Supabase, senza toccare il codice o ripubblicare l'app.

---

## Come applicare

### 1. Lancia la migrazione SQL
**Supabase → SQL Editor → New query**, incolla tutto `migration_exercise_gifs.sql` → **Run**.

Crea la tabella `exercise_gifs` (pubblica in lettura, come le GIF stesse) e inserisce le 28 righe verificate.

### 2. Sostituisci i file
Copia i 7 file di questo pacchetto nei rispettivi percorsi. Due sono nuovi (`exerciseGifs.ts`, `exerciseGifs.web.ts`), gli altri sono sostituzioni.

### 3. Pubblica
```bash
cd /Users/riccardolilliu/Documents/97.webapp/BandFit
git add .
git commit -m "feat: gif esercizi reali via hotlink, zero storage"
git push

npx expo export -p web
touch dist/.nojekyll
npx gh-pages -d dist -b gh-pages --dotfiles
```

### 4. Testa
- **Libreria**: le card mostrano la GIF al posto dell'icona (dove disponibile)
- **Allenamento attivo**: GIF grande sopra il nome dell'esercizio
- **Risparmio Batteria attivo** (Profilo): durante il riposo tra le serie, la GIF sparisce (risparmio dati/batteria reale, non solo un'etichetta)
