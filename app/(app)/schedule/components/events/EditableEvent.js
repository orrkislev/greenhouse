'use client';

import { motion } from "motion/react";
import { useDragAndResize } from "./useDragAndResize";

import { EventControls } from "./EventControls";
import { ResizeHandle } from "./ResizeHandle";
import { EventTitleEditor } from "./EventTitleEditor";
import { useState } from "react";
import { eventsActions } from "@/utils/store/useEvents";
import WithLabel from "@/components/WithLabel";
import Button from "@/components/Button";
import { CalendarCheck, Trash2 } from "lucide-react";
import TimeRange from "@/components/TimeRange";
import usePopper from "@/components/Popper";
import SmartTextArea from "@/components/SmartTextArea";

export function EditableEvent({ event, onStartDrag, onEndDrag, onStartResize, onEndResize }) {
    const { isDragging, isResizing, isHovered,
        handleMouseDown, handleResizeDown, handleMouseEnter, handleMouseLeave,
    } = useDragAndResize({ onStartDrag, onEndDrag, onStartResize, onEndResize });
    const { isOpen, open, close, Popper, baseRef } = usePopper();

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
        bg-[#EF98A1] py-2 pr-10 pl-2 text-stone-800
        flex items-center justify-start text-sm
        pointer-events-auto transition-all cursor-grab
        z-5 relative
        h-full outline-2 outline-white
        hover:bg-[#E77885] hover:scale-102
    `;

    return (
        <>
            <div style={event.gridStyle} className="relative z-5" ref={baseRef}>
                <motion.div className={eventClasses} {...motionProps}>
                    <EventControls
                        event={event}
                        onSelect={() => open()}
                        visible={isHovered && !isDragging && !isResizing}
                    />

                    <EventTitleEditor event={event} />

                    <ResizeHandle
                        visible={(isHovered && !isDragging) || isResizing}
                        onMouseDown={handleResizeDown}
                    />
                </motion.div>
            </div>
            <Popper>
                <EditEvent event={event} onClose={close} />
            </Popper>
        </>
    );
}


function EditEvent({ event, onClose }) {
    const [startTime, setStartTime] = useState(event.start);
    const [endTime, setEndTime] = useState(event.end);
    const [title, setTitle] = useState(event.title);

    const handleSave = (e) => {
        e.preventDefault();
        onClose();
        eventsActions.updateEvent(event.id, {
            title: title,
            start: startTime,
            end: endTime,
        });
    };

    const handleDelete = () => {
        onClose();
        eventsActions.deleteEvent(event.id);
    };

    return (
        <div className="flex flex-col gap-2">
            <WithLabel label="כותרת">
                <SmartTextArea value={title} onChange={(e) => setTitle(e.target.value)} />
            </WithLabel>
            <WithLabel label="זמן">
                <TimeRange
                    defaultValue={{ start: startTime, end: endTime }}
                    onUpdate={({ start, end }) => {
                        setStartTime(start);
                        setEndTime(end);
                    }}
                />
            </WithLabel>
            <div className="flex justify-between mt-4">
                <Button data-role="save" onClick={handleSave} >
                    שמירה <CalendarCheck className="w-4 h-4" />
                </Button>
                <Button data-role="delete" onClick={handleDelete} >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
