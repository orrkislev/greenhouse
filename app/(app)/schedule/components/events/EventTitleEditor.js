import { useEffect, useState } from "react";
import { eventsActions } from "@/utils/store/useEvents";
import SmartTextArea from "@/components/SmartTextArea";

export function EventTitleEditor({ event }) {
    const [editTitle, setEditTitle] = useState(event.title);

    useEffect(() => {
        setEditTitle(event.title);
    }, [event.title]);

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
