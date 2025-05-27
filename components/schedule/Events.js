import { tw } from "@/utils/tw";
import { Grid, useWeek } from "./Schedule";
import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";



export default function EventsGrid({ gridData }) {
    const events = useUserSchedule(state => state.events)

    return (
        <Grid className={`z-40`} style={{ ...gridData.style, pointerEvents: 'none' }}>
            {events.map((event, index) => (
                <Event key={index}
                    firstHourRow={gridData.firstHourRow}
                    event={event}
                />
            ))}
        </Grid>
    )
}


const EventDiv = tw`bg-[#E8CB4A] col-span-2 rounded-lg p-2 inset-shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-gray-800 mx-2
    flex items-center justify-start text-sm
    pointer-events-auto cursor-pointer hover:bg-[#D7B33A] transition-colors
    ${props => props.isSelected ? 'bg-[#C69F2A] text-white' : ''}
`;

const hours = [
    '',
    '09:30',
    '10:30',
    '11:30',
    '12:30',
    'ערב',
]
function Event({ event, onClick, firstHourRow }) {
    const week = useWeek(state => state.week);
    const selected = useUserSchedule(state => state.selected);
    const setSelected = useUserSchedule(state => state.setSelected);

    const dayIndex = week.findIndex(date => formatDate(date) === event.date);
    const startIndex = hours.findIndex(hour => hour === event.start);
    const endIndex = hours.findIndex(hour => hour === event.end);
    return (
        <EventDiv
            style={{
                gridRowStart: startIndex + firstHourRow,
                gridRowEnd: endIndex + firstHourRow + 1,
                gridColumnStart: dayIndex * 2 + 2,
            }}
            onClick={() => setSelected(event.id)}
            isSelected={selected === event.id}
        >
            {event.title}
            {/* {event.start} - {event.end}, {startIndex}-{endIndex} */}
        </EventDiv>
    );
}