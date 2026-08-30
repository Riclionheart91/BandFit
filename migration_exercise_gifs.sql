-- Migrazione: aggiunge GIF esercizi (hotlink, zero storage)
-- Fonte: JahelCuadrado/ExerciseGymGifsDB (github + jsDelivr CDN, gratuito)
-- 28/30 esercizi con match verificato (22 varianti con elastici, 6 con equivalente cavo/corpo libero)

create table if not exists exercise_gifs (
  exercise_id text primary key,
  gif_url text not null,
  source_equipment text not null,
  source_name text not null
);

alter table exercise_gifs enable row level security;

drop policy if exists "exercise_gifs_public_read" on exercise_gifs;
create policy "exercise_gifs_public_read" on exercise_gifs
  for select using (true);

insert into exercise_gifs (exercise_id, gif_url, source_equipment, source_name) values
  ('std-chest-press', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/pectorals/band-bench-press.gif', 'band', 'Band Bench Press'),
  ('chest-fly', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/pectorals/cable-standing-fly.gif', 'cable', 'Cable Standing Fly'),
  ('push-up', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/triceps/band-close-grip-push-up.gif', 'band', 'Band Close Grip Push Up'),
  ('bicep-curl', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/biceps/band-alternating-biceps-curl.gif', 'band', 'Band Alternating Biceps Curl'),
  ('tricep-pushdown', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/triceps/cable-pushdown.gif', 'cable', 'Cable Pushdown'),
  ('tricep-kickback', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/triceps/band-side-triceps-extension.gif', 'band', 'Band Side Triceps Extension'),
  ('overhead-tricep', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/triceps/cable-high-pulley-overhead-tricep-extension.gif', 'cable', 'Cable High Pulley Overhead Tricep Extension'),
  ('single-lat-pulldown', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/lats/band-kneeling-one-arm-pulldown.gif', 'band', 'Band Kneeling One Arm Pulldown'),
  ('lat-pulldown', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/lats/band-close-grip-pulldown.gif', 'band', 'Band Close Grip Pulldown'),
  ('upright-row', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/cable-upright-row.gif', 'cable', 'Cable Upright Row'),
  ('face-pull', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/band-reverse-fly.gif', 'band', 'Band Reverse Fly'),
  ('shoulder-press', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/band-shoulder-press.gif', 'band', 'Band Shoulder Press'),
  ('ext-rotation', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/cable-standing-shoulder-external-rotation.gif', 'cable', 'Cable Standing Shoulder External Rotation'),
  ('front-raise', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/band-front-raise.gif', 'band', 'Band Front Raise'),
  ('lateral-raise', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/band-front-lateral-raise.gif', 'band', 'Band Front Lateral Raise'),
  ('kneel-crunch', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-kneeling-twisting-crunch.gif', 'band', 'Band Kneeling Twisting Crunch'),
  ('crunch', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-standing-crunch.gif', 'band', 'Band Standing Crunch'),
  ('reverse-crunch', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/reverse-crunch.gif', 'bodyweight', 'Reverse Crunch'),
  ('sit-up', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-jack-knife-sit-up.gif', 'band', 'Band Jack Knife Sit Up'),
  ('russian-twist', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-seated-twist.gif', 'band', 'Band Seated Twist'),
  ('woodchopper', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-vertical-pallof-press.gif', 'band', 'Band Vertical Pallof Press'),
  ('bicycle-crunch', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/band-bicycle-crunch.gif', 'band', 'Band Bicycle Crunch'),
  ('side-bend', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/45-side-bend.gif', 'bodyweight', '45 Side Bend'),
  ('hip-abduction', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abductors/resistance-band-seated-hip-abduction.gif', 'band', 'Resistance Band Seated Hip Abduction'),
  ('std-kickback', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/glutes/band-bent-over-hip-extension.gif', 'band', 'Band Bent Over Hip Extension'),
  ('lunge', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/band-single-leg-split-squat.gif', 'band', 'Band Single Leg Split Squat'),
  ('monster-walk', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/glutes/monster-walk.gif', 'bodyweight', 'Monster Walk'),
  ('calf-ext', 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/calves/band-single-leg-calf-raise.gif', 'band', 'Band Single Leg Calf Raise')
on conflict (exercise_id) do update set
  gif_url = excluded.gif_url,
  source_equipment = excluded.source_equipment,
  source_name = excluded.source_name;