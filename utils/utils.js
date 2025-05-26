import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getWeekDates(weekStartDate) {
  const dates = [];
  const startDate = new Date(weekStartDate);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function getNextWeek(date) {
  const nextWeek = new Date(date);
  nextWeek.setDate(date.getDate() + 7);
  return nextWeek;
}

export function getPreviousWeek(date) {
  const previousWeek = new Date(date);
  previousWeek.setDate(date.getDate() - 7);
  return previousWeek;
}

export function isSameWeek(date1, date2) {
  const week1Start = getWeekStartDate(date1);
  const week2Start = getWeekStartDate(date2);
  return week1Start.getTime() === week2Start.getTime();
}

export function getDayOfWeekName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || '';
}

export function getDayOfWeekShort(dayIndex) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex] || '';
}

export function createEmptyWeeklySchedule(
  userId,
  title,
  weekStartDate,
  description
) {
  const weekDates = getWeekDates(weekStartDate);
  
  const days = weekDates.map((date, index) => ({
    id: `day_${Date.now()}_${index}`,
    dayOfWeek: index,
    date,
    tasks: [],
    notes: '',
  }));

  return {
    userId,
    title,
    description,
    weekStartDate,
    days,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function calculateTaskStats(schedule) {
  let totalTasks = 0;
  let completedTasks = 0;
  let totalEstimatedTime = 0;
  let completedTime = 0;

  schedule.days.forEach(day => {
    day.tasks.forEach(task => {
      totalTasks++;
      if (task.completed) {
        completedTasks++;
      }
      if (task.estimatedTime) {
        totalEstimatedTime += task.estimatedTime;
        if (task.completed) {
          completedTime += task.estimatedTime;
        }
      }
    });
  });

  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    totalEstimatedTime,
    completedTime,
    remainingTasks: totalTasks - completedTasks,
  };
}

export function formatEstimatedTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getPriorityIcon(priority) {
  switch (priority) {
    case 'low':
      return '🟢';
    case 'medium':
      return '🟡';
    case 'high':
      return '🔴';
    default:
      return '⚪';
  }
}

export function debounce(
  func,
  delay
) {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
