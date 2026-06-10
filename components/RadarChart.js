'use client';

import { useMemo, useState, useRef } from 'react';

const TAU = Math.PI * 2;

// Find the angular midpoint of the gap between axes closest to bottom-left,
// weighted by gap size so the legend never crowds a narrow wedge.
function pickLegendAngle(axisAngles) {
    const sorted = [...axisAngles].sort((a, b) => a - b);
    const target = (3 * Math.PI) / 4; // bottom-left in SVG y-down

    const gaps = sorted.map((a, i) => {
        const b = i === sorted.length - 1 ? sorted[0] + TAU : sorted[i + 1];
        return { mid: (a + b) / 2, size: b - a };
    });

    let best = gaps[0], bestScore = -Infinity;
    for (const g of gaps) {
        let m = g.mid;
        while (m > Math.PI) m -= TAU;
        while (m <= -Math.PI) m += TAU;
        let diff = m - target;
        while (diff > Math.PI) diff -= TAU;
        while (diff < -Math.PI) diff += TAU;
        const score = g.size * 0.45 + Math.cos(diff) * 0.9;
        if (score > bestScore) { bestScore = score; best = { ...g, mid: m }; }
    }
    return best.mid;
}

export default function RadarChart({ data, size = 400, onEdit, showLegend = true }) {
    const [draggingIndex, setDraggingIndex] = useState(null);
    const svgRef = useRef(null);

    const center = size / 2;
    const maxRadius = size * 0.35;
    const gridLevels = 4;
    const gridLabels = ['לא בוצע', 'בוצע חלקית', 'בוצע', 'בוצע מעולה'];

    const legendWidth = showLegend ? Math.round(size * 0.38) : 0;
    const totalWidth = size + legendWidth;
    // x where leaders terminate and labels anchor (left edge of label text)
    const legendX = showLegend ? 0 : 0;
    // absolute x of chart center in SVG space
    const absCx = legendWidth + center;

    const calculatePoint = (index, value, total) => {
        const angle = (index / total) * TAU - Math.PI / 2;
        const radius = (value / 100) * maxRadius;
        const addedRadius = index % 2 === 0 ? 20 : 10; // optional: add small offset to odd points to break ties
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
            angle,
            labelX: center + (maxRadius + addedRadius) * Math.cos(angle),
            labelY: center + (maxRadius + addedRadius) * Math.sin(angle),
        };
    };

    const calculateValueFromPosition = (x, y) => {
        const dx = x - legendWidth - center;
        const dy = y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const value = Math.max(0, Math.min(100, (distance / maxRadius) * 100));
        return Math.round(value);
    };

    const createSmoothPath = (points) => {
        if (points.length === 0) return '';

        const tension = 0.4;

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

        const circles = Array.from({ length: gridLevels }, (_, i) => {
            const radius = ((i + 1) / gridLevels) * maxRadius;
            return radius;
        });

        const lines = data.map((_, index) => {
            const angle = (index / data.length) * TAU - Math.PI / 2;
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

    // Legend: one marker per ring level along the quietest angular gap,
    // with a horizontal dotted leader running left to legendX.
    const legendItems = useMemo(() => {
        if (!showLegend || data.length < 1) return [];

        const axisAngles = data.map((_, i) => (i / data.length) * TAU - Math.PI / 2);
        const rawTheta = pickLegendAngle(axisAngles);

        // Rotate ~20° toward straight-down (CCW on screen) to keep the legend
        // clear of the left-axis label (n=4 case). Skip the offset if it would
        // flip markers from the left half to the right half (n=3 case).
        const OFFSET = -Math.PI / 9;
        const theta = (Math.cos(rawTheta) <= 0 && Math.cos(rawTheta + OFFSET) > 0)
            ? rawTheta
            : rawTheta + OFFSET;

        // Ideal marker y-positions along theta. All equally spaced since ring
        // radii are evenly distributed and theta is constant.
        const minSpacing = 18; // px — fits 12px font with clearance
        const idealY = gridLabels.map((_, i) => center + ((i + 1) / gridLevels) * maxRadius * Math.sin(theta));

        // If the natural spacing is too tight (nearly-horizontal theta + small size),
        // spread y-values evenly around their midpoint, then project each back onto
        // its ring so markers stay on the rings and leaders stay horizontal.
        const totalSpread = Math.abs(idealY[gridLevels - 1] - idealY[0]);
        const needsSpread = totalSpread < minSpacing * (gridLevels - 1);
        const adjustedY = needsSpread
            ? (() => {
                const midY = (idealY[0] + idealY[gridLevels - 1]) / 2;
                const sign = idealY[gridLevels - 1] >= idealY[0] ? 1 : -1;
                return idealY.map((_, i) => midY + sign * (i - (gridLevels - 1) / 2) * minSpacing);
            })()
            : idealY;

        // Project each adjusted y back onto its ring, staying in the same half-plane
        // as theta (left half when cos ≤ 0, right half otherwise).
        const inLeftHalf = Math.cos(theta) <= 0;
        return gridLabels.map((label, i) => {
            const rk = ((i + 1) / gridLevels) * maxRadius;
            const my = Math.max(5, Math.min(size - 5, adjustedY[i]));
            const sinVal = Math.max(-1, Math.min(1, (my - center) / rk));
            let thetaK = Math.asin(sinVal); // [-π/2, π/2]
            if (inLeftHalf) thetaK = Math.PI - thetaK; // mirror into left half
            return { label, mx: absCx + rk * Math.cos(thetaK), my };
        });
    }, [showLegend, data.length, size]);

    const handlePointerDown = (index) => (e) => {
        if (!onEdit) return;
        e.preventDefault();
        setDraggingIndex(index);
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!onEdit || draggingIndex === null) return;

        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newValue = calculateValueFromPosition(x, y);

        const newData = data.map((item, i) =>
            i === draggingIndex ? { ...item, value: newValue } : item
        );

        onEdit(newData);
    };

    const handlePointerUp = (e) => {
        if (!onEdit || draggingIndex === null) return;
        e.target.releasePointerCapture(e.pointerId);
        setDraggingIndex(null);
    };

    return (
        <svg
            ref={svgRef}
            width={totalWidth}
            height={size}
            className="overflow-visible"
            onPointerMove={handlePointerMove}
        >
            <defs>
                <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="black" />
                </pattern>
            </defs>

            {/* Chart group offset right to make room for legend */}
            <g transform={`translate(${legendWidth}, 0)`}>
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

                {/* Axis labels */}
                {data.map((item, i) => {
                    const point = points[i];
                    const cos = Math.cos((i / data.length) * TAU - Math.PI / 2);
                    const anchor = cos > 0.1 ? 'end' : cos < -0.1 ? 'start' : 'middle';
                    return (
                        <text
                            key={i}
                            x={point.labelX}
                            y={point.labelY}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            direction="rtl"
                            fontSize="14"
                            fontWeight="500"
                            fill="#333"
                        >
                            {item.subject.split(' ').map((word, index) => (
                                <tspan key={index} x={point.labelX} dy={index === 0 ? '0' : '1em'}>
                                    {word}
                                </tspan>
                            ))}
                        </text>
                    );
                })}
            </g>

            {/* Legend rendered after the chart group so ring-ticks sit on top of rings.
                Each leader is perfectly horizontal: same y for both endpoints.
                label: text-anchor="end" + direction="rtl" anchors the visual left edge
                of the Hebrew word at legendX, so the word extends rightward over the leader,
                making the dashed line read as a soft underline beneath it. */}
            {showLegend && legendItems.map(({ label, mx, my }, i) => (
                <g key={i}>
                    <line
                        x1={mx} y1={my}
                        x2={legendX} y2={my}
                        stroke="#999"
                        strokeWidth="1.3"
                        strokeDasharray="2 3.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle
                        cx={mx} cy={my} r="3.8"
                        fill="#fff"
                        stroke="#999"
                        strokeWidth="1.4"
                    />
                    <text
                        x={legendX}
                        y={my - 5}
                        textAnchor="end"
                        dominantBaseline="alphabetic"
                        direction="rtl"
                        fontSize="12"
                        fontWeight="500"
                        fill="#999"
                    >
                        {label}
                    </text>
                </g>
            ))}
        </svg>
    );
}
