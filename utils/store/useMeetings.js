import { createDataLoadingHook, createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";

export const [useMeetingsData, meetingsActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        meetings: [],

        loadTodayMeetings: withLoadingCheck(async (user) => {
            await get().loadMeetings(user, true);
        }),

        loadMeetings: withLoadingCheck(async (user, isToday) => {
            set({ meetings: [] });
            const obj = { p_user_id: user.id };
            if (isToday) obj.p_day_of_week = new Date().getDay() + 1;
            const { data, error } = await supabase.rpc('get_user_recurring_events', obj);
            if (error) console.log('error loading meetings', error);
            set({ meetings: data });
        }),

        createMeeting: withUser(async (user, otherUser, day, start, end) => {
            const { data, error } = await supabase.from('events').insert({
                created_by: user.id,
                title: 'פגישה',
                repeat_weekly: true,
                day_of_the_week: day,
                start, end,
            }).select().single();
            if (error) console.log('error creating meeting', error);

            const { error: error2 } = await supabase.from('event_participants').insert({
                event_id: data.id,
                user_id: otherUser.id,
            });
            if (error2) console.log('error creating meeting', error2);

            set({ meetings: [...get().meetings, data] });
        }),

        updateMeeting: async (meetingId, updates) => {
            const { error } = await supabase.from('events').update(updates).eq('id', meetingId);
            if (error) console.log('error updating meeting', error);
            set({ meetings: get().meetings.map(meeting => meeting.id === meetingId ? { ...meeting, ...updates } : meeting) });
        },
        deleteMeeting: async (meetingId) => {
            const { error } = await supabase.from('events').delete().eq('id', meetingId);
            if (error) console.log('error deleting meeting', error);
            set({ meetings: get().meetings.filter(meeting => meeting.id !== meetingId) });
        }
    }
});

export const meetingUtils = {
    hasUser: (meeting, user) => {
        return meeting.created_by === user.id || meeting.other_participants.find(p => p.id === user.id);
    },
    is_owner: (meeting, user) => {
        return meeting.created_by === user.id;
    }
}

export const useMeetingsToday = createDataLoadingHook(useMeetingsData, 'meetings', 'loadTodayMeetings');
export const useMeetings = createDataLoadingHook(useMeetingsData, 'meetings', 'loadMeetings');