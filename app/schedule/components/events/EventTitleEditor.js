import { useRef, useEffect, useState } from "react";
import { useUserSchedule } from "@/app/schedule/utils/useUserSchedule";

function SmartTextArea(props) {
    const ref = useRef();

    useEffect(() => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [props.value]);

    return (
        <textarea
            ref={ref}
            rows={1}
            className="bg-transparent text-gray-800 rounded px-1 w-full outline-none pointer-events-auto focus:bg-white/50 resize-none"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '0', ...props.style }}
            {...props}
        />
    );
}

export function EventTitleEditor({ event }) {
    const [editTitle, setEditTitle] = useState(event.title);
    const updateEvent = useUserSchedule(state => state.updateEvent);

    const handleTitleChange = (e) => {
        setEditTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (editTitle !== event.title) {
            updateEvent(event.id, { title: editTitle });
        }
    };

    return (
        <SmartTextArea
            className="bg-transparent text-gray-800 rounded px-1 w-full outline-none pointer-events-auto focus:bg-white/50 resize-none"
            value={editTitle}
            onMouseDown={e => e.stopPropagation()}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onClick={e => e.stopPropagation()}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
    );
}
