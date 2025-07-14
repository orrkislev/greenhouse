import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import { useUserSchedule } from "@/app/schedule/utils/useUserSchedule";

export default function EditEventDrawer({ onClose, event }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(null);
    const [duration, setDuration] = useState(1);

    const updateEvent = useUserSchedule(state => state.updateEvent);
    const deleteEvent = useUserSchedule(state => state.deleteEvent);

    useEffect(() => {
        if (event) {
            setTitle(event.title || "");
            setDate(event.date || null);
            setDuration(event.duration || 1);
        } else {
            setTitle("");
            setDate(null);
            setDuration(1);
        }
    }, [event]);

    const handleSave = async (e) => {
        e.preventDefault();

        const eventData = { title, date, duration };
        if (event?.id) {
            // Update existing event
            updateEvent(event.id, eventData);
        } else {
            addEvent(eventData);
        }

        onClose();
    };

    const handleDelete = () => {
        deleteEvent(event.id);
        onClose();
    };

    return (
        <Drawer open={event != null} onOpenChange={onClose} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{event ? "Edit Event" : "New Event"}</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleSave}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Event Title</label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter event title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Event Date</label>
                        <DatePicker
                            initial={date}
                            onChange={setDate}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            min={1}
                            max={24}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Duration in hours. Default is 1 hour.</p>
                    </div>


                    <div className="flex gap-2 justify-end mt-4">
                        {event?.id && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        )}
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button type="submit">
                            {event ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}