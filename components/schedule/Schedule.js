import { tw } from "@/utils/tw";
import { DAYS, HOURS } from "@/utils/store/scheduleDataStore";
import EventsGrid from "./Events";
import TasksGrid from "./Tasks";
import Gantt from "./Gantt";
import EmptySlotsGrid from "./EmptySlots";
import { create } from "zustand";
import { ChevronLeft, ChevronRight } from "lucide-react";


export const Grid = tw`absolute inset-0 grid gap-2`;
const Day = tw`col-span-2 
    flex flex-col items-center justify-start text-gray-800 text-lg font-semibold p-2
    rounded-lg bg-white/50 backdrop-blur-xs shadow mb-[-.5em]
    `
const Hour = tw`col-span-full flex items-center justify-start rounded-lg p-4 bg-[#EDCBBB] border-b border-gray-300 hover:bg-gray-300 transition-colors cursor-pointer ml-[-1em] text-white text-lg font-semibold`;

export const useWeek = create((set) => {
    const getWeekDates = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
    };
    return {
        week: getWeekDates(new Date()),
        setWeek: (date) => set({ week: getWeekDates(date) }),
        nextWeek: () => set((state) => {
            const newWeek = state.week.map(date => {
                const nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 7);
                return nextDate;
            });
            return { week: newWeek };
        }),
        prevWeek: () => set((state) => {
            const newWeek = state.week.map(date => {
                const prevDate = new Date(date);
                prevDate.setDate(date.getDate() - 7);
                return prevDate;
            });
            return { week: newWeek };
        })
    };
});


export default function Schedule() {
    const week = useWeek((state) => state.week);

    const gridData = {}

    gridData.taskRows = 1
    gridData.totalRows = Object.keys(HOURS).length + 2 + gridData.taskRows + 1;
    gridData.style = {
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: `2em repeat(${gridData.taskRows}, 2em) 1em repeat(${Object.keys(HOURS).length}, 2em) 1fr`
    }
    gridData.firstHourRow = gridData.totalRows - Object.keys(HOURS).length - 1

    return (
        <>
            {/* -------- HOURS --------- */}
            <Grid className='z-10' style={gridData.style}>
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
            <Grid className='z-20' style={gridData.style}>
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
                            {week[index].toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                        </div>
                    </Day>
                ))}
                <Gantt weekDays={week} />
            </Grid>

            <Grid className='z-30' style={gridData.style}>
                <div style={{ gridColumn: 13, gridRow: 1 }} className="relative">
                    <div className="absolute left-0 top-0 ml-[-2.5em] mt-2 rounded-full bg-transparent hover:bg-white p-1 cursor-pointer transition-colors"
                        onClick={() => useWeek.getState().nextWeek()}>
                        <ChevronLeft width="1.5em" height="1.5em" className="text-gray-800" />
                    </div>
                </div>
                <div style={{ gridColumn: 2, gridRowStart: 1, gridRowEnd: gridData.totalRows }} className="relative">
                    <div className="absolute right-0 top-0 mr-[-2.5em] mt-2 rounded-full bg-transparent hover:bg-white p-1 cursor-pointer transition-colors"
                        onClick={() => useWeek.getState().prevWeek()}>
                        <ChevronRight width="1.5em" height="1.5em" className="text-gray-800" />
                    </div>
                </div>
            </Grid>

            {/* -------- TASKS AND EVENTS --------- */}
            <EmptySlotsGrid gridData={gridData} />
            <TasksGrid gridData={gridData} />
            <EventsGrid gridData={gridData} />
        </>
    );
}

