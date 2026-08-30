# Patch — 11 nuovi esercizi (analisi lacune libreria)

## File inclusi

```
src/data/exercises.ts             sostituisce il file — 30 esercizi originali invariati + 11 nuovi
migration_new_exercises_gifs.sql  GIF per i nuovi esercizi (da lanciare DOPO la patch3, che crea la tabella)
```

Build validata: `npx tsc --noEmit` zero errori, `npx expo export -p web` riuscita, 14 rotte.

**Prerequisito**: questa patch presuppone che tu abbia già applicato la **patch3** (quella con `migration_exercise_gifs.sql` che crea la tabella `exercise_gifs`). Se non l'hai ancora fatto, applicala prima.

---

## I nuovi esercizi

Ho analizzato tutti i 62 esercizi con elastici disponibili nel database GIF e confrontato con i tuoi 30, cercando **lacune reali** — pattern di movimento o gruppi muscolari completamente assenti, non semplici doppioni.

| id | Nome | Perché colma una lacuna |
|---|---|---|
| `squat` | Squat con Elastico | Zero squat base nella libreria (avevi affondi, kickback, abduzione, ma non il movimento fondamentale) |
| `stiff-leg-deadlift` | Stacco Gambe Tese | Zero pattern hip-hinge/stacco — catena posteriore mai coperta |
| `standing-row` | Rematore in Piedi | Zero tirate orizzontali per la schiena (avevi solo pulldown verticali) |
| `shrug` | Shrug Trapezi | Zero esercizi dedicati ai trapezi |
| `wrist-curl` | Curl Polso | Zero esercizi per avambracci — gruppo muscolare intero mancante |
| `reverse-wrist-curl` | Curl Polso Inverso | Completa la coppia con wrist-curl (flessione + estensione) |
| `leg-extension` | Estensione Quadricipiti | Zero isolamento quadricipiti (solo movimenti compound) |
| `pallof-press` | Pallof Press Orizzontale | Il tuo `woodchopper` è verticale, questo è anti-rotazione orizzontale — core stability diverso |
| `y-raise` | Alzate a Y | Diverso da alzate frontali/laterali, lavora stabilità scapolare |
| `reverse-calf-raise` | Estensione Tibiale | Il tuo `calf-ext` lavora solo plantarflessione, questo bilancia con la dorsiflessione |
| `hip-thrust` | Hip Thrust in Ginocchio | Isolamento glutei puro, diverso da kickback/abduzione |

Tutti verificati con richiesta HTTP reale (200 OK) prima di essere inclusi — nessuna GIF indovinata o non esistente.

---

## Come applicare

```bash
cd /Users/riccardolilliu/Documents/97.webapp/BandFit
```

1. Sostituisci `src/data/exercises.ts` con quello di questo pacchetto
2. **Supabase → SQL Editor**: incolla `migration_new_exercises_gifs.sql` → Run
3. Pubblica:

```bash
git add .
git commit -m "feat: 11 nuovi esercizi (squat, stacco, rematore, avambracci, trapezi...)"
git push

npx expo export -p web
touch dist/.nojekyll
npx gh-pages -d dist -b gh-pages --dotfiles
```

Vai in **Libreria** dopo il deploy: dovresti vedere 41 esercizi totali, gli 11 nuovi con GIF già funzionante.
