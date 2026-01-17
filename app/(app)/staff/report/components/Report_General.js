import { Heart, Star, Coins, Globe } from "lucide-react";
import { ReportPageSection, SectionSubtitle, SectionText } from "./Layout";

function MiniIkigai({ ikigai }) {
    const markers = ikigai?.markers || [];
    const size = 140;
    const circleSize = size * 0.5;
    const offset = size * 0.18;

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
                <Heart className="w-4 h-4 text-gray-500 -translate-y-2" />
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
                <Star className="w-4 h-4 text-gray-500 -translate-x-2" />
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
                <Globe className="w-4 h-4 text-gray-500 translate-x-2" />
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
                <Coins className="w-4 h-4 text-gray-500 translate-y-2" />
            </div>

            {/* Markers with labels and connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {markers.map(marker => {
                    const markerX = (marker.x / 100) * size;
                    const markerY = (marker.y / 100) * size;

                    // Determine label position based on marker location
                    const isLeft = marker.x < 50;
                    const isTop = marker.y < 50;
                    const labelOffsetX = isLeft ? -45 : 45;
                    const labelOffsetY = isTop ? -20 : 20;

                    return (
                        <g key={marker.id}>
                            {/* Connecting line */}
                            <line
                                x1={markerX}
                                y1={markerY}
                                x2={markerX + labelOffsetX * 0.7}
                                y2={markerY + labelOffsetY * 0.7}
                                stroke="#374151"
                                strokeWidth="0.5"
                            />
                            {/* Marker dot */}
                            <circle cx={markerX} cy={markerY} r="2.5" fill="#374151" />
                            {/* Label box */}
                            {marker.label && (
                                <foreignObject
                                    x={markerX + (isLeft ? labelOffsetX - 35 : labelOffsetX - 5)}
                                    y={markerY + labelOffsetY - 8}
                                    width="40"
                                    height="16"
                                    overflow="visible"
                                >
                                    <div className="px-1 py-0.5 bg-white border border-gray-400 text-[7px] text-gray-700 whitespace-nowrap text-center">
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
        <ReportPageSection title="מבט כללי" className="flex-2">
            <div className='w-full flex-1 h-full flex gap-4'>
                <div className='flex-1 flex flex-col gap-2'>
                    <SectionSubtitle>איקיגאי</SectionSubtitle>
                    <div className="flex justify-center">
                        <MiniIkigai ikigai={student.student?.ikigai} />
                    </div>
                </div>
                <div className='flex-1 flex flex-col gap-1'>
                    <SectionSubtitle>ממני אליך</SectionSubtitle>
                    <SectionText>{student.student?.mentors}</SectionText>
                </div>
            </div>
        </ReportPageSection>
    )
}