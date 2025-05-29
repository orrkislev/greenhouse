import { DatePicker } from "@/components/ui/DatePicker";
import { db } from "@/utils/firebase/firebase";
import { HOURS } from "@/utils/store/scheduleDataStore";
import { useUser } from "@/utils/store/user";
import { formatDate, parseDate } from "@/utils/utils";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useMemo } from "react";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date(),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
});

export default function EventEdit({ event }) {
  const user = useUser(state => state.user);
  const defaultValues = useMemo(() => ({
    title: event.title || "",
    date: parseDate(event.date),
    start: event.start || "",
    end: event.end || "",
  }), [event]);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    const eventsCol = collection(db, "users", user.id, "events");
    const eventDoc = doc(eventsCol, event.id);
    await updateDoc(eventDoc, {
      title: data.title,
      date: formatDate(data.date),
      start: data.start,
      end: data.end,
    });
  };

  const onDelete = async () => {
    const eventsCol = collection(db, "users", user.id, "events");
    const eventDoc = doc(eventsCol, event.id);
    await deleteDoc(eventDoc);
    // Optionally, you can add a callback or notification here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <DatePicker
          initial={watch("date")}
          onChange={date => setValue("date", date)}
        />
        {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1" htmlFor="start">Start Time</label>
          <select
            id="start"
            className="border rounded px-2 py-1 w-full"
            {...register("start")}
          >
            <option value="">בחר שעה</option>
            {HOURS.map(hour => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>
          {errors.start && <p className="text-sm text-red-600 mt-1">{errors.start.message}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1" htmlFor="end">End Time</label>
          <select
            id="end"
            className="border rounded px-2 py-1 w-full"
            {...register("end")}
          >
            <option value="">בחר שעה</option>
            {HOURS.map(hour => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>
          {errors.end && <p className="text-sm text-red-600 mt-1">{errors.end.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
      <Button type="button" variant="destructive" className="w-full mt-2" onClick={onDelete}>
        Delete Event
      </Button>
    </form>
  );
}