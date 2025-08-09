import { ganttActions, useGantt } from "@/utils/store/useGantt"
import { useGroups } from "@/utils/store/useGroups";
import { useEffect } from "react";
import Box2 from "@/components/Box2";

export default function MainMessages() {
    const message = useGantt((state) => state.message);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    return (
        <Box2>
            <div className="text-sm text-stone-500 w-full">
                {message || 'אין הודעה'}
            </div>
        </Box2>
    )
}