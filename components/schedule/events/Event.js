'use client';

import { formatDate } from "@/utils/utils";
import { HOURS, useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useEffect, useRef, useState } from "react";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";




export function Event({ event, edittable, onStartDrag, onEndDrag, onStartResize, onEndResize, onSelect }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const events = useUserSchedule(state => state.events);
    const setEvents = useUserSchedule(state => state.setEvents);

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
        setEvents(events.filter(e => e.id !== event.id));
    }

    const EventDivProps = {
        style: {
            gridRowStart: startIndex + 1,
            gridRowEnd: endIndex + 2,
            gridColumn: dayIndex + 1,
        }
    };
    if (edittable) Object.assign(EventDivProps, {
        drag: true,
        dragElastic: 0.05,
        dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
        dragTransition: { bounceStiffness: 1000, bounceDamping: 10 },
        animate: {
            opacity: isDragging ? 0.8 : 1,
            scale: isDragging ? 1.05 : 1
        },
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        onMouseDown: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setIsDragging(e.clientY - rect.top);
        },
    });

    const eventClasses = `
        bg-[#EF98A1] py-2 px-10 text-gray-800
        flex items-center justify-start text-sm
        pointer-events-auto cursor-pointer transition-colors
        z-5 relative
        hover:bg-[#E77885]
    `

    return (
        <motion.div className={eventClasses} {...EventDivProps}>
            {/* Icon buttons on hover */}
            {isHovered && !isDragging && !isResizing && (
                <div className="absolute top-1 left-2 flex gap-2 z-10" onMouseDown={e => e.stopPropagation()}>
                    <button
                        className="p-1 rounded focus:outline-none rounded-full hover:scale-110 transition-transform bg-transparent hover:bg-white/50"
                        onClick={handleDelete}
                        aria-label="Delete event"
                    >
                        <Trash2 width={14} height={14} className="text-white/80" />
                    </button>
                    <button
                        className="p-1 rounded focus:outline-none rounded-full hover:scale-110 transition-transform bg-transparent hover:bg-white/50"
                        onClick={onSelect}
                        aria-label="Edit event"
                    >
                        <Edit2 width={14} height={14} className="text-white/80" />
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
        </motion.div>
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

    return (
        <SmartTextArea
            className="bg-transparent text-gray-800 rounded px-1 w-full outline-none pointer-events-auto focus:bg-white/50 resize-none"
            value={editTitle}
            onMouseDown={e => e.stopPropagation()}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onClick={e => e.stopPropagation()}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
    );
}

function SmartTextArea(props) {
    const ref = useRef();

    useEffect(() => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [props.value]);

    return (
        <textarea
            ref={ref}
            rows={1}
            className="bg-transparent text-gray-800 rounded px-1 w-full outline-none pointer-events-auto focus:bg-white/50 resize-none"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '0', ...props.style }}
            {...props}
        />
    );
}