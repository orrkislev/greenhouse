'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getWeekStartDate } from '../../utils/utils';

export function ScheduleForm({ onSubmit, onCancel, initialData, loading }) {
  const { register, handleSubmit, formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      weekStartDate: initialData?.weekStartDate || getWeekStartDate(new Date()),
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Schedule' : 'Create New Schedule'}
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
              placeholder="Enter schedule title"
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
              placeholder="Enter schedule description"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="weekStartDate" className="text-sm font-medium">
              Week Start Date
            </label>
            <Input
              id="weekStartDate"
              type="date"
              {...register('weekStartDate', { valueAsDate: true })}
            />
            {errors.weekStartDate && (
              <p className="text-sm text-red-600">{errors.weekStartDate.message}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
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
