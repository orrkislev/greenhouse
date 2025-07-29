import { useEffect } from "react";
import GroupSchedule from "./GroupSchedule";
import { groupsActions, useGroups } from "@/utils/useGroups";

export default function GroupSchedules() {
    const groups = useGroups(state => state.groups);

    useEffect(()=>{
        groupsActions.updateWeek();
    }, []);

    return groups.map(group => <GroupSchedule key={group.id} group={group} />)
}