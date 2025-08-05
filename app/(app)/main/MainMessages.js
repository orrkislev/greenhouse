import { ganttActions, useGantt } from "@/utils/store/useGantt"
import { useGroups } from "@/utils/store/useGroups";
import { useEffect } from "react";
import Box2 from "@/components/Box2";

export default function MainMessages() {
    const message = useGantt((state) => state.message);
    const groups = useGroups((state) => state.groups);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    return (
        <Box2 label="הודעות">
            <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-500 w-full">
                    {message || 'אין הודעה'}
                </div>

                {groups.map(group => (
                    <div key={group.id} className="flex gap-4">
                        <div className="text-sm text-gray-500 font-bold w-16">
                            {group.name}
                        </div>
                        <div className="text-sm text-gray-500 w-full">
                            {group.message || 'אין הודעה'}
                        </div>
                    </div>
                ))}
            </div>
        </Box2>
    )
}