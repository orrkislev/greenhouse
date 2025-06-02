import { tw } from "@/utils/tw";
import { DAYS, HOURS } from "@/utils/store/scheduleDataStore";
import EventsGrid from "./Events";
import TasksGrid from "./Tasks";
import Gantt from "./Gantt";
import EmptySlotsGrid from "./EmptySlots";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWeek } from "@/utils/store/scheduleDisplayStore";


const ScheduleContainer = tw`select-none w-full relative h-full`
export const Grid = tw`absolute w-full grid gap-2`;
const Day = tw`flex flex-col items-center justify-start text-gray-800 text-lg font-semibold p-2
    rounded-lg bg-white/50 backdrop-blur-xs shadow mb-[-.5em]
    `
const Hour = tw`col-span-full flex items-center justify-start rounded-lg p-4 bg-[#EDCBBB] border-b border-gray-300 hover:bg-gray-300 transition-colors cursor-pointer ml-[-1em] text-white text-lg font-semibold`;



export default function Schedule() {
    const week = useWeek((state) => state.week);

    const gridData = {}

    gridData.taskRows = 1
    gridData.totalRows = HOURS.length + 2 + gridData.taskRows + 1;
    gridData.style = {
        gridTemplateColumns: '1fr repeat(6, 2fr)',
        gridTemplateRows: `2em repeat(${gridData.taskRows}, 2em) 1em repeat(${HOURS.length}, 2em) 1fr`
    }
    gridData.firstHourRow = gridData.totalRows - HOURS.length

    return (
        <ScheduleContainer>
            {/* -------- HOURS --------- */}
            <Grid className='z-10' style={gridData.style}>
                {HOURS.map((hour, index) => (
                    <Hour key={index}
                        style={{
                            gridRowStart: index + gridData.firstHourRow,
                            backgroundColor: index === HOURS.length - 1 ? '#B8A1D9' : undefined // Different color for last hour
                        }}
                    >
                        {hour}
                    </Hour>
                ))}
            </Grid>

            {/* -------- DAYS --------- */}
            <Grid className='z-20' style={gridData.style}>
                {Object.values(DAYS).map((day, index) => (
                    <Day key={index}
                        style={{
                            gridColumnStart: index + 2,
                            gridRowStart: 1,
                            gridRowEnd: gridData.totalRows,
                            backgroundColor: index === 5 ? '#B8A1D944' : undefined
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

            {/* -------- TASKS AND EVENTS --------- */}
            <EmptySlotsGrid gridData={gridData} />
            <TasksGrid gridData={gridData} />
            <EventsGrid gridData={gridData} />

            <Grid className='z-30' style={{ ...gridData.style, gridTemplateRows: '2em' }} >
                <div style={{ gridColumn: 7, gridRow: 1 }} className="relative">
                    <div className="absolute left-0 top-0 ml-[-2.5em] mt-2 rounded-full bg-transparent hover:bg-white p-1 cursor-pointer transition-colors"
                        onClick={() => useWeek.getState().nextWeek()}>
                        <ChevronLeft width="1.5em" height="1.5em" className="text-gray-800" />
                    </div>
                </div>
                <div style={{ gridColumn: 1, gridRowStart: 1, gridRowEnd: gridData.totalRows }} className="relative">
                    <div className="absolute left-0 top-0 mr-[-2.5em] mt-2 rounded-full bg-transparent hover:bg-white p-1 cursor-pointer transition-colors"
                        onClick={() => useWeek.getState().prevWeek()}>
                        <ChevronRight width="1.5em" height="1.5em" className="text-gray-800" />
                    </div>
                </div>
            </Grid>
        </ScheduleContainer>
    );
}

