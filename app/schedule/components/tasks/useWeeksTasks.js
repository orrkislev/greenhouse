import { useGroups } from "@/utils/useGroups";
import { useWeek } from "../../utils/useWeek";
import { useTasks } from "@/utils/useTasks";

export default function useWeeksTasks() {
    const tasks = useTasks(state => state.tasks);
    const groups = useGroups(state => state.groups);
    const week = useWeek(state => state.week);

    const groupTasks = groups.filter(group => group.entries).flatMap(group =>
        group.entries
            .filter(entry => entry.type === 'task')
            .filter(task => task.date >= week[0] && task.date <= week[week.length - 1])
            .filter(task => task.isMember)
            .map(task => ({
                ...task,
                start: task.date,
                end: task.date,
            }))
    );

    const displayTasks = [...tasks, ...groupTasks];
    const columns = week.map(date => ({ date, tasks: [] }));
    displayTasks.forEach(task => {
        let startIndex = week.findIndex(date => date === task.start);
        let endIndex = week.findIndex(date => date === task.end);

        if (startIndex === -1) startIndex = 0;
        if (endIndex === -1) endIndex = week.length - 1;

        task.row = columns[startIndex].tasks.length + 1;
        columns[startIndex].tasks.push(task);
        for (let i = startIndex + 1; i <= endIndex; i++) {
            columns[i].tasks.push(null);
        }
    })

    return {
        displayTasks,
        columns,
    };
}