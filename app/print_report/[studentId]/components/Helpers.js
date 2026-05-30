import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";


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

export function ResizableSections({ sections, initialSizes }) {
    const n = sections.length;

    const [sizes, setSizes] = useState(() => {
        if (!initialSizes) return sections.map(() => 1 / n);
        const total = initialSizes.reduce((a, b) => a + b, 0);
        return initialSizes.map(s => s / total);
    });

    const containerRef = useRef(null);
    const sectionRefs = useRef([]);

    // When no initialSizes: after first paint, measure natural scrollHeight of each section.
    // If all content fits within the container, size proportionally; otherwise keep equal.
    useLayoutEffect(() => {
        if (initialSizes || n <= 1) return;
        const containerH = containerRef.current?.getBoundingClientRect().height;
        if (!containerH) return;
        const naturalHeights = sectionRefs.current.map(el => el?.scrollHeight ?? 0);
        const total = naturalHeights.reduce((a, b) => a + b, 0);
        if (total > 0 && total <= containerH) {
            setSizes(naturalHeights.map(h => h / containerH));
        }
    }, []);

    const handleDrag = useCallback((divIdx, clientY) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setSizes(prev => {
            const next = [...prev];
            const sumBefore = prev.slice(0, divIdx).reduce((a, b) => a + b, 0);
            const combined = prev[divIdx] + prev[divIdx + 1];
            const minFrac = 0.05;
            const raw = (clientY - rect.top) / rect.height - sumBefore;
            next[divIdx]     = Math.min(combined - minFrac, Math.max(minFrac, raw));
            next[divIdx + 1] = combined - next[divIdx];
            return next;
        });
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col flex-1 min-h-0">
            {sections.map((section, i) => (
                <Fragment key={i}>
                    <div
                        ref={el => sectionRefs.current[i] = el}
                        className="flex flex-col min-h-0"
                        style={{ flex: sizes[i] }}
                    >
                        {section}
                    </div>
                    {i < n - 1 && (
                        <DraggableDivider onDrag={(y) => handleDrag(i, y)} />
                    )}
                </Fragment>
            ))}
        </div>
    );
}