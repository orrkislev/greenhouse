import { SegmentedControl, SegmentedControlList, SegmentedControlTrigger } from "@/components/ui/segmented-control";
import { FormInput, useForm } from "@/components/ui/form/FormInput";
import { Button } from "@/components/ui/button";
import TimeRangePicker from "@/components/ui/timerange-picker";
import { format } from "date-fns";
import { groupsActions } from "@/utils/useGroups";


export function GroupEntryEdit({ onClose, groupName, date, obj }) {
    const form = useForm({
        title: obj?.title || '',
        type: obj?.type || 'event',
        timeRange: obj?.timeRange || { start: '09:30', end: '11:00' }
    }, async (values) => {
        const newObj = {
            title: values.title,
            type: values.type,
            date: format(date, 'yyyy-MM-dd'),
        };
        if (values.type === 'event') {
            newObj.timeRange = values.timeRange;
        }
        if (obj) {
            await groupsActions.updateGroupEntry(groupName, { ...newObj, id: obj.id });
        } else {
            await groupsActions.createGroupEntry(groupName, newObj);
        }
        form.clear();
        onClose()
    });

    const clickDelete = async () => {
        await groupsActions.removeGroupEntry(groupName, obj.id);
        onClose();
    };

    return (
        <form {...form.formProps} className="flex flex-col gap-1">
            <SegmentedControl value={form.values.type} onValueChange={newValue => form.setValue('type', newValue)} className="mb-4">
                <SegmentedControlList>
                    <SegmentedControlTrigger value="event">
                        לוז
                    </SegmentedControlTrigger>
                    <SegmentedControlTrigger value="task">
                        משימה
                    </SegmentedControlTrigger>
                </SegmentedControlList>
            </SegmentedControl>
            <FormInput {...form.props.title} />
            {form.values.type === 'event' && (
                <TimeRangePicker
                    value={form.values.timeRange}
                    onChange={(value) => form.setValue('timeRange', value)}
                />
            )}
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