import { useEffect, useState } from "react";

export function useDragAndResize({ onStartDrag, onEndDrag, onStartResize, onEndResize }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Dragging logic
    useEffect(() => {
        if (!isDragging) return;
        onStartDrag?.(isDragging);
        
        const onMouseUp = () => {
            setIsDragging(false);
            onEndDrag?.();
        };
        
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isDragging, onStartDrag, onEndDrag]);

    // Resizing logic
    useEffect(() => {
        if (!isResizing) return;
        onStartResize?.();
        
        const onMouseUp = () => {
            setIsResizing(false);
            onEndResize?.();
        };
        
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isResizing, onStartResize, onEndResize]);

    const handleMouseDown = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setIsDragging(e.clientY - rect.top);
    };

    const handleResizeDown = (e) => {
        e.stopPropagation();
        setIsResizing(true);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return {
        isDragging,
        isResizing,
        isHovered,
        handleMouseDown,
        handleResizeDown,
        handleMouseEnter,
        handleMouseLeave,
    };
}
