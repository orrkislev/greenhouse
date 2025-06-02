import { tw } from "@/utils/tw";

import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useEffect, useState } from "react";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { deleteEvent } from "@/utils/firebase/firebase_data";
import { Trash2 } from "lucide-react";

const EventDiv = tw.motion`bg-[#E8CB4A] rounded-lg mx-2 p-2 inset-shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-gray-800
    flex items-center justify-start text-sm
    pointer-events-auto cursor-pointer hover:bg-[#D7B33A] transition-colors
    z-[50] relative
    ${props => props.isSelected ? 'bg-[#C69F2A] text-white' : ''}
`;




export function Event({ event, firstHourRow, onStartDrag, onEndDrag, onStartResize, onEndResize }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const week = useWeek(state => state.week);

    useEffect(() => {
        if (!isDragging) return
        onStartDrag(isDragging);
        const onMouseUp = () => {
            setIsDragging(false);
            onEndDrag()
        };
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isDragging])

    useEffect(() => {
        if (!isResizing) return
        onStartResize();
        const onMouseUp = () => {
            setIsResizing(false);
            onEndResize()
        };
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isResizing])

    const dayIndex = week.findIndex(date => formatDate(date) === event.date);
    const startIndex = HOURS.findIndex(hour => hour === event.start);
    const endIndex = Math.min(startIndex + event.duration - 1, 4)

    const handleResizeDown = (e) => {
        e.stopPropagation();
        setIsResizing(true);
    }

    const handleDelete = async (e) => {
        e.stopPropagation();
        deleteEvent(event.id);
    }

    return (
        <EventDiv
            drag
            dragElastic={0.05}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragTransition={{
                bounceStiffness: 1000,
                bounceDamping: 10
            }}
            animate={{
                opacity: isDragging ? 0.8 : 1,
                scale: isDragging ? 1.05 : 1
            }}
            style={{
                gridRowStart: startIndex + firstHourRow,
                gridRowEnd: endIndex + firstHourRow + 1,
                gridColumnStart: dayIndex + 2,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setIsDragging(e.clientY - rect.top);
            }}
        >
            {/* Icon buttons on hover */}
            {isHovered && !isDragging && !isResizing && (
                <div className="absolute top-1 left-2 flex gap-2 z-10" onMouseDown={e => e.stopPropagation()}>
                    <button
                        className="p-1 rounded focus:outline-none rounded-full hover:scale-110 transition-transform bg-transparent hover:bg-white/50"
                        onClick={handleDelete}
                        aria-label="Delete event"
                    >
                        <Trash2 width={14} height={14} className="text-gray-600/80" />
                    </button>
                </div>
            )}
            <EventTitleEditor event={event} />

            {((isHovered && !isDragging) || isResizing) && (
                <div className="absolute bottom-0 right-0 w-full p-1 px-2 cursor-col-resize"
                    onMouseDown={handleResizeDown}
                >
                    <div className="w-full h-[3px] rounded-full bg-white bg-white/50 cursor-col-resize" />
                </div>
            )}
        </EventDiv>
    );
}



function EventTitleEditor({ event }) {
    const [editTitle, setEditTitle] = useState(event.title);
    const updateEvent = useUserSchedule(state => state.updateEvent);

    const handleTitleChange = (e) => {
        setEditTitle(e.target.value);
    };
    const handleTitleBlur = () => {
        if (editTitle !== event.title) {
            updateEvent(event.id, { title: editTitle });
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTitleBlur();
        }
    };

    return <input
        className="bg-transparent text-gray-800 rounded px-1 w-full outline-none pointer-events-auto"
        value={editTitle}
        autoFocus
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        onClick={e => e.stopPropagation()}
    />
}