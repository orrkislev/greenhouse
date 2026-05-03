-- Update log_report_card_change trigger to also audit pol column changes
CREATE OR REPLACE FUNCTION public.log_report_card_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_changed_fields TEXT[] := '{}';
  v_new_data JSONB;
  v_old_data JSONB;
BEGIN
  v_new_data := to_jsonb(NEW);
  v_old_data := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.ikigai IS DISTINCT FROM NEW.ikigai THEN
      v_changed_fields := array_append(v_changed_fields, 'ikigai');
    END IF;
    IF OLD.mentors IS DISTINCT FROM NEW.mentors THEN
      v_changed_fields := array_append(v_changed_fields, 'mentors');
    END IF;
    IF OLD.liba IS DISTINCT FROM NEW.liba THEN
      v_changed_fields := array_append(v_changed_fields, 'liba');
    END IF;
    IF OLD.learning IS DISTINCT FROM NEW.learning THEN
      v_changed_fields := array_append(v_changed_fields, 'learning');
    END IF;
    IF OLD.vocation IS DISTINCT FROM NEW.vocation THEN
      v_changed_fields := array_append(v_changed_fields, 'vocation');
    END IF;
    IF OLD.special IS DISTINCT FROM NEW.special THEN
      v_changed_fields := array_append(v_changed_fields, 'special');
    END IF;
    IF OLD.pol IS DISTINCT FROM NEW.pol THEN
      v_changed_fields := array_append(v_changed_fields, 'pol');
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR array_length(v_changed_fields, 1) > 0 THEN
    INSERT INTO public.audit_log (
      updating_user,
      entity_type,
      student_id,
      new_data,
      old_data,
      changed_fields
    ) VALUES (
      COALESCE(auth.uid(), NEW.id),
      'report_card',
      NEW.id,
      v_new_data,
      v_old_data,
      CASE
        WHEN TG_OP = 'UPDATE' THEN v_changed_fields
        ELSE ARRAY['created']
      END
    );
  END IF;

  RETURN NEW;
END;
$function$;
