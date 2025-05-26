import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class ScheduleService {
  static COLLECTION_NAME = 'schedules';

  static async createSchedule(schedule) {
    try {
      const scheduleData = {
        ...schedule,
        createdAt: Timestamp.fromDate(schedule.createdAt),
        updatedAt: Timestamp.fromDate(schedule.updatedAt),
        weekStartDate: Timestamp.fromDate(schedule.weekStartDate),
        days: schedule.days.map(day => ({
          ...day,
          date: Timestamp.fromDate(day.date),
          tasks: day.tasks.map(task => ({
            ...task,
            createdAt: Timestamp.fromDate(task.createdAt),
            updatedAt: Timestamp.fromDate(task.updatedAt),
          })),
        })),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), scheduleData);
      return {
        ...schedule,
        id: docRef.id,
      };
    } catch (error) {
      throw new Error(`Failed to create schedule: ${error}`);
    }
  }

  static async updateSchedule(scheduleId, updates) {
    try {
      const scheduleRef = doc(db, this.COLLECTION_NAME, scheduleId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };
      if (updates.weekStartDate) {
        updateData.weekStartDate = Timestamp.fromDate(updates.weekStartDate);
      }
      if (updates.days) {
        updateData.days = updates.days.map(day => ({
          ...day,
          date: Timestamp.fromDate(day.date),
          tasks: day.tasks.map(task => ({
            ...task,
            createdAt: Timestamp.fromDate(task.createdAt),
            updatedAt: Timestamp.fromDate(task.updatedAt),
          })),
        }));
      }
      await updateDoc(scheduleRef, updateData);
    } catch (error) {
      throw new Error(`Failed to update schedule: ${error}`);
    }
  }

  static async deleteSchedule(scheduleId) {
    try {
      const scheduleRef = doc(db, this.COLLECTION_NAME, scheduleId);
      await deleteDoc(scheduleRef);
    } catch (error) {
      throw new Error(`Failed to delete schedule: ${error}`);
    }
  }

  static async getUserSchedules(userId) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertDocToSchedule(doc.id, doc.data()));
    } catch (error) {
      throw new Error(`Failed to fetch schedules: ${error}`);
    }
  }

  static async getSchedule(scheduleId) {
    try {
      const scheduleRef = doc(db, this.COLLECTION_NAME, scheduleId);
      const docSnapshot = await getDoc(scheduleRef);
      if (!docSnapshot.exists()) {
        return null;
      }
      return this.convertDocToSchedule(docSnapshot.id, docSnapshot.data());
    } catch (error) {
      throw new Error(`Failed to fetch schedule: ${error}`);
    }
  }

  static async addTaskToDay(scheduleId, dayIndex, task) {
    try {
      const schedule = await this.getSchedule(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      const newTask = {
        ...task,
        id: this.generateTaskId(),
      };
      const updatedDays = [...schedule.days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        tasks: [...updatedDays[dayIndex].tasks, newTask],
      };
      await this.updateSchedule(scheduleId, { days: updatedDays });
      return newTask;
    } catch (error) {
      throw new Error(`Failed to add task: ${error}`);
    }
  }

  static async updateTask(scheduleId, dayIndex, taskId, updates) {
    try {
      const schedule = await this.getSchedule(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      const updatedDays = [...schedule.days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        tasks: updatedDays[dayIndex].tasks.map(task =>
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ),
      };
      await this.updateSchedule(scheduleId, { days: updatedDays });
    } catch (error) {
      throw new Error(`Failed to update task: ${error}`);
    }
  }

  static async deleteTask(scheduleId, dayIndex, taskId) {
    try {
      const schedule = await this.getSchedule(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      const updatedDays = [...schedule.days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        tasks: updatedDays[dayIndex].tasks.filter(task => task.id !== taskId),
      };
      await this.updateSchedule(scheduleId, { days: updatedDays });
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }

  static convertDocToSchedule(id, data) {
    return {
      id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      weekStartDate: data.weekStartDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      days: (data.days || []).map(day => ({
        id: day.id,
        dayOfWeek: day.dayOfWeek,
        date: day.date?.toDate() || new Date(),
        notes: day.notes,
        tasks: (day.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed || false,
          priority: task.priority || 'medium',
          category: task.category,
          estimatedTime: task.estimatedTime,
          createdAt: task.createdAt?.toDate() || new Date(),
          updatedAt: task.updatedAt?.toDate() || new Date(),
        })),
      })),
    };
  }

  static generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateScheduleId() {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateDayId() {
    return `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
