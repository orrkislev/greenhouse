import { useUser } from "@/utils/useUser";
import { useWeek } from "../../utils/useWeek";
import { useEffect } from "react";
import GroupSchedule from "./GroupSchedule";
import { useGroups } from "@/utils/useGroups";

export default function GroupSchedules() {
    const userGroups = useUser(state => state.user.groups);
    const groups = useGroups()
    const week = useWeek(state => state.week);

    useEffect(() => {
        if (!week || week.length === 0) return;
        groups.loadUserGroups().then(()=>{
            groups.updateWeek(week);
        })
    }, [userGroups, week])

    return groups.groups.map(group => (
        <GroupSchedule key={group.id} group={group} />
    ));
}