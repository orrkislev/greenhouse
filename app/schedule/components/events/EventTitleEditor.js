import { useRef, useEffect, useState } from "react";
import { eventsActions } from "@/utils/useEvents";

function SmartTextArea(props) {
    const ref = useRef();

    useEffect(() => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [props.value]);

    const textSize = props.value.length > 20 ? "text-xs" : "text-sm"

    return (
        <textarea
            ref={ref}
            rows={1}
            className={`bg-transparent text-gray-800 rounded px-1 w-full outline-none pointer-events-auto focus:bg-white/50 resize-none ${textSize}`}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '0', ...props.style }}
            {...props}
        />
    );
}

export function EventTitleEditor({ event }) {
    const [editTitle, setEditTitle] = useState(event.title);

    const handleTitleChange = (e) => {
        setEditTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (editTitle !== event.title) {
            eventsActions.updateEvent(event.id, { title: editTitle });
        }
    };

    return (
        <SmartTextArea
            value={editTitle}
            onMouseDown={e => e.stopPropagation()}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onClick={e => e.stopPropagation()}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
    );
}
