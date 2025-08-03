import { tw } from "@/utils/tw";
import { useEffect, useState } from "react"
import ListView from "./ListView";
import { List, CalendarDays, Route, BetweenHorizonalEnd, TableOfContents } from "lucide-react";
import WeeklyView from "./WeeklyView";
import CalendarView from "./CalendarView";
import { format } from "date-fns";
import { projectTasksActions, useProjectTasks } from "@/utils/store/useProjectTasks";

const NewTaskButton = tw`px-4 py-1 bg-blue-500 text-white hover:bg-blue-600 transition-colors`;

const ViewButton = tw`px-3 py-1 flex items-center gap-1 transition-colors
    hover:bg-gray-100 cursor-pointer ${props => props.$active ? 'bg-gray-200' : ''}`;

export default function ProjectTasks() {
    const view = useProjectTasks((state) => state.view);
    const tasks = useProjectTasks((state) => state.tasks);

    useEffect(()=>{
        projectTasksActions.loadAllTasks();
    }, [])

    const createNewTask = () => {
        const newTask = {
            title: "משימה " + (tasks.length + 1),
            description: "Task description",
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        }
        projectTasksActions.addTask(newTask);
    }

    const ViewComponent = views[view].component;

    return (
        <div className="p-6 border border-gray-400 flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-4 justify-between">
                <div className="text-xl">
                    תכנית עבודה
                </div>
                <ViewSelector />
            </div>
            <div className='flex justify-between items-center'>
                <NewTaskButton onClick={createNewTask}>
                    הוספת משימה חדשה
                </NewTaskButton>
            </div>

            <ViewComponent />
        </div>
    )
}


const views = {
    list: {
        label: 'רשימת משימות',
        icon: TableOfContents,
        component: ListView,
    },
    weekly: {
        label: 'מטרות שבועיות',
        icon: BetweenHorizonalEnd,
        component: WeeklyView,
    },
    calendar: {
        label: 'לוח שנה',
        icon: CalendarDays,
        component: CalendarView,
    },
    // timeline: {
    //     label: 'ציר זמן',
    //     icon: Route,
    //     component: () => <div>Timeline View (not implemented)</div>,
    //     // Placeholder for future implementation
    // }
}

function ViewSelector() {
    const view = useProjectTasks((state) => state.view);
    const setView = useProjectTasks((state) => state.setView);

    const [isOpen, setIsOpen] = useState(false);
    const selectView = (newView) => {
        setView(newView);
        setIsOpen(false);
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <span>שיטת עבודה:</span>
            <h2 className="underline hover:bg-gray-100 hover:underline cursor-pointer transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}>
                {views[view].label}
            </h2>
            {isOpen && (
                <div className='fixed top-0 left-0 w-full h-full bg-black/20 z-10'
                    onClick={() => setIsOpen(false)} />
            )}
            {isOpen && (
                <div className="absolute bg-white shadow-lg rounded p-2 z-30">
                    {Object.entries(views).map(([key, { label, icon: Icon }]) => (
                        <ViewButton key={key} $active={view === key} onClick={() => selectView(key)}>
                            <Icon className="w-4 h-4" />
                            {label}
                        </ViewButton>
                    ))}
                </div>
            )}
        </div>
    );
}