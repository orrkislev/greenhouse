import { ganttActions, useGantt } from "@/utils/store/useGantt"
import { useEffect } from "react";
import Box2 from "@/components/Box2";
import 'react-quill-new/dist/quill.snow.css';


export default function MainMessages() {
    const message = useGantt((state) => state.message);

    useEffect(() => {
        ganttActions.loadSchoolMessage();
    }, []);

    return (
        <div className="text-sm text-stone-700 w-full p-4" dangerouslySetInnerHTML={{ __html: message }} />
    )
}