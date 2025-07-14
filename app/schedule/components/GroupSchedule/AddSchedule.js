import { useEffect, useState } from "react";
import { getAllGroups, joinGroup } from "./groupschedule actions";
import { useUser } from "@/utils/useUser";
import { tw } from "@/utils/tw";


const GroupButton = tw`text-xs text-gray-800 bg-blue-200 px-2 py-1 text-center hover:bg-blue-400 cursor-pointer transition-all`;
const NewGroupButton = tw`text-xs text-gray-800 bg-emerald-200 px-2 py-1 text-center hover:bg-emerald-400 cursor-pointer transition-all`;

export function AddSchedule() {
    const user = useUser(state => state.user);
    const [showGroups, setShowGroups] = useState(false);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (!showGroups) return;
        getAllGroups().then(data => {
            setGroups(data);
            const onlyNewGroups = data.filter(group => !user.groups.includes(group.id));
            if (user.roles.includes('staff')) {
                setGroups(onlyNewGroups);
            } else {
                const onlyOpenGroups = onlyNewGroups.filter(group => group.open);
                setGroups(onlyOpenGroups);
            }
        }).catch(error => {
            console.error("Error fetching groups:", error);
            setGroups([]);
        });

    }, [showGroups]);

    const clickGroup = (group) => {
        joinGroup(user.id, group.id);
        setShowGroups(false);
    };

    return (
        <div className="p-1 border-x border-b border-gray-300 bg-white relative">
            {showGroups ? (
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        {groups.map(group => (
                            <GroupButton key={group.id} onClick={() => clickGroup(group)}>
                                {group.name}
                            </GroupButton>
                        ))}
                    </div>
                    <NewGroupButton onClick={() => setShowGroups(false)}>
                        ביטול
                    </NewGroupButton>
                </div>
            ) : (
                <NewGroupButton onClick={() => setShowGroups(true)}>
                    הוספת קבוצה
                </NewGroupButton>
            )}

        </div>
    );
}