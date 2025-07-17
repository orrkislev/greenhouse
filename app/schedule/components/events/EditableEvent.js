'use client';

import { motion } from "motion/react";
import { useDragAndResize } from "./useDragAndResize";

import { EventControls } from "./EventControls";
import { ResizeHandle } from "./ResizeHandle";
import { EventTitleEditor } from "./EventTitleEditor";
import { useEventPosition } from "./useEventPosition";

export function EditableEvent({ event, onStartDrag, onEndDrag, onStartResize, onEndResize, onSelect }) {
    const {
        isDragging,
        isResizing,
        isHovered,
        handleMouseDown,
        handleResizeDown,
        handleMouseEnter,
        handleMouseLeave,
    } = useDragAndResize({ onStartDrag, onEndDrag, onStartResize, onEndResize });

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
        <div style={event.gridStyle} className="relative z-5">
            <motion.div className={eventClasses} {...motionProps}>
                <EventControls
                    event={event}
                    onSelect={onSelect}
                    visible={isHovered && !isDragging && !isResizing}
                />

                <EventTitleEditor event={event} />

                <ResizeHandle
                    visible={(isHovered && !isDragging) || isResizing}
                    onMouseDown={handleResizeDown}
                />
            </motion.div>
        </div >
    );
}