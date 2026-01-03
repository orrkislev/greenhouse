'use client';

import { useMemo } from 'react';

export default function Term({ project, research, term }) {
    const goal = project?.['הגדרת יעדים'].overview;
    const planning = project?.['תכנון'].overview;
    const learning = project?.['למידה וביצוע'].overview;
    const presentation = project?.['הצגה ותיעוד'].overview;

    const data = [
        { subject: 'הגדרת יעדים', value: goal || 0 },
        { subject: 'הצגה ותיעוד', value: presentation || 0 },
        { subject: 'למידה וביצוע', value: learning || 0 },
        { subject: 'תכנון', value: planning || 0 },
    ];

    return (
        <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden'>
            <div className='bg-black p-1 flex items-center justify-center'>
                <div className='text-white rotate-90 text-2xl font-bold'>
                    תקופת {term}
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-16">
                <div className="flex-1 flex gap-4">
                    <div className="flex-1 p-4">
                        <div className="">פרויקט ה{project?.term}</div>
                        <div className="text-xl font-bold">{project?.title}</div>
                        <div className="text-sm text-muted-foreground mb-4">בליווי {project?.master?.first_name}</div>
                        <div className="text-sm italic">{project?.summary}</div>
                        <div className="text-sm italic text-muted-foreground">{project?.next_steps}</div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <SmoothRadarChart data={data} size={200} />
                    </div>
                </div>

                <div className="flex-1 flex gap-4">
                    <div className="flex-1 p-4">
                        <div className="">חקר ה{term}</div>
                        <div className="text-xl font-bold">{research?.title}</div>
                        <div className="text-sm italic mt-4">{research?.summary}</div>
                        <div className="text-sm italic text-muted-foreground">{research?.next_steps}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

















function SmoothRadarChart({ data, size = 400 }) {
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

    // Create smooth path using cardinal spline interpolation
    const createSmoothPath = (points) => {
        if (points.length === 0) return '';

        const tension = 0.4; // Controls smoothness (0 = straight lines, 1 = very curvy)
        const closed = true;

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

    return (
        <svg width={size} height={size} className="overflow-visible">
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
                    r="3"
                    fill="black"
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