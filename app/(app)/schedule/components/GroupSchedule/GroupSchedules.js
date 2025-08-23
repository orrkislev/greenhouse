import { useEffect } from "react";
import GroupSchedule from "./GroupSchedule";
import { groupsActions, useInvolvedGroups } from "@/utils/store/useGroups";

export default function GroupSchedules() {
    const groups = useInvolvedGroups();

    const groupIds = groups.map(g => g.id).join(',');

    useEffect(()=>{
        groupsActions.loadWeekEvents();
    }, [groupIds]);

    return groups.map(group => <GroupSchedule key={group.id} group={group} />)
}