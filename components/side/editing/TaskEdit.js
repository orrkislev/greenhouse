import { DateRange } from "@/components/ui/DateRange";
import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/store/user";
import { formatDate, parseDate } from "@/utils/utils";
import { collection, doc, updateDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Edit Selected Task</CardTitle>
        <CardDescription>Update your task details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
            <Input id="title" {...register("title")}/>
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
            <Textarea id="description" {...register("description")}/>
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
        </form>
      </CardContent>
    </Card>
  );
}

