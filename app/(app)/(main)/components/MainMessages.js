import { ganttActions, useGantt } from "@/utils/store/useGantt"
import { useEffect } from "react";
import 'react-quill-new/dist/quill.snow.css';


export default function MainMessages() {
    const schoolMessage = useGantt((state) => state.schoolMessage);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    return (
        <div className="text-sm text-stone-700 w-full p-4" dangerouslySetInnerHTML={{ __html: schoolMessage }} />
    )
}