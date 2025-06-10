import { formatDate } from "@/utils/utils";
import { Grid } from "./Schedule";
import { tw } from "@/utils/tw";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useUser } from "@/utils/store/user";
import { useWeek } from "@/utils/store/scheduleDisplayStore";

const EmptySlot = tw`bg-white rounded-lg p-2 inset-shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-gray-800 mx-2
    flex items-center justify-center text-sm font-bold
    cursor-pointer opacity-0 hover:opacity-100 transition-opacity
`;

export default function EmptySlotsGrid({ gridData }) {
    const week = useWeek(state => state.week);
    const user = useUser(state => state.user);
    const events = useUserSchedule(state => state.events);
    const setEvents = useUserSchedule(state => state.setEvents);

    if (!user) return null;
    const clickNewEvent = (dayIndex, hour) => {
        const date = week[dayIndex];

        // create a new event in firebase        
        const newEvent = {
            date: formatDate(date),
            start: hour,
            duration: 1,
            title: `New Event`
        };
        setEvents([...events, newEvent]);
    }
    
    return (
        <Grid className='z-30 pointer-events-auto' style={gridData.style}>
            {Array(6).fill(0).map((_, index) => {
                return HOURS.map((hour,hourIndex) => (
                    <EmptySlot key={`${index}-${hourIndex}`}
                        style={{
                            gridRowStart: hourIndex + gridData.firstHourRow,
                            gridColumnStart: index + 2,
                            gridColumnEnd: index + 3,
                        }}
                        onClick={() => clickNewEvent(index, hour)}
                    >
                        +
                    </EmptySlot>
                ));
            })}
        </Grid>
    )
}