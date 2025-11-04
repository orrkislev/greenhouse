import { useTime } from "@/utils/store/useTime"
import { ScheduleSection } from "../Layout";
import { addDays, addWeeks, differenceInWeeks, endOfWeek, isSameDay, isToday, startOfWeek, subDays } from "date-fns";
import { tw } from "@/utils/tw";
import { eventsActions, useEventsData } from "@/utils/store/useEvents";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import usePopper from "@/components/Popper";
import { EditEvent } from "../events/EditableEvent";
import { Plus } from "lucide-react";
import { EventTime } from "@/app/(app)/(main)/components/MainSchedule";

const TermCell = tw.div`w-full h-full border border-stone-300 min-h-16 flex flex-col gap-1 pb-2 relative group/cell
    ${({ $isWeekend }) => $isWeekend ? 'bg-blue-200/50' : ''}
    ${({ $isToday }) => $isToday ? 'bg-green-200/50' : ''}
    ${({ $inTerm }) => $inTerm ? '' : 'bg-stone-200'}
    ${({ $inPast }) => $inPast ? 'stripes' : ''}
`;

export default function Term() {
    const events = useEventsData(state => state.events);
    const currTerm = useTime((state) => state.currTerm);
    const [draggingEventId, setDraggingEventId] = useState(null);

    useEffect(() => {
        if (!currTerm) return;
        eventsActions.loadTermEvents();
    }, [currTerm])

    const termStart = new Date(currTerm.start);
    const termEnd = new Date(currTerm.end);

    const startDate = startOfWeek(termStart);
    const endDate = endOfWeek(termEnd);

    const numWeeks = differenceInWeeks(endDate, startDate) + 1;
    const weeks = Array.from({ length: numWeeks }, (_, i) => {
        const startWeek = startOfWeek(addWeeks(startDate, i));
        const week = [];
        for (let j = 0; j < 6; j++) {
            const date = addDays(startWeek, j);
            week.push({
                date: new Date(date),
                inTerm: date >= termStart && date <= termEnd,
                isWeekend: j === 5 || j === 6,
                isToday: isToday(date),
                isFirstDayOfTerm: isSameDay(date, termStart),
                isLastDayOfTerm: isSameDay(date, termEnd),
                inPast: date < subDays(new Date(), 1),
            });
        }
        return week;
    });

    const onMove = (eventId, day) => {
        eventsActions.updateEvent(eventId, { date: format(day.date, 'yyyy-MM-dd') });
    }

    const createNewEvent = (date) => {
        const newEvent = {
            date: format(date, 'yyyy-MM-dd'),
            start: '09:00',
            end: '10:00',
            title: 'משהו',
        };
        eventsActions.addEvent(newEvent);
    }

    return (
        <ScheduleSection>
            {weeks.map((week, i) => week.map((day, j) => (
                <TermCell key={j} $inTerm={day.inTerm} $isWeekend={day.isWeekend} $isToday={day.isToday} $inPast={day.inPast}>
                    <div className="text-xs text-stone-500">{day.date.toLocaleDateString('he-IL', { month: 'long', day: 'numeric' })}</div>
                    <div className="p-2">
                        {day.isFirstDayOfTerm && <div className="text-xs">היום הראשון של התקופה</div>}
                        {day.isLastDayOfTerm && <div className="text-xs">היום האחרון של התקופה</div>}
                    </div>
                    {events[format(day.date, 'yyyy-MM-dd')]?.map((event, i) => (
                        <TermEvent key={event.id} event={event} onStartDrag={() => setDraggingEventId(event.id)} onEndDrag={() => setDraggingEventId(null)} isDragging={draggingEventId === event.id} />
                    ))}
                    {draggingEventId && <div className="absolute inset-0 z-0" onMouseEnter={() => onMove(draggingEventId, day)} />}
                    {!draggingEventId && (
                        <div className="z-0 cursor-pointer flex items-center justify-center rounded-full bg-emerald-500/20 hover:bg-emerald-500/80 transition-all group/new-event mx-2 group-hover/cell:opacity-100 opacity-0 transition-opacity" onClick={() => createNewEvent(day.date)}>
                            <Plus className="size-4 group-hover/new-event:rotate-90 transition-transform duration-300" />
                        </div>
                    )}
                </TermCell>
            )))}
        </ScheduleSection>
    )
}

function TermEvent({ event, isDragging, onStartDrag, onEndDrag }) {
    const { open, close, Popper, baseRef } = usePopper();
    const [clicking, setClicking] = useState(false);

    useEffect(() => {
        if (!isDragging) return
        window.addEventListener('mouseup', onEndDrag);
        return () => window.removeEventListener('mouseup', onEndDrag);
    }, [isDragging]);

    useEffect(() => {
        if (clicking) {
            const timeout = setTimeout(() => {
                onStartDrag();
            }, 100);
            const onMouseUp = () => setClicking(false);
            window.addEventListener('mouseup', onMouseUp);
            return () => {
                clearTimeout(timeout);
                window.removeEventListener('mouseup', onMouseUp);
            }
        }
    }, [clicking]);


    return (
        <>
            <div className={`mx-2 flex gap-1 items-center text-xs py-1 px-2 rounded-full bg-stone-100 border border-stone-300 cursor-pointer hover:bg-stone-200 transition-all z-10 ${isDragging ? 'opacity-50 -rotate-5 scale-105' : ''}`}
                onMouseDown={() => setClicking(true)}
                ref={baseRef}
                onClick={open}
            >
                <EventTime time={event.start} /> {event.title}
            </div>
            <Popper>
                <EditEvent event={event} onClose={close} />
            </Popper>
        </>
    )
}