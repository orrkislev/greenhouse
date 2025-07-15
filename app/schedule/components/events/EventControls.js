import { Edit2, Trash2 } from "lucide-react";
import { useUserSchedule } from "@/app/schedule/utils/useUserSchedule";

export function EventControls({ event, onSelect, visible }) {
    const deleteEvent = useUserSchedule(state => state.deleteEvent);

    const handleDelete = async (e) => {
        e.stopPropagation();
        deleteEvent(event.id);
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