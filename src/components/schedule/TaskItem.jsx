'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Circle, Edit2, Trash2, Clock,Tag,MoreVertical } from 'lucide-react';
import { formatEstimatedTime, getPriorityColor, getPriorityIcon } from '@/lib/utils';

/**
 * @param {{
 *   task: any,
 *   onToggleComplete: (taskId: string) => void,
 *   onEdit: (task: any) => void,
 *   onDelete: (taskId: string) => void
 * }} props
 */
export function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card className={`mb-2 transition-all ${task.completed ? 'opacity-70' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            {task.completed ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {task.title}
                </h4>
                
                {task.description && (
                  <p className={`text-xs mt-1 ${
                    task.completed ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center mt-2 space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getPriorityColor(task.priority)
                  }`}>
                    {getPriorityIcon(task.priority)} {task.priority}
                  </span>

                  {task.category && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {task.category}
                    </span>
                  )}

                  {task.estimatedTime && (
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatEstimatedTime(task.estimatedTime)}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showActions && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
