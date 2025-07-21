'use client';

import { motion } from "motion/react";
import { useDragAndResize } from "./useDragAndResize";

import { EventControls } from "./EventControls";
import { ResizeHandle } from "./ResizeHandle";
import { EventTitleEditor } from "./EventTitleEditor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import TimeRangePicker from "@/components/ui/timerange-picker";
import { eventsActions } from "@/utils/useEvents";

export function EditableEvent({ event, onStartDrag, onEndDrag, onStartResize, onEndResize, onSelect }) {
    const { isDragging, isResizing, isHovered,
        handleMouseDown, handleResizeDown, handleMouseEnter, handleMouseLeave,
    } = useDragAndResize({ onStartDrag, onEndDrag, onStartResize, onEndResize });
    const [isOpen, setIsOpen] = useState(false);

    const motionProps = {
        drag: true,
        dragElastic: 0.05,
        dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
        dragTransition: { bounceStiffness: 1000, bounceDamping: 10 },
        animate: {
            opacity: isDragging ? 0.8 : 1,
            scale: isDragging ? 1.05 : 1
        },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
    };

    const eventClasses = `
        bg-[#EF98A1] py-2 pr-10 pl-2 text-gray-800
        flex items-center justify-start text-sm
        pointer-events-auto cursor-pointer transition-all
        z-5 relative
        h-full outline-2 outline-white
        hover:bg-[#E77885] hover:scale-102
    `;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div style={event.gridStyle} className="relative z-5">
                    <motion.div className={eventClasses} {...motionProps}>
                        <EventControls
                            event={event}
                            onSelect={() => setIsOpen(true)}
                            visible={isHovered && !isDragging && !isResizing}
                        />

                        <EventTitleEditor event={event} />

                        <ResizeHandle
                            visible={(isHovered && !isDragging) || isResizing}
                            onMouseDown={handleResizeDown}
                        />
                    </motion.div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" sideOffset={5}>
                <EditEvent event={event} onClose={() => setIsOpen(false)} />
            </PopoverContent>
        </Popover>
    );
}


function EditEvent({event, onClose}) {
    const [startTime, setStartTime] = useState(event.start);
    const [endTime, setEndTime] = useState(event.end);

    const handleSave = (e) => {
        e.preventDefault();
        eventsActions.updateEvent(event.id, {
            start: startTime,
            end: endTime,
        });
        onClose();
    };

    const handleDelete = () => {
        eventsActions.deleteEvent(event.id);
        onClose();
    };

    return (
        <div>
            <EventTitleEditor event={event} />
            <TimeRangePicker
                value={{ start: startTime, end: endTime }}
                onChange={({ start, end }) => {
                    setStartTime(start);
                    setEndTime(end);
                }}
            />
            <div className="flex justify-end">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mr-2"
                    onClick={handleSave}
                >
                    Save
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    onClick={handleDelete}
                >
                    Delete Event
                </button>
            </div>
        </div>
    );
}
