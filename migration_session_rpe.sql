-- Migrazione: sforzo percepito (RPE 1-10) per sessione.
-- Per database già creati con setup_supabase.sql. Eseguire PRIMA di pubblicare
-- la versione dell'app che salva l'RPE, altrimenti il sync delle sessioni fallisce.
alter table sessions
  add column if not exists rpe smallint check (rpe between 1 and 10);
