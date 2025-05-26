'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/utils/store/user';
import { ScheduleService } from '@/utils/schedule';
import { WeeklyScheduleView } from '@/components/schedule/WeeklyScheduleView';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, LogOut, User,ChevronLeft,ChevronRight } from 'lucide-react';
import { createEmptyWeeklySchedule, getWeekStartDate,getNextWeek,getPreviousWeek,formatDate } from '@/utils/utils';
import { useSchedule } from '@/utils/store/scheduleStore';

export function DashboardPage() {
  const { user, signOut } = useUser()
  const { schedules, currentSchedule, setSchedules, setCurrentSchedule, addSchedule,loading,setLoading,setError } = useSchedule();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(getWeekStartDate(new Date()));

  // Load user schedules on mount
  useEffect(() => {
    if (user) {
      loadUserSchedules();
    }
  }, [user]);

  // Find schedule for current week
  useEffect(() => {
    if (schedules.length > 0) {
      const weekSchedule = schedules.find(schedule => 
        schedule.weekStartDate.getTime() === currentWeek.getTime()
      );
      setCurrentSchedule(weekSchedule || null);
    }
  }, [schedules, currentWeek, setCurrentSchedule]);

  const loadUserSchedules = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userSchedules = await ScheduleService.getUserSchedules(user.id);
      setSchedules(userSchedules);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (data) => {
    if (!user) return;

    try {
      setLoading(true);
      const newSchedule = createEmptyWeeklySchedule(
        user.id,
        data.title,
        data.weekStartDate,
        data.description
      );

      const createdSchedule = await ScheduleService.createSchedule(newSchedule);
      addSchedule(createdSchedule);
      setShowCreateForm(false);
      
      // Navigate to the created schedule's week
      setCurrentWeek(getWeekStartDate(data.weekStartDate));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCurrentWeekSchedule = async () => {
    if (!user) return;

    const weekTitle = `Week of ${formatDate(currentWeek)}`;
    await handleCreateSchedule({
      title: weekTitle,
      weekStartDate: currentWeek,
      description: `Schedule for the week starting ${formatDate(currentWeek)}`,
    });
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(direction === 'next' ? getNextWeek(currentWeek) : getPreviousWeek(currentWeek));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Weekly Schedule Manager
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {user?.displayName || user?.email}
              </div>
              
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
              
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigateWeek('prev')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-2xl font-bold text-gray-900">
              Week of {formatDate(currentWeek)}
            </h2>
            
            <Button
              onClick={() => navigateWeek('next')}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {!currentSchedule && (
            <Button onClick={handleCreateCurrentWeekSchedule}>
              <Plus className="h-4 w-4 mr-2" />
              Create This Week's Schedule
            </Button>
          )}
        </div>

        {/* Schedule Content */}
        {currentSchedule ? (
          <WeeklyScheduleView schedule={currentSchedule} />
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Schedule for This Week</CardTitle>
              <CardDescription>
                Create a schedule for the week of {formatDate(currentWeek)} to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateCurrentWeekSchedule} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Schedules */}
        {schedules.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Schedules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.slice(0, 6).map((schedule) => (
                <Card 
                  key={schedule.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCurrentWeek(getWeekStartDate(schedule.weekStartDate))}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{schedule.title}</CardTitle>
                    <CardDescription>
                      {formatDate(schedule.weekStartDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-600">
                      {schedule.days.reduce((total, day) => total + day.tasks.length, 0)} tasks
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Schedule Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ScheduleForm
              onSubmit={handleCreateSchedule}
              onCancel={() => setShowCreateForm(false)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
