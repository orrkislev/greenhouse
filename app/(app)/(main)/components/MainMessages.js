import { Card } from "@/components/Box2";
import { ganttActions, useGantt } from "@/utils/store/useGantt"
import { useUserGroups } from "@/utils/store/useGroups";
import { useEffect } from "react";
import 'react-quill-new/dist/quill.snow.css';


export default function MainMessages() {
    const schoolMessage = useGantt((state) => state.schoolMessage);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    return (
        // <Card>
            <div className={`text-sm text-stone-700 w-full p-4 text-center`} dangerouslySetInnerHTML={{ __html: schoolMessage }} />
        // </Card>
    )
}