import { tw } from "@/utils/tw";
import { useMemo, useState } from "react"
import ListView from "./ListView";
import { CalendarDays, BetweenHorizonalEnd, TableOfContents, Plus } from "lucide-react";
import WeeklyView from "./WeeklyView";
import CalendarView from "./CalendarView";
import { useProjectTasks } from "@/utils/store/useProjectTasks";
import Box2 from "@/components/Box2";
import { projectActions, projectUtils, useProjectData } from "@/utils/store/useProject";
import TaskModal from "@/components/TaskModal";
import { ButtonGroup, ButtonGroupItem } from "@/components/Button";
import Menu, { MenuItem, MenuList } from "@/components/Menu";

const NewTaskButton = tw`px-4 py-1 bg-primary text-white hover:bg-primary/80 transition-colors flex gap-1 transition-all duration-300 rounded-lg`;

export default function ProjectTasks() {
    const projectTasks = useProjectTasks()
    const project = useProjectData(state => state.project)
    const taskStyle = useProjectData(state => state.project.metadata.taskStyle)
    const [isOpen, setIsOpen] = useState(false)

    const ViewComponent = views[taskStyle || 'list'].component

    const taskContext = useMemo(() => projectUtils.getContext(project.id), [project])

    return (
        <>
            <Box2 label="תכנית עבודה" className="bg-white pb-6 relative">
                <div className="flex gap-4 mb-4 justify-between">
                    <NewTaskButton onClick={() => setIsOpen(true)} className="group/newTask">
                        <Plus className="w-6 h-6" />
                        <div className="">משימה חדשה</div>
                    </NewTaskButton>
                </div>
                <Menu className="absolute left-4 top-4">
                    <MenuList>
                        <MenuItem title="משימה חדשה" icon={Plus} onClick={() => setIsOpen(true)} />
                    </MenuList>
                </Menu>
                <ViewSelector />
                <ViewComponent />
            </Box2>
            <TaskModal task={null} isOpen={isOpen} onClose={() => setIsOpen(false)} context={taskContext} />
        </>
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
    const taskStyle = useProjectData(state => state.project.metadata.taskStyle)

    const selectView = (newView) => {
        projectActions.updateMetadata({ taskStyle: newView })
    }

    return (
        <ButtonGroup>
            {Object.entries(views).map(([key, { label, icon: Icon }]) => (
                <ButtonGroupItem key={key} active={taskStyle === key} onClick={() => selectView(key)} className="flex items-center gap-1 px-4">
                    <Icon className="w-4 h-4" />
                    {label}
                </ButtonGroupItem>
            ))}
        </ButtonGroup>
    )
}