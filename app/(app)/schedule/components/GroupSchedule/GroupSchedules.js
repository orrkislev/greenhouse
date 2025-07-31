import { useEffect } from "react";
import GroupSchedule from "./GroupSchedule";
import { groupsActions, useGroups } from "@/utils/useGroups";

export default function GroupSchedules() {
    const groups = useGroups(state => state.groups);

    useEffect(()=>{
        groupsActions.loadGroups();
    },[])

    const groupIds = groups.map(g => g.id).join(',');

    useEffect(()=>{
        groupsActions.updateWeek();
    }, [groupIds]);

    return groups.map(group => <GroupSchedule key={group.id} group={group} />)
}