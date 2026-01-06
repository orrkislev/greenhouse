'use client';

import { useMemo, useState, useRef } from 'react';

export default function RadarChart({ data, size = 400, onEdit }) {
    const [draggingIndex, setDraggingIndex] = useState(null);
    const svgRef = useRef(null);

    const center = size / 2;
    const maxRadius = size * 0.35;
    const gridLevels = 4;

    // Calculate points for each metric on a circle
    const calculatePoint = (index, value, total) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
        const radius = (value / 100) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
            angle,
            labelX: center + (maxRadius + 20) * Math.cos(angle),
            labelY: center + (maxRadius + 20) * Math.sin(angle),
        };
    };

    // Calculate value from mouse position
    const calculateValueFromPosition = (x, y, angle) => {
        const dx = x - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const value = Math.max(0, Math.min(100, (distance / maxRadius) * 100));
        return Math.round(value);
    };

    // Create smooth path using cardinal spline interpolation
    const createSmoothPath = (points) => {
        if (points.length === 0) return '';

        const tension = 0.4; // Controls smoothness (0 = straight lines, 1 = very curvy)

        // Cardinal spline interpolation
        const getControlPoints = (p0, p1, p2, p3) => {
            const d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
            const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            const d23 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));

            const fa = tension * d01 / (d01 + d12);
            const fb = tension * d12 / (d12 + d23);

            return {
                cp1x: p1.x + fa * (p2.x - p0.x),
                cp1y: p1.y + fa * (p2.y - p0.y),
                cp2x: p2.x - fb * (p3.x - p1.x),
                cp2y: p2.y - fb * (p3.y - p1.y),
            };
        };

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length; i++) {
            const p0 = points[(i - 1 + points.length) % points.length];
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];

            const { cp1x, cp1y, cp2x, cp2y } = getControlPoints(p0, p1, p2, p3);
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        return path + ' Z';
    };

    const { points, gridCircles, gridLines } = useMemo(() => {
        const pts = data.map((item, index) =>
            calculatePoint(index, item.value, data.length)
        );

        // Create circular grid
        const circles = Array.from({ length: gridLevels }, (_, i) => {
            const radius = ((i + 1) / gridLevels) * maxRadius;
            return radius;
        });

        // Create radial grid lines
        const lines = data.map((_, index) => {
            const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
            return {
                x1: center,
                y1: center,
                x2: center + maxRadius * Math.cos(angle),
                y2: center + maxRadius * Math.sin(angle),
            };
        });

        return { points: pts, gridCircles: circles, gridLines: lines };
    }, [data, size]);

    const smoothPath = createSmoothPath(points);

    // Handle drag start
    const handlePointerDown = (index) => (e) => {
        if (!onEdit) return;
        e.preventDefault();
        setDraggingIndex(index);
        e.target.setPointerCapture(e.pointerId);
    };

    // Handle drag move
    const handlePointerMove = (e) => {
        if (!onEdit || draggingIndex === null) return;

        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const angle = points[draggingIndex].angle;
        const newValue = calculateValueFromPosition(x, y, angle);

        const newData = data.map((item, i) =>
            i === draggingIndex ? { ...item, value: newValue } : item
        );

        onEdit(newData);
    };

    // Handle drag end
    const handlePointerUp = (e) => {
        if (!onEdit || draggingIndex === null) return;
        e.target.releasePointerCapture(e.pointerId);
        setDraggingIndex(null);
    };

    return (
        <svg
            ref={svgRef}
            width={size}
            height={size}
            className="overflow-visible"
            onPointerMove={handlePointerMove}
        >
            <defs>
                <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="black" />
                </pattern>
            </defs>

            {/* Circular grid */}
            {gridCircles.map((radius, i) => (
                <circle
                    key={i}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="1"
                />
            ))}

            {/* Radial grid lines */}
            {gridLines.map((line, i) => (
                <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                />
            ))}

            {/* Smooth blob shape */}
            <path
                d={smoothPath}
                fill="url(#dotPattern)"
                fillOpacity={0.4}
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, i) => (
                <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r={onEdit ? 4 : 3}
                    fill="black"
                    onPointerDown={handlePointerDown(i)}
                    onPointerUp={handlePointerUp}
                    style={{
                        cursor: onEdit ? 'grab' : 'default',
                        ...(draggingIndex === i && { cursor: 'grabbing' })
                    }}
                />
            ))}

            {/* Labels */}
            {data.map((item, i) => {
                const point = points[i];
                return (
                    <text
                        key={i}
                        x={point.labelX}
                        y={point.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="500"
                        fill="#333"
                    >
                        {item.subject}
                    </text>
                );
            })}
        </svg>
    );
}
