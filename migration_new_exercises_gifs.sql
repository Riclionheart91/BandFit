-- Migrazione: aggiunge le GIF per gli 11 nuovi esercizi
-- (colma le lacune trovate nell_analisi di settore: squat, hip-hinge, rematore,
-- trapezi, avambracci, quadricipiti isolati, pallof press orizzontale, y-raise,
-- tibiale anteriore, hip thrust)

insert into exercise_gifs (exercise_id, gif_url, source_equipment, source_name) values
  ('squat', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/glutes/band-squat.gif', 'band', 'Band Squat'),
  ('stiff-leg-deadlift', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/spine/band-straight-leg-deadlift.gif', 'band', 'Band Straight Leg Deadlift'),
  ('standing-row', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/upper-back/band-one-arm-standing-low-row.gif', 'band', 'Band One Arm Standing Low Row'),
  ('shrug', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/traps/band-shrug.gif', 'band', 'Band Shrug'),
  ('wrist-curl', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/forearms/band-wrist-curl.gif', 'band', 'Band Wrist Curl'),
  ('reverse-wrist-curl', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/forearms/band-reverse-wrist-curl.gif', 'band', 'Band Reverse Wrist Curl'),
  ('leg-extension', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/resistance-band-leg-extension.gif', 'band', 'Resistance Band Leg Extension'),
  ('pallof-press', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-horizontal-pallof-press.gif', 'band', 'Band Horizontal Pallof Press'),
  ('y-raise', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/band-y-raise.gif', 'band', 'Band Y Raise'),
  ('reverse-calf-raise', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/calves/band-single-leg-reverse-calf-raise.gif', 'band', 'Band Single Leg Reverse Calf Raise'),
  ('hip-thrust', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/glutes/resistance-band-hip-thrusts-on-knees-female.gif', 'band', 'Resistance Band Hip Thrusts On Knees Female')
on conflict (exercise_id) do update set
  gif_url = excluded.gif_url,
  source_equipment = excluded.source_equipment,
  source_name = excluded.source_name;