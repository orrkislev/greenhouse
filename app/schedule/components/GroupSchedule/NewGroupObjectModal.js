import { createGroupObject, removeGroupObject, updateGroupObject } from "./groupschedule actions";
import { SegmentedControl, SegmentedControlList, SegmentedControlTrigger } from "@/components/ui/segmented-control";
import { useState } from "react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import { tw } from "@/utils/tw";
import { FormInput, useForm } from "@/components/ui/form/FormInput";
import { Button } from "@/components/ui/button";
import TimeRangePicker from "@/components/ui/timerange-picker";

const AddObjectDiv = tw`flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        transition-all bg-[#FADFC199] hover:bg-[#FADFC1]
        text-transparent hover:text-gray-800
        ${props => props.$active ? 'bg-[#FADFC1] text-gray-800' : ''}
        z-5 flex-1
`;


export function NewGroupObjectButton({ groupName, dateString, updateObject }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <AddObjectDiv onClick={() => setIsOpen(true)} $active={isOpen}>
                    +
                </AddObjectDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 border border-gray-300 z-[999]">
                <NewGroupObjectModal
                    onClose={() => setIsOpen(false)}
                    groupName={groupName}
                    dateString={dateString}
                />
            </PopoverContent>
        </Popover>
    );
}

export function NewGroupObjectModal({ onClose, groupName, dateString, obj }) {
    const form = useForm({
        text: obj?.text || '',
        type: obj?.type || 'event',
        timeRange: obj?.timeRange || { start: '09:30', end: '11:00' }
    }, async (values) => {
        const newObj = {
            text: values.text,
            type: values.type,
        };
        if (values.type === 'event') {
            newObj.timeRange = values.timeRange;
        }
        if (obj) {
            await updateGroupObject(groupName, dateString, { ...newObj, id: obj.id });
        } else {
            await createGroupObject(groupName, dateString, newObj);
        }
        form.clear();
        onClose()
    });

    const clickDelete = async () => {
        if (obj) {
            await removeGroupObject(groupName, dateString, obj.id);
            onClose();
        }
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
            <FormInput {...form.props.text} />
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