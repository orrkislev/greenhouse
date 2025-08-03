import { Event } from "./Event";
import { HOURS, useTime } from "@/utils/store/useTime";
import { tw } from "@/utils/tw";
import { ScheduleSection } from "../Layout";

const EmptySlot = tw`min-h-8 z-1
    flex items-center justify-center text-xs
    bg-[#F3C5C599] text-transparent
    `;
const TimeSlot = tw.div`flex items-start justify-start text-black/50 text-xs pointer-events-none z-6 p-1`;

export default function ReadOnlyEvents({ events }) {
    const week = useTime(state => state.week);
    const positions = Array(6).fill(0).map((_, col) => Array(5).fill(0).map((_, row) => (
        { row: row + 1, col: col + 1 }))).flat();
        
    return (
        <ScheduleSection name="לוז">
            {positions.map((pos, index) => (
                <EmptySlot key={index} className={`col-${pos.col} row-${pos.row}`}
                >+</EmptySlot>
            ))}

            {positions.map((pos, index) => (
                <TimeSlot key={index} className={`col-${pos.col} row-${pos.row}`}>
                    {HOURS[pos.row - 1]}
                </TimeSlot>
            ))}

            {events.map((event, index) => (
                <Event key={index} event={event} />
            ))}
        </ScheduleSection>
    )
}