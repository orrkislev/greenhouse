import { tw } from "@/utils/tw";
import { useState } from "react"
import ListView from "./ListView";
import { CalendarDays, BetweenHorizonalEnd, TableOfContents, Plus } from "lucide-react";
import WeeklyView from "./WeeklyView";
import CalendarView from "./CalendarView";
import { format } from "date-fns";
import { projectTasksActions, useProjectTasks, useProjectTasksData } from "@/utils/store/useProjectTasks";
import Box2 from "@/components/Box2";

const NewTaskButton = tw`px-4 py-1 bg-primary text-white hover:bg-primary/80 transition-colors flex gap-1 transition-all duration-300 rounded-lg`;

const ViewButton = tw`px-3 py-1 flex items-center gap-1 transition-colors
    hover:bg-stone-100 cursor-pointer ${props => props.$active ? 'bg-stone-200' : ''}`;

export default function ProjectTasks() {
    const projectTasks = useProjectTasks()
    const view = useProjectTasksData((state) => state.view);

    const createNewTask = () => {
        const newTask = {
            title: "משימה נחמדה",
            description: "Task description",
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        }
        projectTasksActions.addTask(newTask);
    }

    const ViewComponent = views[view]?.component

    return (
        <Box2 label="תכנית עבודה" className="bg-white pb-6">
            <div className="flex gap-4 mb-4 justify-between">
                <NewTaskButton onClick={createNewTask} className="group/newTask">
                    <Plus className="w-6 h-6" />
                    <div className="">משימה חדשה</div>
                </NewTaskButton>
                <ViewSelector />
            </div>
            <ViewComponent />
        </Box2>
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
}

function ViewSelector() {
    const view = useProjectTasksData((state) => state.view);
    const setView = useProjectTasksData((state) => state.setView);

    const [isOpen, setIsOpen] = useState(false);
    const selectView = (newView) => {
        setView(newView);
        setIsOpen(false);
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <span>שיטת עבודה:</span>
            <h2 className="underline hover:bg-stone-100 hover:underline cursor-pointer transition-colors duration-200"
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