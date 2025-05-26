'use client';

import React from 'react';
import { DayScheduleView } from './DayScheduleView';
import { ScheduleService } from '@/utils/schedule';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTaskStats, formatEstimatedTime } from '@/utils/utils';
import { BarChart3, Clock, CheckCircle2, Circle } from 'lucide-react';
import { useSchedule } from '@/utils/store/scheduleStore';

export function WeeklyScheduleView({ schedule }) {
  const { updateSchedule, addTask, updateTask, deleteTask, toggleTaskCompletion } = useSchedule();

  const stats = calculateTaskStats(schedule);

  const handleAddTask = async (dayIndex, taskData) => {
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      category: taskData.category,
      estimatedTime: taskData.estimatedTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const createdTask = await ScheduleService.addTaskToDay(schedule.id, dayIndex, newTask);
      addTask(schedule.id, dayIndex, createdTask);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (dayIndex, taskId, updates) => {
    try {
      await ScheduleService.updateTask(schedule.id, dayIndex, taskId, updates);
      updateTask(schedule.id, dayIndex, taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (dayIndex, taskId) => {
    try {
      await ScheduleService.deleteTask(schedule.id, dayIndex, taskId);
      deleteTask(schedule.id, dayIndex, taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const handleToggleTaskComplete = (dayIndex, taskId) => {
    toggleTaskCompletion(schedule.id, dayIndex, taskId);

    // Update in database
    const task = schedule.days[dayIndex]?.tasks.find(t => t.id === taskId);
    if (task) {
      handleUpdateTask(dayIndex, taskId, { completed: !task.completed });
    }
  };

  const handleUpdateNotes = async (dayIndex, notes) => {
    const updatedDays = [...schedule.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], notes };

    try {
      await ScheduleService.updateSchedule(schedule.id, { days: updatedDays });
      updateSchedule(schedule.id, { days: updatedDays });
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{schedule.title}</CardTitle>
              {schedule.description && (
                <CardDescription className="mt-2 text-base">
                  {schedule.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Week Stats */}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-xl font-semibold">{stats.totalTasks}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">{stats.completedTasks}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Circle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-semibold">{stats.remainingTasks}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Est. Time</p>
                <p className="text-xl font-semibold">
                  {stats.totalEstimatedTime ? formatEstimatedTime(stats.totalEstimatedTime) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {stats.totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(stats.completionRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schedule.days.map((daySchedule, index) => (
          <DayScheduleView
            key={daySchedule.id}
            daySchedule={daySchedule}
            onAddTask={taskData => handleAddTask(index, taskData)}
            onUpdateTask={(taskId, updates) => handleUpdateTask(index, taskId, updates)}
            onDeleteTask={taskId => handleDeleteTask(index, taskId)}
            onToggleTaskComplete={taskId => handleToggleTaskComplete(index, taskId)}
            onUpdateNotes={notes => handleUpdateNotes(index, notes)}
          />
        ))}
      </div>
    </div>
  );
}
