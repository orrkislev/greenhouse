'use client';

import React, { useState } from 'react';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Calendar, StickyNote } from 'lucide-react';
import { 
  getDayOfWeekName, 
  formatDateShort, 
  calculateTaskStats 
} from '../../utils/utils';

export function DayScheduleView({
  daySchedule,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskComplete,
  onUpdateNotes,
}) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(daySchedule.notes || '');

  const dayStats = calculateTaskStats({ 
    days: [daySchedule], 
    id: '', 
    userId: '', 
    title: '', 
    weekStartDate: new Date(), 
    createdAt: new Date(), 
    updatedAt: new Date() 
  });

  const handleAddTask = async (taskData) => {
    await onAddTask(taskData);
    setShowTaskForm(false);
  };

  const handleEditTask = async (taskData) => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleSaveNotes = async () => {
    if (onUpdateNotes) {
      await onUpdateNotes(notes);
    }
    setShowNotes(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {getDayOfWeekName(daySchedule.dayOfWeek)}
            </CardTitle>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDateShort(daySchedule.date)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {dayStats.completedTasks}/{dayStats.totalTasks} tasks
            </p>
            {dayStats.totalTasks > 0 && (
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${dayStats.completionRate}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Add Task Button */}
          <Button
            onClick={() => setShowTaskForm(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>

          {/* Notes Button */}
          <Button
            onClick={() => setShowNotes(true)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <StickyNote className="h-4 w-4 mr-2" />
            {daySchedule.notes ? 'Edit Notes' : 'Add Notes'}
          </Button>

          {/* Tasks List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {daySchedule.tasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No tasks for this day
              </p>
            ) : (
              daySchedule.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleTaskComplete}
                  onEdit={setEditingTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Task Form Modal */}
        {(showTaskForm || editingTask) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <TaskForm
                onSubmit={editingTask ? handleEditTask : handleAddTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                initialData={editingTask || undefined}
              />
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {showNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Day Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this day..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2 mt-4">
                  <Button onClick={handleSaveNotes} className="flex-1">
                    Save Notes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNotes(false);
                      setNotes(daySchedule.notes || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
