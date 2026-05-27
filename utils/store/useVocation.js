import { create } from "zustand";
import { createDataLoadingHook, createStoreActions, withUser } from "./utils/storeUtils";
import { supabase } from "../supabase/client";
import { useUser, isVocationStaff } from "./useUser";
import { toastsActions } from "./useToasts";
import { format } from "date-fns";

export const useVocationData = create((set, get) => {
    useUser.subscribe(state => state.user?.id, () => {
        set({ jobs: [], checkins: [], allVocations: [] });
    });

    return {
        jobs: [],
        checkins: [],
        allVocations: [],
        staffCheckins: [],   // all checkins for the selected month, staff view

        // ── Student: vocation ────────────────────────────────────────────
        loadJobs: withUser(async (user) => {
            set({ jobs: [] });
            const { data, error } = await supabase
                .from('vocation')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true);
            if (error) { toastsActions.addFromError(error, 'שגיאה בטעינת תעסוקה'); return; }
            set({ jobs: data });
        }),

        updateJob: async (job, updates) => {
            const { error } = await supabase.from('vocation').update(updates).eq('id', job.id);
            if (error) { toastsActions.addFromError(error, 'שגיאה בעדכון תעסוקה'); return; }
            set({ jobs: get().jobs.map(j => j.id === job.id ? { ...j, ...updates } : j) });
        },

        // ── Student: check-ins ───────────────────────────────────────────
        loadCheckins: withUser(async (user) => {
            const { data, error } = await supabase
                .from('vocation_checkins')
                .select('*')
                .eq('user_id', user.id)
                .order('checkin_date', { ascending: false })
                .limit(60);
            if (error) { toastsActions.addFromError(error, 'שגיאה בטעינת נוכחות'); return; }
            set({ checkins: data });
        }),

        checkIn: withUser(async (user, vocationId, hours = null, date = null) => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const checkinDate = date ?? today;
            const payload = {
                vocation_id: vocationId,
                user_id: user.id,
                checkin_date: checkinDate,
                hours: hours !== null && hours !== '' ? parseFloat(hours) : null,
                is_retroactive: checkinDate !== today,
            };
            const { data, error } = await supabase
                .from('vocation_checkins')
                .upsert(payload, { onConflict: 'user_id,checkin_date' })
                .select()
                .single();
            if (error) { toastsActions.addFromError(error, 'שגיאה בשמירת נוכחות'); return null; }
            const existing = get().checkins.find(c => c.checkin_date === checkinDate);
            if (existing) {
                set({ checkins: get().checkins.map(c => c.checkin_date === checkinDate ? data : c) });
            } else {
                set({ checkins: [data, ...get().checkins] });
            }
            return data;
        }),

        deleteCheckin: withUser(async (user, checkinId) => {
            const { error } = await supabase
                .from('vocation_checkins')
                .delete()
                .eq('id', checkinId)
                .eq('user_id', user.id);
            if (error) { toastsActions.addFromError(error, 'שגיאה במחיקת נוכחות'); return; }
            set({ checkins: get().checkins.filter(c => c.id !== checkinId) });
        }),

        // ── Staff: manage vocations ──────────────────────────────────────
        loadAllVocations: async () => {
            if (!isVocationStaff()) return;
            const { data, error } = await supabase
                .from('users')
                .select(`
                    id, first_name, last_name, username,
                    user_profiles( avatar_url ),
                    vocation!vocation_user_id_fkey( id, place_of_work, position, contact_name, contact_phone, days_of_week, is_active, assigned_by, work_hours )
                `)
                .eq('role', 'student')
                .eq('active', true)
                .order('first_name');
            if (error) { toastsActions.addFromError(error, 'שגיאה בטעינת תלמידים'); return; }
            const normalized = data.map(({ user_profiles, vocation, ...student }) => ({
                ...student,
                avatar_url: user_profiles?.avatar_url ?? null,
                vocation: vocation?.find(v => v.is_active) ?? null,
            }));
            set({ allVocations: normalized });
        },

        assignVocation: async (studentId, vocData) => {
            if (!isVocationStaff()) return;
            const user = useUser.getState().user;
            const payload = {
                user_id: studentId,
                assigned_by: user.id,
                is_active: true,
                place_of_work: vocData.place_of_work ?? '',
                position: vocData.position ?? '',
                contact_name: vocData.contact_name ?? '',
                contact_phone: vocData.contact_phone ?? '',
                days_of_week: vocData.days_of_week ?? [],
                work_hours: [],
            };
            const { data, error } = await supabase
                .from('vocation')
                .insert(payload)
                .select()
                .single();
            if (error) { toastsActions.addFromError(error, 'שגיאה בהקצאת תעסוקה'); return; }
            set({
                allVocations: get().allVocations.map(s =>
                    s.id === studentId ? { ...s, vocation: data } : s
                )
            });
        },

        updateVocationDetails: async (vocationId, updates) => {
            if (!isVocationStaff()) return;
            const { error } = await supabase.from('vocation').update(updates).eq('id', vocationId);
            if (error) { toastsActions.addFromError(error, 'שגיאה בעדכון תעסוקה'); return; }
            set({
                allVocations: get().allVocations.map(s =>
                    s.vocation?.id === vocationId
                        ? { ...s, vocation: { ...s.vocation, ...updates } }
                        : s
                ),
                jobs: get().jobs.map(j => j.id === vocationId ? { ...j, ...updates } : j),
            });
        },

        deactivateVocation: async (vocationId) => {
            if (!isVocationStaff()) return;
            const { error } = await supabase
                .from('vocation')
                .update({ is_active: false })
                .eq('id', vocationId);
            if (error) { toastsActions.addFromError(error, 'שגיאה בשחרור תעסוקה'); return; }
            set({
                allVocations: get().allVocations.map(s =>
                    s.vocation?.id === vocationId ? { ...s, vocation: null } : s
                )
            });
        },

        // Loads all checkins for all students in a date range — stored in staffCheckins
        loadStaffCheckins: async (startDate, endDate) => {
            if (!isVocationStaff()) return;
            let query = supabase
                .from('vocation_checkins')
                .select('*')
                .order('checkin_date', { ascending: false });
            if (startDate) query = query.gte('checkin_date', startDate);
            if (endDate) query = query.lte('checkin_date', endDate);
            const { data, error } = await query;
            if (error) { toastsActions.addFromError(error, 'שגיאה בטעינת נוכחות'); return; }
            set({ staffCheckins: data ?? [] });
        },

        // Returns data directly — used by staff dashboard on demand
        loadCheckinsForStudent: async (userId, startDate = null, endDate = null) => {
            let query = supabase
                .from('vocation_checkins')
                .select('*')
                .eq('user_id', userId)
                .order('checkin_date', { ascending: false });
            if (startDate) query = query.gte('checkin_date', startDate);
            if (endDate) query = query.lte('checkin_date', endDate);
            const { data, error } = await query;
            if (error) { toastsActions.addFromError(error, 'שגיאה בטעינת נוכחות תלמיד'); return []; }
            return data;
        },
    };
});

export const vocationActions = createStoreActions(useVocationData);
export const useVocation = createDataLoadingHook(useVocationData, 'jobs', 'loadJobs');
