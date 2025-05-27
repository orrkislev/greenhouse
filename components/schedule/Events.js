import { tw } from "@/utils/tw";
import { Grid } from "./Schedule";
import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";



export default function EventsGrid({ gridData }) {
    const events = useUserSchedule(state => state.events)
    const setSelectedEvent = useUserSchedule(state => state.setSelectedEvent);
    const { weekDates, firstHourRow, template } = gridData;

    const clickEvent = (event) => {
        setSelectedEvent(event);
    }

    return (
        <Grid className={`z-40`} style={{ gridTemplateRows: template, pointerEvents: 'none' }}>
            {events.map((event, index) => (
                <Event key={index}
                    firstHourRow={firstHourRow}
                    event={event}
                    weekDates={weekDates}
                    onClick={() => clickEvent(event)}
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

function Event({ weekDates, event, onClick, firstHourRow }) {
    const selectedEvent = useUserSchedule(state => state.selectedEvent);

    const dayIndex = weekDates.findIndex(date => formatDate(date) === event.date);
    return (
        <EventDiv
            style={{
                gridRowStart: event.hourStart.index + firstHourRow,
                gridRowEnd: event.hourEnd.index + firstHourRow + 1,
                gridColumnStart: dayIndex * 2 + 2,
            }}
            onClick={onClick}
            isSelected={selectedEvent && selectedEvent.id === event.id}
        >
            {event.title}
        </EventDiv>
    );
}