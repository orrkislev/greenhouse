import { useGantt } from "@/utils/store/scheduleDataStore";
import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";

const GanttDay = tw`col-span-2
    flex items-center justify-center text-gray-800 text-xs p-2
    rounded-sm bg-pink-300/50 backdrop-blur-xs shadow mb-[-.5em]
`;

export default function Gantt({ weekDays }) {
    const { gantt } = useGantt();

    return (
        <>
            {weekDays.map((date, index) => (
                <GanttDay key={`empty-${index}`}
                    style={{
                        marginTop: '0.5em',
                        gridColumnStart: index * 2 + 2,
                        pointerEvents: 'none',
                    }}
                >
                    {gantt.find(g => g.date === formatDate(date))?.text || ''}
                </GanttDay>
            ))}
        </>
    );
}


