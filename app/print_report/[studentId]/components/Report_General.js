import { Heart, Star, Coins, Globe } from "lucide-react";
import { ReportPageSection, SectionSubtitle, SectionText } from "./Layout";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

function MiniIkigai({ ikigai }) {
    const markers = ikigai?.markers || [];
    const size = 250;
    const circleSize = size * 0.5;
    const offset = size * 0.18;
    const svgRef = useRef(null);
    const labelRefs = useRef({});
    const [labelOffsets, setLabelOffsets] = useState({});
    const [labelSizes, setLabelSizes] = useState({});
    const dragRef = useRef(null);

    const markerPositions = useMemo(() => {
        const map = {};
        markers.forEach(marker => {
            map[marker.id] = {
                x: (marker.x / 100) * size,
                y: (marker.y / 100) * size,
            };
        });
        return map;
    }, [markers, size]);

    useEffect(() => {
        setLabelOffsets(prev => {
            const next = { ...prev };
            let changed = false;
            markers.forEach(marker => {
                if (!next[marker.id]) {
                    const isLeft = marker.x < 50;
                    const isTop = marker.y < 50;
                    next[marker.id] = {
                        x: isLeft ? -45 : 45,
                        y: isTop ? -20 : 20,
                    };
                    changed = true;
                }
            });
            if (!changed) return prev;
            return next;
        });
    }, [markers]);

    useLayoutEffect(() => {
        const nextSizes = {};
        Object.entries(labelRefs.current).forEach(([id, el]) => {
            if (el) {
                const rect = el.getBoundingClientRect();
                nextSizes[id] = { width: rect.width, height: rect.height };
            }
        });
        setLabelSizes(prev => {
            let changed = false;
            Object.entries(nextSizes).forEach(([id, size]) => {
                const prevSize = prev[id];
                if (!prevSize || prevSize.width !== size.width || prevSize.height !== size.height) {
                    changed = true;
                }
            });
            return changed ? nextSizes : prev;
        });
    }, [markers, labelOffsets]);

    const getSvgPoint = (evt) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const screenCTM = svg.getScreenCTM();
        if (!screenCTM) return { x: 0, y: 0 };
        const result = pt.matrixTransform(screenCTM.inverse());
        return { x: result.x, y: result.y };
    };

    const onPointerDown = (evt, markerId) => {
        if (evt.button !== 0) return;
        const startPoint = getSvgPoint(evt);
        const startOffset = labelOffsets[markerId] || { x: 0, y: 0 };
        dragRef.current = {
            markerId,
            startPoint,
            startOffset,
            dragging: false,
            pointerId: evt.pointerId,
        };
    };

    const onPointerMove = (evt) => {
        if (!dragRef.current) return;
        const { markerId, startPoint, startOffset, dragging, pointerId } = dragRef.current;
        const currentPoint = getSvgPoint(evt);
        const deltaX = currentPoint.x - startPoint.x;
        const deltaY = currentPoint.y - startPoint.y;
        if (!dragging) {
            const distance = Math.hypot(deltaX, deltaY);
            if (distance < 3) return;
            dragRef.current.dragging = true;
            evt.currentTarget.setPointerCapture?.(pointerId);
        }
        evt.preventDefault();
        setLabelOffsets(prev => ({
            ...prev,
            [markerId]: {
                x: startOffset.x + deltaX,
                y: startOffset.y + deltaY,
            },
        }));
    };

    const onPointerUp = (evt) => {
        if (!dragRef.current) return;
        if (dragRef.current.dragging) {
            evt.preventDefault();
        }
        dragRef.current = null;
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Four overlapping circles */}
            {/* Top circle - Heart */}
            <div
                className="absolute rounded-full bg-gray-300/60 flex items-center justify-center"
                style={{
                    width: circleSize,
                    height: circleSize,
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
            >
                <Heart className="w-6 h-6 text-gray-500 -translate-y-3" />
            </div>
            {/* Left circle - Star */}
            <div
                className="absolute rounded-full bg-gray-300/60 flex items-center justify-center"
                style={{
                    width: circleSize,
                    height: circleSize,
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)'
                }}
            >
                <Star className="w-6 h-6 text-gray-500 -translate-x-3" />
            </div>
            {/* Right circle - Globe */}
            <div
                className="absolute rounded-full bg-gray-300/60 flex items-center justify-center"
                style={{
                    width: circleSize,
                    height: circleSize,
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)'
                }}
            >
                <Globe className="w-6 h-6 text-gray-500 translate-x-3" />
            </div>
            {/* Bottom circle - Coins */}
            <div
                className="absolute rounded-full bg-gray-300/60 flex items-center justify-center"
                style={{
                    width: circleSize,
                    height: circleSize,
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
            >
                <Coins className="w-6 h-6 text-gray-500 translate-y-3" />
            </div>

            {/* Markers with labels and connecting lines */}
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full overflow-visible"
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            >
                {markers.map(marker => {
                    const markerX = (marker.x / 100) * size;
                    const markerY = (marker.y / 100) * size;

                    const currentOffset = labelOffsets[marker.id] || { x: 0, y: 0 };
                    const labelX = markerX + currentOffset.x;
                    const labelY = markerY + currentOffset.y;
                    const labelSize = labelSizes[marker.id] || { width: 40, height: 16 };
                    const lineEndX = labelX - labelSize.width / 2;
                    const lineEndY = labelY + labelSize.height / 2;

                    return (
                        <g key={marker.id}>
                            {/* Connecting line */}
                            <line
                                x1={markerX}
                                y1={markerY}
                                x2={lineEndX}
                                y2={lineEndY}
                                stroke="#374151"
                                strokeWidth="0.5"
                            />
                            {/* Marker dot */}
                            <circle cx={markerX} cy={markerY} r="2.5" fill="#374151" />
                            {/* Label box */}
                            {marker.label && (
                                <foreignObject
                                    x={labelX}
                                    y={labelY}
                                    width="1"
                                    height="1"
                                    overflow="visible"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <div
                                        ref={(el) => {
                                            if (el) labelRefs.current[marker.id] = el;
                                        }}
                                        onPointerDown={(evt) => onPointerDown(evt, marker.id)}
                                        className="inline-block px-1 py-0.5 bg-white border border-gray-400 text-[14px] text-gray-700 whitespace-nowrap text-center outline-none focus:border-[#60a5fa] cursor-move"
                                        contentEditable
                                        suppressContentEditableWarning
                                    >
                                        {marker.label}
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function Report_General({ student }) {
    return (
        <ReportPageSection title="מבט כללי">
            <div className='w-full flex-1 h-full flex gap-4'>
                <div className='flex-1 flex flex-col gap-2'>
                    <SectionSubtitle>איקיגאי</SectionSubtitle>
                    <div className="flex justify-center">
                        <MiniIkigai ikigai={student.ikigai} />
                    </div>
                </div>
                <div className='flex-1 flex flex-col gap-1'>
                    <SectionSubtitle>ממני אליך</SectionSubtitle>
                    <SectionText>{student.mentors}</SectionText>
                </div>
            </div>
        </ReportPageSection>
    )
}