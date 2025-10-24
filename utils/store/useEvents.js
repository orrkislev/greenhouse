import { addDays, format } from "date-fns";
import { debounce } from "lodash";
import { createStore, createDataLoadingHook } from "./utils/createStore";
import { useTime } from "./useTime";
import { prepareForEventsTable } from "../supabase/utils";
import { supabase } from "../supabase/client";


export const [useEventsData, eventsActions] = createStore((set, get, withUser, withLoadingCheck) => {
    const debouncedUpdateEvents = debounce(async () => {
        const { events } = get();
        const dates = Object.keys(events);
        for (const date of dates) {
            for (const event of events[date]) {
                if (event._dirty && event.id) {
                    const { id, _dirty, ...data } = event;
                    const { error } = await supabase.from('events').update(prepareForEventsTable(data)).eq('id', id);
                    event._dirty = false;
                }
            }
        }
        set({ events: { ...events } });
    }, 1000);

    return {
        events: {},

        loadTodayEvents: withLoadingCheck(async (user) => {
            set({ events: {} });
            await get().loadEvents(user, format(new Date(), 'yyyy-MM-dd'));
        }),
        loadWeekEvents: withLoadingCheck(async (user, week) => {
            set({ events: {} });
            if (!week) week = useTime.getState().week;
            if (!week || week.length === 0) return;
            await get().loadEvents(user, week[0], week[week.length - 1]);
        }),

        loadEvents: async (user, start, end) => {
            if (!end) end = start;
            let date = start
            let shouldLoad = false;
            while (date <= end) {
                if (!get().events[date]) {
                    shouldLoad = true;
                    break;
                }
                date = addDays(date, 1);
            }
            if (!shouldLoad) return;

            const { data, error } = await supabase.rpc('get_user_events', {
                p_user_id: user.id,
                p_start_date: start,
                p_end_date: end
            });
            if (error) throw error;


            const newEvents = { ...get().events };
            date = new Date(start);
            while (date <= new Date(end)) {
                const dateStr = format(date, 'yyyy-MM-dd');
                if (!newEvents[dateStr]) newEvents[dateStr] = [];
                newEvents[dateStr].push(...data.filter(e => e.date === dateStr));
                date = addDays(date, 1);
            }
            set({ events: newEvents });
        },

        // ------------------------------
        // ---- CRUD Events -------------
        // ------------------------------
        addEvent: withUser(async (user, event) => {
            event.created_by = user.id;
            const { data, error } = await supabase.from('events').insert(prepareForEventsTable(event)).select().single();
            if (error) throw error;
            const newEvents = { ...get().events };
            newEvents[event.date] = [...(newEvents[event.date] || []), data];
            set({ events: newEvents });
        }),
        updateEvent: async (eventId, updates) => {
            const event = Object.values(get().events).flat().find(event => event.id === eventId);
            const newEvents = { ...get().events };
            newEvents[event.date] = newEvents[event.date].filter(event => event.id !== eventId);
            Object.assign(event, updates);
            event._dirty = true;
            newEvents[event.date] = [...newEvents[event.date], event];
            set({ events: newEvents });
            debouncedUpdateEvents();
        },
        deleteEvent: async (event) => {
            const newEvents = { ...get().events };
            newEvents[event.date] = newEvents[event.date].filter(event => event.id !== event.id);
            set({ events: newEvents });
            await supabase.from('events').delete().eq('id', event.id);
        },

        // -----------------------------------
        // ---- Other Users ( for staff ) ----
        // -----------------------------------
        getTodaysEventsForUser: async (userId) => {
            const { data: scheduledEvents, error: scheduledEventsError } = await supabase.rpc('get_user_events', {
                p_user_id: userId,
                p_start_date: format(new Date(), 'yyyy-MM-dd'),
                p_end_date: format(new Date(), 'yyyy-MM-dd')
            })
            if (scheduledEventsError) throw scheduledEventsError;
            const { data: meetings, error: meetingsError } = await supabase.rpc('get_user_recurring_events', {
                p_user_id: userId,
                p_day_of_week: new Date().getDay() + 1
            })
            if (meetingsError) throw meetingsError;
            return { scheduledEvents, meetings };
        }
    }
});

export const useTodayEvents = createDataLoadingHook(useEventsData, 'events', 'loadTodayEvents');
export const useWeekEvents = createDataLoadingHook(useEventsData, 'events', 'loadWeekEvents');
