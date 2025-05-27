import { tw } from "@/utils/tw";
import { DAYS, HOURS } from "@/utils/store/scheduleDataStore";
import EventsGrid from "./Events";
import TasksGrid from "./Tasks";
import Gantt from "./Gantt";
import EmptySlotsGrid from "./EmptySlots";


export const Grid = tw`absolute inset-0 grid grid-cols-[repeat(13,1fr)] gap-2`;
const Day = tw`col-span-2 
    flex flex-col items-center justify-start text-gray-800 text-lg font-semibold p-2
    rounded-lg bg-white/50 backdrop-blur-xs shadow mb-[-.5em]
    `

const Hour = tw`col-span-full flex items-center justify-start rounded-lg p-4 bg-[#EDCBBB] border-b border-gray-300 hover:bg-gray-300 transition-colors cursor-pointer ml-[-1em] text-white text-lg font-semibold`;

export default function Schedule() {
    const gridData = {}

    gridData.taskRows = 1
    gridData.totalRows = Object.keys(HOURS).length + 2 + gridData.taskRows + 1;
    gridData.template = `2em repeat(${gridData.taskRows}, 2em) 1em repeat(${Object.keys(HOURS).length}, 2em) 1fr`;
    gridData.firstHourRow = gridData.totalRows - Object.keys(HOURS).length - 1

    // Calculate current week dates (Sunday to Saturday)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    gridData.weekDates = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });




    return (
        <>
            {/* -------- HOURS --------- */}
            <Grid className='z-10' style={{ gridTemplateRows: gridData.template }}>
                {Object.values(HOURS).map((hour, index) => (
                    <Hour key={index}
                        style={{
                            gridRowStart: hour.index + gridData.firstHourRow,
                            backgroundColor: index === Object.values(HOURS).length - 1 ? '#B8A1D9' : undefined // Different color for last hour
                        }}
                    >
                        {hour.label}
                    </Hour>
                ))}
            </Grid>

            {/* -------- DAYS --------- */}
            <Grid className='z-20' style={{ gridTemplateRows: gridData.template }}>
                {Object.values(DAYS).map((day, index) => (
                    <Day key={index}
                        style={{
                            gridColumnStart: index * 2 + 2,
                            gridRowStart: 1,
                            gridRowEnd: gridData.totalRows
                        }}
                    >
                        {/* <div>{day.label}</div> */}
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {gridData.weekDates[index].toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                        </div>
                    </Day>
                ))}
                <Gantt weekDays={gridData.weekDates} />
            </Grid>

            {/* -------- TASKS AND EVENTS --------- */}
            <EmptySlotsGrid gridData={gridData} />
            <TasksGrid gridData={gridData} />
            <EventsGrid gridData={gridData} />
        </>
    );
}

