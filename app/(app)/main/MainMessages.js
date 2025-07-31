import { ganttActions, useGantt } from "@/utils/useGantt"
import { useGroups } from "@/utils/useGroups";
import { useEffect } from "react";

export default function MainMessages() {
    const message = useGantt((state) => state.message);
    const groups = useGroups((state) => state.groups);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500">
                הודעות
            </div>
            <div className="flex gap-2">
                    <div className="text-sm text-gray-500 font-bold">
                        כלל בית הספר
                    </div>
                    <div className="text-sm text-gray-500">
                        {message || 'אין הודעה'}
                    </div>
                </div>

            {groups.map(group => (
                <div key={group.id} className="flex gap-2">
                    <div className="text-sm text-gray-500 font-bold">
                        {group.name}
                    </div>
                    <div className="text-sm text-gray-500">
                        {group.message || 'אין הודעה'}
                    </div>
                </div>
            ))}
        </div>
    )
}