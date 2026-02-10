import { format } from "date-fns";
import { create } from "zustand";
import { createDataLoadingHook, createStoreActions, withUser } from "./utils/storeUtils";
import { useTime } from "./useTime";
import { prepareForEventsTable } from "../supabase/utils";
import { supabase } from "../supabase/client";
import { useEffect } from "react";
import { useUser } from "./useUser";


export const useEventsData = create((set, get) => {
    useUser.subscribe(originalUser => {
        set({ events: [] });
    });

    return {
        events: [],

        loadTodayEvents: withUser(async (user) => {
            set({ events: [] });
            await get().loadEvents(user, format(new Date(), 'yyyy-MM-dd'));
        }),
        loadWeekEvents: withUser(async (user, week) => {
            if (!week) week = useTime.getState().week;
            if (!week || week.length === 0) return;
            await get().loadEvents(user, week[0], week[week.length - 1]);
        }),
        loadTermEvents: withUser(async (user) => {
            const term = useTime.getState().currTerm
            if (!term || !term.start || !term.end) return;
            await get().loadEvents(user, term.start, term.end);
        }),
        loadEvents: async (user, start, end) => {
            get().loadRecurringEvents();
            if (!end) end = start;
            const { data, error } = await supabase.rpc('get_user_events', {
                p_user_id: user.id,
                p_start_date: start,
                p_end_date: end
            });
            if (error) throw error;
            get().addEvents(data);
        },
        addEvents: (newEvents) => {
            const mergedEvents = [...get().events];
            newEvents.forEach(newEvent => {
                if (!mergedEvents.find(e => e.id === newEvent.id)) {
                    mergedEvents.push(newEvent);
                }
            });
            set({ events: mergedEvents });
        },

        // -----------------------------------
        // ---- recurring events -------------
        // -----------------------------------
        loadRecurringEvents: withUser(async (user) => {
            if (get().events.some(e => e.day_of_the_week !== undefined)) return;
            const { data, error } = await supabase.rpc('get_user_recurring_events', {
                p_user_id: user.id,
            });
            if (error) throw error;
            get().addEvents(data);
        }),

        // ------------------------------
        // ---- CRUD Events -------------
        // ------------------------------
        addEvent: withUser(async (user, event) => {
            event.created_by = user.id;
            const { data, error } = await supabase.from('events').insert(prepareForEventsTable(event)).select().single();
            if (error) throw error;
            get().addEvents([data]);
            if (event.participants && event.participants.length > 0) {
                await supabase.from('event_participants').insert(event.participants.map(p => ({ event_id: data.id, user_id: p })));
            }
        }),
        saveEvent: withUser(async (user, event) => {
            console.log('saving event:', event);
            if (!event.id) return await get().addEvent(user, event);

            const origEvent = get().events.find(e => e.id === event.id);
            if (!origEvent) return;

            const updatedEvent = { ...origEvent, ...event };
            const { data, error } = await supabase.from('events').update(prepareForEventsTable(updatedEvent)).eq('id', event.id).select().single();
            if (error) throw error;

            const newEvents = get().events.map(e => e.id === event.id ? updatedEvent : e);
            set({ events: newEvents });

            if (event.participants) {
                const origParticipants = origEvent.participants || [];
                const newParticipants = event.participants;

                const participantsToAdd = newParticipants.filter(p => !origParticipants.includes(p));
                const participantsToRemove = origParticipants.filter(p => !newParticipants.includes(p));

                if (participantsToAdd.length > 0) {
                    await supabase.from('event_participants').insert(participantsToAdd.map(p => ({ event_id: event.id, user_id: p })));
                }
                if (participantsToRemove.length > 0) {
                    await supabase.from('event_participants').delete().eq('event_id', event.id).in('user_id', participantsToRemove);
                }
            }
        }),
        deleteEvent: async (event) => {
            const newEvents = get().events.filter(e => e.id !== event.id);
            set({ events: newEvents });
            await supabase.from('events').delete().eq('id', event.id);
            await supabase.from('event_participants').delete().eq('event_id', event.id);
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
    };
});

export const eventsActions = createStoreActions(useEventsData);

// Selector utilities for components
export const eventSelectors = {
    getEventsForDate: (events, date) => {
        const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
        return events.filter(e => e.date === dateStr);
    },

    getRecurringEventsForDay: (events, dayOfWeek) => {
        return events.filter(e => e.day_of_the_week === dayOfWeek);
    },

    getEventsForDateWithRecurring: (events, date) => {
        const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
        const dayOfWeek = new Date(date).getDay() + 1;
        return events.filter(e =>
            e.date === dateStr || e.day_of_the_week === dayOfWeek
        );
    },

    getEventsForWeek: (events, weekDates) => {
        const dateSet = new Set(weekDates.map(d => typeof d === 'string' ? d : format(d, 'yyyy-MM-dd')));
        return events.filter(e => e.date && dateSet.has(e.date));
    }
};

export const useRecurringEvents = createDataLoadingHook(useEventsData, 'events', 'loadRecurringEvents');
export const useTodayEvents = createDataLoadingHook(useEventsData, 'events', 'loadTodayEvents');
export const useWeekEvents = function useWeekEvents() {
    const week = useTime(state => state.week);
    const user = useUser(state => state.user);
    const events = useEventsData(state => state.events);
    if (!week || week.length === 0) return null;
    useEffect(() => {
        if (!user) return;
        eventsActions.loadWeekEvents(week);
    }, [week, user]);
    return events;
}
export const useTermEvents = createDataLoadingHook(useEventsData, 'events', 'loadTermEvents');
