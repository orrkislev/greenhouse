import { FormInput, useForm } from "@/components/ui/form/FormInput";
import { Button } from "@/components/ui/button";
import TimeRangePicker from "@/components/ui/timerange-picker";
import { format } from "date-fns";
import { groupsActions } from "@/utils/useGroups";

export function GroupEntryEdit({ onClose, groupId, date, obj }) {
    const form = useForm({
        title: obj?.title || '',
        timeRange: obj?.timeRange || { start: '09:30', end: '11:00' }
    }, async (values) => {
        const newObj = {
            title: values.title,
            date: format(date, 'yyyy-MM-dd'),
            start: values.timeRange.start,
            end: values.timeRange.end,
        };

        if (obj) {
            await groupsActions.updateGroupEntry(groupId, { ...newObj, id: obj.id });
        } else {
            await groupsActions.createGroupEntry(groupId, newObj);
        }
        form.clear();
        onClose()
    });

    const clickDelete = async () => {
        await groupsActions.removeGroupEntry(groupId, obj.id);
        onClose();
    };

    return (
        <form {...form.formProps} className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
                <FormInput {...form.props.title} />
            </div>
            <TimeRangePicker
                value={form.values.timeRange}
                onChange={(value) => form.setValue('timeRange', value)}
            />
            <div className="flex w-full gap-2">
                <Button type="submit" className="mt-2 flex-1">
                    שמירה
                </Button>
                {obj && (
                    <Button type="button" variant="destructive" className="mt-2 flex-1" onClick={clickDelete}>
                        מחיקה
                    </Button>
                )}
            </div>
            <Button type="button" variant="secondary" className="mt-2" onClick={onClose}>
                ביטול
            </Button>
        </form>
    );
}