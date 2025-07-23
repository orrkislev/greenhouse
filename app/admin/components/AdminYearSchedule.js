"use client"

import { tw } from "@/utils/tw";
import { ganttActions, useGantt } from "@/utils/useGantt";
import { useEffect, useState } from "react";
import YearlyPlanner from "./YearlyPlanner";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/DatePicker";

const PlannerDay = tw`
    pt-6 min-w-[40px] min-h-16 border-l border-white bg-white hover:bg-blue-50
    flex flex-col items-center text-sm relative gap-1 text-gray-500
    ${props => props.$isFriday ? 'stripes text-blue-600' : ''}
    ${props => props.$isSaturday ? 'stripes border-gray-400 text-blue-600 ' : ''}
    ${props => props.$isBreak ? 'stripes' : ''}
    ${props => props.$isValidDay ? '' : 'bg-gray-50 border-none '}
`;
const DayDateNum = tw`
    absolute top-1 right-1 text-xs 
    `;

const DayEvent = tw`h-2
    w-full scale-x-105
    text-xs px-1 py-0.5 z-5 transition-colors cursor-pointer
    ${props => props.$isFirst ? 'rounded-r' : ''}
    ${props => props.$isLast ? 'rounded-l' : ''}
`;



const termColors = [
    { color: '#7fbcd4', hoverColor: '#7ED6F9' },
    { color: '#ffaeb5', hoverColor: '#b65159' },
]

const eventColors = [
    { color: '#ffbe0b', hoverColor: '#b58c00' },
    { color: '#fb5607', hoverColor: '#c03900' },
    { color: '#ff006e', hoverColor: '#c7005b' },
    { color: '#8338ec', hoverColor: '#6f2c91' },
    { color: '#3a86ff', hoverColor: '#0077cc' },
]

export default function AdminYearSchedule() {
    const [hovered, setHovered] = useState(null);
    const ganttEvents = useGantt(state => state.events);
    const ganttTerms = useGantt(state => state.terms);

    useEffect(() => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const startYear = month < 6 ? date.getFullYear() - 1 : date.getFullYear();
        const endYear = month < 6 ? date.getFullYear() : date.getFullYear() + 1;
        ganttActions.loadRangeEvents(`${startYear}-08-01`, `${endYear}-07-31`);
    }, []);

    const startYear = new Date().getMonth() < 7 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const academicYear = `${startYear}-${startYear + 1}`;

    const terms = ganttTerms.map((term, index) => ({
        ...term,
        color: termColors[index % termColors.length].color,
        isHovered: hovered && hovered.term ? hovered.term.id === term.id : false,
    }));

    const events = ganttEvents.map((event, index) => ({
        ...event,
        color: eventColors[index % eventColors.length].color,
        isHovered: hovered?.events?.some(e => e.id === event.id) || false,
    }));

    return (
        <div className="w-full relative">
            <div className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">שנת הלימודים {academicYear}</h1>
                <p className="text-gray-600">תכנון שנתי</p>
            </div>

            <YearlyPlanner
                SingleDate={SingleDate}
                EmptyDate={() => <PlannerDay $isValidDay={false} />}
                terms={ganttTerms}
                events={ganttEvents}
                DateProps={{
                    terms,
                    events,
                    hovered, setHovered
                }}
            />
        </div>
    );
}




function SingleDate({ col, month, terms, events, setHovered, dayNumber }) {
    const [isHovered, setHoveredState] = useState(false);
    const [showContext, setShowContext] = useState(false);

    useEffect(() => {
        if (isHovered) {
            const timeout = setTimeout(() => {
                setShowContext(true);
            }, 500);
            return () => clearTimeout(timeout);
        } else {
            setShowContext(false);
        }
    }, [isHovered]);

    const dateString = `${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

    const term = terms.find(term => term.start <= dateString && term.end >= dateString);

    const dateEvents = events.filter(event => event.start <= dateString && event.end >= dateString);

    const isBreak = dateEvents.some(event => event.type === 'break');

    const displayEvents = dateEvents.filter(event => event.type != 'break')
    const eventPlaces = Array(displayEvents.length).fill(null);
    displayEvents.filter(e => e.place).forEach(event => eventPlaces[event.place] = { event });
    displayEvents.forEach(event => {
        if (!event.place) {
            let firstEmptyIndex = 0
            for (let i = 0; i < eventPlaces.length; i++) {
                if (!eventPlaces[i]) {
                    firstEmptyIndex = i;
                    break;
                }
            }
            event.place = firstEmptyIndex;
            eventPlaces[firstEmptyIndex] = { event };
        }
    });
    eventPlaces.forEach(place => {
        if (!place) return
        place.isFirstDay = place.event.start === dateString;
        place.isLastDay = place.event.end === dateString;
    });


    return (
        <PlannerDay key={col} $isValidDay={true} $isFriday={col % 7 === 5} $isSaturday={col % 7 === 6} $isBreak={isBreak}
            style={{
                backgroundColor: term ? term.color + (term.isHovered ? '' : '55') : '#f0f0f0',
            }}
            onMouseEnter={_ => { setHovered({ term, events: dateEvents }), setHoveredState(true) }}
            onMouseLeave={_ => { setHovered(null), setHoveredState(false) }}
        >
            <DayDateNum>{dayNumber}</DayDateNum>
            {eventPlaces.map((place, index) => {
                if (!place) return <DayEvent key={index} />;
                return <DayEvent key={index}
                    $isFirst={place.isFirstDay} $isLast={place.isLastDay}
                    style={{
                        backgroundColor: place.event.color + (place.event.isHovered ? '' : '55'),
                    }}
                />;
            })}

            {showContext && (
                <DateContext {...{ dayNumber, month, term, dateEvents, dateString }} />
            )}
        </PlannerDay>
    )
}

function DateContext({ dayNumber, month, term, dateEvents, dateString }) {
    const [selectedEvent, setSelectedEvent] = useState(false);
    const [editTerm, setEditTerm] = useState(false);

    const dayOfTheWeek = new Date(dateString).toLocaleDateString('he-IL', { weekday: 'long' })


    const startOfYear = month.monthIndex < 8 ? new Date(month.year - 1, 8, 1) : new Date(month.year, 8, 1);
    const weekLength = 7 * 24 * 60 * 60 * 1000;
    const weekNumber = Math.ceil((((new Date(dateString).getTime() - startOfYear.getTime()) / weekLength)));

    return (
        <div className="absolute top-[100%] bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50 w-80">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="text-sm font-semibold text-gray-800 mb-1">{dayOfTheWeek} ,{dayNumber} ב{month.nameHe} </div>
                    <div className="text-xs text-gray-600 mb-2">{new Date(dateString).toLocaleDateString('he-IL')}</div>
                    <div className="text-xs text-gray-500">שבוע {weekNumber}</div>
                </div>
                {term && (
                    <div className="text-xs mb-2 cursor-pointer hover:bg-gray-100 transition-colors" onClick={_ => setEditTerm(!editTerm)}>
                        <span className="font-semibold" style={{ color: term.color }}>תקופת {term.name}</span>
                    </div>
                )}
            </div>

            {editTerm ? (
                <EditTerm term={term} onClose={() => setEditTerm(false)} />
            ) : selectedEvent == false ? (
                <div className="text-gray-500">
                    {dateEvents.map(event => (
                        <div key={event.id} className="mb-1 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                            onClick={e => {
                                e.stopPropagation()
                                setSelectedEvent(event)
                            }}
                        >
                            <div className="text-sm font-semibold" style={{ color: event.color }}>{event.title}</div>
                            <div className="text-xs">{getEasyDateString(event.start)} - {getEasyDateString(event.end)}</div>
                        </div>
                    ))}
                    <button className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700"
                        onClick={() => setSelectedEvent(null)}
                        style={{ marginTop: '10px', width: '100%' }}
                    >
                        אירוע חדש
                    </button>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-300 p-2 bg-gray-50 relative">
                    <button
                        className="text-gray-400 hover:text-gray-700"
                        onClick={_ => setSelectedEvent(false)}
                        title="סגור"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                    <EditEvent dateString={dateString} event={selectedEvent} onClose={() => setSelectedEvent(false)} />
                </div>
            )}

        </div>
    )
}

function getEasyDateString(dateString) {
    return dateString.slice(5).split('-').reverse().join('/');
}


function EditEvent({ dateString, event, onClose }) {
    const [title, setTitle] = useState(event ? event.title : '');
    const [start, setStart] = useState(new Date(event ? event.start : dateString));
    const [end, setEnd] = useState(new Date(event ? event.end : dateString));
    const [type, setType] = useState(event ? event.type : 'event');

    const onSubmit = async () => {
        const startDate = format(new Date(start), 'yyyy-MM-dd');
        const endDate = format(new Date(end), 'yyyy-MM-dd');
        if (event) {
            await ganttActions.updateEvent(event.id, { title, start: startDate, end: endDate, type });
        } else {
            await ganttActions.createEvent({ title, start: startDate, end: endDate, type });
        }
        setTitle('');
        setStart(dateString);
        setEnd(dateString);
        setType('event');
        onClose();
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                className="border rounded px-2 py-1 text-sm"
                placeholder="כותרת"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <div className="flex flex-col gap-2">
                <DatePicker 
                    initial={start}
                    max={end}
                    onChange={setStart}
                />
                <div className="self-center text-xs">עד</div>
                <DatePicker 
                    initial={end}
                    min={start}
                    onChange={setEnd}
                />
            </div>
            <select
                className="border rounded px-2 py-1 text-sm"
                value={type}
                onChange={e => setType(e.target.value)}
            >
                <option value="event">אירוע</option>
                <option value="break">חופשה</option>
            </select>
            <button
                className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700"
                onClick={onSubmit}
                disabled={!title}
            >
                {event ? 'עדכן אירוע' : 'הוסף אירוע'}
            </button>
            {event && (
                <button
                    className="bg-red-600 text-white rounded px-3 py-1 text-sm hover:bg-red-700"
                    onClick={async () => {
                        await ganttActions.deleteEvent(event.id);
                        setTitle('');
                        setStart(dateString);
                        setEnd(dateString);
                        onClose();
                    }}
                >
                    מחק אירוע
                </button>
            )}
        </div>
    )
}


const EditTerm = ({ term, onClose }) => {
    const [name, setName] = useState(term.name);
    const [start, setStart] = useState(new Date(term.start));
    const [end, setEnd] = useState(new Date(term.end));

    const onSubmit = async () => {
        await ganttActions.updateTerm(term.id, { name, start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') });
        onClose();
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                className="border rounded px-2 py-1 text-sm"
                placeholder="שם תקופה"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <DatePicker initial={start} onChange={setStart} />
            <DatePicker initial={end} onChange={setEnd} />
            <button
                className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700"
                onClick={onSubmit}
                disabled={!name}
            >
                עדכן תקופה
            </button>
        </div>
    );
}