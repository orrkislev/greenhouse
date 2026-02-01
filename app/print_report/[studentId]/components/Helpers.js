import { useCallback, useEffect, useRef, useState } from "react";


export function DraggableDivider({ onDrag }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            onDrag(e.clientY);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onDrag]);

    return (
        <div
            onMouseDown={handleMouseDown}
            className="h-3 cursor-row-resize flex items-center justify-center group transition-colors -my-1.5 z-10 relative"
            style={{ backgroundColor: isDragging ? '#bfdbfe' : 'transparent' }}
        >
            <div
                className="w-16 h-1 rounded-full transition-colors"
                style={{ backgroundColor: isDragging ? '#3b82f6' : undefined }}
            />
        </div>
    );
}

export function ResizableSections({ topSection, bottomSection, initialRatio = 0.5 }) {
    const [ratio, setRatio] = useState(initialRatio);
    const sectionRef = useRef(null);

    const handleDrag = useCallback((clientY) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        const relativeY = clientY - rect.top;
        const newRatio = Math.min(0.8, Math.max(0.2, relativeY / rect.height));
        setRatio(newRatio);
    }, []);

    return (
        <div ref={sectionRef} className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col min-h-0" style={{ flex: ratio }}>
                {topSection}
            </div>
            <DraggableDivider onDrag={handleDrag} />
            <div className="flex flex-col min-h-0" style={{ flex: 1 - ratio }}>
                {bottomSection}
            </div>
        </div>
    );
}