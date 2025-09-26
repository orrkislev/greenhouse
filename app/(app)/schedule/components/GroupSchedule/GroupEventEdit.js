import { format } from "date-fns";
import { useState } from "react";
import { groupsActions } from "@/utils/store/useGroups";
import WithLabel from "@/components/WithLabel";
import Button from "@/components/Button";
import { CalendarCheck, Trash2 } from "lucide-react";
import TimeRange from "@/components/TimeRange";
import SmartTextArea from "@/components/SmartTextArea";

export function GroupEventEdit({ onClose, groupId, date, event }) {
    const [timeRange, setTimeRange] = useState(event?.timeRange || { start: '09:30', end: '11:00' });
    const [title, setTitle] = useState(event?.title || '');

    const clickSave = async () => {
        const newObj = {
            title: title,
            date: format(date, 'yyyy-MM-dd'),
            start: timeRange.start,
            end: timeRange.end,
        };

        if (event) {
            await groupsActions.updateGroupEvent(groupId, { ...newObj, id: event.id });
        } else {
            await groupsActions.createGroupEvent(groupId, newObj);
        }
        onClose()
    };

    const clickDelete = async () => {
        await groupsActions.removeGroupEvent(groupId, date, event.id);
        onClose();
    };

    return (
        <div className="flex flex-col gap-1">
            <WithLabel label="כותרת">
                <SmartTextArea value={title} onChange={(e) => setTitle(e.target.value)} />
            </WithLabel>
            <WithLabel label="זמן">
                <TimeRange
                    defaultValue={timeRange}
                    onUpdate={setTimeRange}
                />
            </WithLabel>
            <div className="flex justify-between mt-4">
                <Button type="submit" data-role="save" onClick={clickSave} >
                    שמירה <CalendarCheck
                        className="w-4 h-4" />
                </Button>
                {event && (
                    <Button data-role="delete" onClick={clickDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}