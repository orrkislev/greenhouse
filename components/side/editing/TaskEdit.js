import { DateRange } from "@/components/ui/DateRange";
import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/store/user";
import { formatDate, parseDate } from "@/utils/utils";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
});

export default function TaskEdit({ task }) {
  const user = useUser((state) => state.user);
  const defaultValues = useMemo(() => ({
    title: task.title || "",
    description: task.description || "",
    start: parseDate(task.start),
    end: parseDate(task.end),
  }), [task]);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    const tasksCol = collection(db, "users", user.id, "tasks");
    const taskDoc = doc(tasksCol, task.id);
    await updateDoc(taskDoc, {
      title: data.title,
      description: data.description,
      start: formatDate(data.start),
      end: formatDate(data.end),
    });
  };

  const onDelete = async () => {
    const tasksCol = collection(db, "users", user.id, "tasks");
    const taskDoc = doc(tasksCol, task.id);
    await deleteDoc(taskDoc);
    // Optionally, add a callback or notification here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
        <Textarea id="description" {...register("description")} />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date Range</label>
        <DateRange
          start={watch("start")}
          end={watch("end")}
          onChange={({ start, end }) => {
            setValue("start", start);
            setValue("end", end);
          }}
        />
        {(errors.start || errors.end) && <p className="text-sm text-red-600 mt-1">Date range is required</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
      <Button type="button" variant="destructive" className="w-full mt-2" onClick={onDelete}>
        Delete Task
      </Button>
    </form>
  );
}

