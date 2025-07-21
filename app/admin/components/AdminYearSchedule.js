"use client"

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tw } from "@/utils/tw";
import { ganttActions, useGantt } from "@/utils/useGantt";
import { useEffect, useState } from "react";

const PlannerDay = tw`
    pt-6 min-w-[40px] min-h-16 border-r border-gray-200 bg-white hover:bg-blue-50
    flex flex-col items-center text-sm relative gap-1
    ${props => props.$isWeekend ? 'bg-blue-100 border-blue-300 text-blue-800' : ''}
    ${props => props.$isValidDay ? '' : 'bg-gray-50 border-none'}
`;
const DayDateNum = tw`
    absolute top-1 right-1 text-xs text-gray-500
    ${props => props.$isWeekend ? 'text-blue-600' : ''}
    `;

const DayEvent = tw`h-2
    w-full scale-x-105
    text-xs px-1 py-0.5 z-5 transition-colors cursor-pointer
    ${props => props.$isFirst ? 'rounded-r' : ''}
    ${props => props.$isLast ? 'rounded-l' : ''}
`;

export default function AdminYearSchedule() {
    const [hoveredEventId, setHoveredEventId] = useState(null);
    const ganttEvents = useGantt(state => state.events);
    const terms = useGantt(state => state.terms);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(()=>{
        ganttActions.initialLoad()
        ganttActions.loadRangeEvents('2025-08-01', '2026-07-31');
    },[]);

    console.log(terms, ganttEvents);


    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const months = [
        { name: 'August', nameHe: 'אוגוסט', year: currentYear, monthIndex: 7 },
        { name: 'September', nameHe: 'ספטמבר', year: currentYear, monthIndex: 8 },
        { name: 'October', nameHe: 'אוקטובר', year: currentYear, monthIndex: 9 },
        { name: 'November', nameHe: 'נובמבר', year: currentYear, monthIndex: 10 },
        { name: 'December', nameHe: 'דצמבר', year: currentYear, monthIndex: 11 },
        { name: 'January', nameHe: 'ינואר', year: currentYear + 1, monthIndex: 0 },
        { name: 'February', nameHe: 'פברואר', year: currentYear + 1, monthIndex: 1 },
        { name: 'March', nameHe: 'מרץ', year: currentYear + 1, monthIndex: 2 },
        { name: 'April', nameHe: 'אפריל', year: currentYear + 1, monthIndex: 3 },
        { name: 'May', nameHe: 'מאי', year: currentYear + 1, monthIndex: 4 },
        { name: 'June', nameHe: 'יוני', year: currentYear + 1, monthIndex: 5 },
        { name: 'July', nameHe: 'יולי', year: currentYear + 1, monthIndex: 6 },
        { name: 'August', nameHe: 'אוגוסט', year: currentYear + 1, monthIndex: 7 },
    ];

    const events = [
        { id: 1, name: 'Term 1', start: '2025-09-01', end: '2025-10-23', color: '#98b0f1ff', hoverColor: '#193da0ff', description: 'First academic term of the year' },
        { id: 2, name: 'Term 2', start: '2025-09-25', end: '2025-12-04', color: '#e07b7bff', hoverColor: '#b02c2cff', description: 'Second academic term of the year' }
    ]
    events.forEach(event => {
        event.style = {
            backgroundColor: event.id === hoveredEventId ? event.hoverColor : event.color,
        }
    });

    // Generate 6 weeks of day columns (42 days total)
    const weeksCount = 6;
    const daysPerWeek = 7;
    const totalColumns = weeksCount * daysPerWeek;

    const renderMonthRow = (month) => {
        const daysInMonth = getDaysInMonth(month.year, month.monthIndex);
        const firstDay = getFirstDayOfMonth(month.year, month.monthIndex); // 0 = Sunday, 1 = Monday, etc.
        const cells = [];

        // Add cells for each column (42 total - 6 weeks)
        for (let col = 0; col < totalColumns; col++) {
            cells.push(<SingleDate
                key={`${month.year}-${month.monthIndex}-${col}`}
                {...{ col, month, events, setMousePosition, setHoveredEventId, daysInMonth, firstDay }}
            />);
        }

        return (
            <div key={`${month.year}-${month.monthIndex}`} className="flex border-b border-gray-300">
                {/* Month label */}
                <div className="min-w-[120px] h-16 bg-gray-100 border-r border-gray-300 flex items-center justify-center sticky left-0 z-10 sticky right-0">
                    <div className="text-center">
                        <div className="font-semibold text-gray-800">{month.nameHe}</div>
                    </div>
                </div>

                {/* Days */}
                {cells}
            </div>
        );
    };


    const hoveredEvent = events.find(event => event.id === hoveredEventId);

    return (
        <div className="w-full relative">
            <div className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">שנת הלימודים {academicYear}</h1>
                <p className="text-gray-600">תכנון שנתי</p>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    {months.map(month => renderMonthRow(month))}
                </div>
            </div>

            {/* Hover tooltip */}
            {hoveredEvent && (
                <div
                    className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 pointer-events-none max-w-xs"
                    style={{
                        left: mousePosition.x + 10,
                        top: mousePosition.y - 60,
                        transform: mousePosition.x > window.innerWidth - 200 ? 'translateX(-100%) translateX(-10px)' : 'none'
                    }}
                >
                    <div className="text-sm font-semibold text-gray-800 mb-1">{hoveredEvent.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{hoveredEvent.description}</div>
                    <div className="text-xs text-gray-500">
                        <div>Start: {new Date(hoveredEvent.start).toLocaleDateString('he-IL')}</div>
                        <div>End: {new Date(hoveredEvent.end).toLocaleDateString('he-IL')}</div>
                    </div>
                </div>
            )}
        </div>
    );
}


const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};



function SingleDate({ col, month, events, setMousePosition, setHoveredEventId, daysInMonth, firstDay }) {
    const [isOpen, setOpen] = useState(false);

    const dayNumber = col - firstDay + 1;
    const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;
    const isWeekend = col % 7 === 5 || col % 7 === 6;

    const dateString = `${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const dateEvents = events.filter(event => event.start <= dateString && event.end >= dateString);

    const eventPlaces = Array(dateEvents.length).fill(null);
    dateEvents.filter(e => e.place).forEach(event => eventPlaces[event.place] = { event });
    dateEvents.forEach(event => {
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
        <PlannerDay key={col} $isValidDay={isValidDay} $isWeekend={isWeekend} >
            {isValidDay && (
                <Popover open={isOpen} onOpenChange={setOpen}>
                    <PopoverAnchor>
                        <DayDateNum $isWeekend={isWeekend}>{dayNumber}</DayDateNum>
                    </PopoverAnchor>
                    {eventPlaces.map((place, index) => {
                        if (!place) return <DayEvent key={index} />;
                        return <DayEvent style={place.event.style} key={index} $isWeekend={isWeekend} $isFirst={place.isFirstDay} $isLast={place.isLastDay}
                            onMouseEnter={(e) => {
                                setHoveredEventId(place.event.id);
                                setMousePosition({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseMove={(e) => {
                                setMousePosition({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseLeave={() => {
                                setHoveredEventId(null);
                            }}
                            onClick={() => setOpen(true)}
                        />;
                    })}
                    <PopoverContent className="w-64 p-2">
                        <div className="text-sm font-semibold text-gray-800 mb-1">{month.nameHe} {dayNumber}</div>
                        <div className="text-xs text-gray-600 mb-2">{new Date(`${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`).toLocaleDateString('he-IL')}</div>
                        {dateEvents.length > 0 && (
                            <div className="text-xs text-gray-500">
                                {dateEvents.map(event => (
                                    <div key={event.id} className="mb-1">
                                        <div className="font-semibold" style={{ color: event.style.backgroundColor }}>{event.name}</div>
                                        <div className="text-xs">{new Date(event.start).toLocaleDateString('he-IL')} - {new Date(event.end).toLocaleDateString('he-IL')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            )}
        </PlannerDay>
    );
}