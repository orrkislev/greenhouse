'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taskSchema, TaskFormData } from '@/lib/validations';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
  loading?: boolean;
}

export function TaskForm({ onSubmit, onCancel, initialData, loading }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      category: initialData?.category || '',
      estimatedTime: initialData?.estimatedTime || undefined,
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting task form:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Task' : 'Add New Task'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category (optional)
            </label>
            <Input
              id="category"
              placeholder="Enter task category"
              {...register('category')}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="estimatedTime" className="text-sm font-medium">
              Estimated Time (minutes)
            </label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              max="1440"
              placeholder="Enter estimated time in minutes"
              {...register('estimatedTime', { valueAsNumber: true })}
            />
            {errors.estimatedTime && (
              <p className="text-sm text-red-600">{errors.estimatedTime.message}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Update' : 'Add Task')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
