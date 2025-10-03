import { Edit2, Trash2 } from "lucide-react";
import { eventsActions } from "@/utils/store/useEvents";

export function EventControls({ event, onSelect, visible }) {

    const handleDelete = async (e) => {
        e.stopPropagation();
        eventsActions.deleteEvent(event);
    };

    if (!visible) return null;

    return (
        <div className="absolute top-1 left-2 flex gap-2 z-10" onMouseDown={e => e.stopPropagation()}>
            <button
                className="p-1 rounded focus:outline-none rounded-full hover:scale-110 transition-transform bg-transparent hover:bg-white/50"
                onClick={handleDelete}
                aria-label="Delete event"
            >
                <Trash2 width={14} height={14} className="text-white/80" />
            </button>
            <button
                className="p-1 rounded focus:outline-none rounded-full hover:scale-110 transition-transform bg-transparent hover:bg-white/50"
                onClick={onSelect}
                aria-label="Edit event"
            >
                <Edit2 width={14} height={14} className="text-white/80" />
            </button>
        </div>
    );
}