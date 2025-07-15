import { useUser } from "@/utils/useUser";
import { useGroupSchedule } from "./useGroupSchedule";
import { useWeek } from "../../utils/useWeek";
import { useEffect } from "react";
import GroupSchedule from "./GroupSchedule";

export default function GroupSchedules() {
    const userGroups = useUser(state => state.user.groups);
    const groupsSchedule = useGroupSchedule();
    const week = useWeek(state => state.week);

    useEffect(() => {
        if (!week || week.length === 0) return;
        groupsSchedule.getUserGroups().then(()=>{
            groupsSchedule.getWeeksEntries(week);
        })
    }, [userGroups, week])

    return groupsSchedule.groups.map(group => (
        <GroupSchedule key={group.name} group={group} />
    ));
}