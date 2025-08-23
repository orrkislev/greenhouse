import { FormInput, useForm } from "@/components/ui/form/FormInput";
import TimeRangePicker from "@/components/ui/timerange-picker";
import { format } from "date-fns";
import { groupsActions } from "@/utils/store/useGroups";
import WithLabel from "@/components/WithLabel";
import Button from "@/components/Button";
import { CalendarCheck, X } from "lucide-react";
import { Trash2 } from "lucide-react";

export function GroupEventEdit({ onClose, groupId, date, event }) {
    const form = useForm({
        title: event?.title || '',
        timeRange: event?.timeRange || { start: '09:30', end: '11:00' }
    }, async (values) => {
        const newObj = {
            title: values.title,
            date: format(date, 'yyyy-MM-dd'),
            start: values.timeRange.start,
            end: values.timeRange.end,
        };

        if (event) {
            await groupsActions.updateGroupEvent(groupId, { ...newObj, id: event.id });
        } else {
            await groupsActions.createGroupEvent(groupId, newObj);
        }
        form.clear();
        onClose()
    });

    const clickDelete = async () => {
        await groupsActions.removeGroupEvent(groupId, date, event.id);
        onClose();
    };

    return (
        <form {...form.formProps} className="flex flex-col gap-1">
            <WithLabel label="כותרת">
                <FormInput {...form.props.title} />
            </WithLabel>
            <WithLabel label="זמן">
                <TimeRangePicker
                    value={form.values.timeRange}
                    onChange={(value) => form.setValue('timeRange', value)}
                />
            </WithLabel>
            <div className="flex justify-between mt-4">
                <Button type="submit" data-role="save" >
                    שמירה <CalendarCheck
                        className="w-4 h-4" />
                </Button>
                {event && (
                    <Button data-role="delete" onClick={clickDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </form>
    );
}