-- Extend readonly_mode RLS coverage to report_cards_private.
-- Missed in the initial 20260615000001_readonly_mode.sql migration.

ALTER TABLE public.report_cards_private ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_cards_private_read_all" ON public.report_cards_private
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "report_cards_private_write" ON public.report_cards_private
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());
