'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Flame, Trophy, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Habit {
  id: number;
  title: string;
  description?: string;
  color: string;
  icon: string;
  current_streak: number;
  longest_streak: number;
  frequency: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 1,
      title: 'Morning Exercise',
      description: '30 min workout',
      color: '#10b981',
      icon: '🏃',
      current_streak: 7,
      longest_streak: 14,
      frequency: 'daily'
    },
    {
      id: 2,
      title: 'Read Book',
      description: 'Read for 20 minutes',
      color: '#3b82f6',
      icon: '📚',
      current_streak: 3,
      longest_streak: 21,
      frequency: 'daily'
    },
    {
      id: 3,
      title: 'Meditate',
      description: '10 min mindfulness',
      color: '#8b5cf6',
      icon: '🧘',
      current_streak: 12,
      longest_streak: 30,
      frequency: 'daily'
    }
  ]);

  const [completedToday, setCompletedToday] = useState<number[]>([]);

  const toggleHabit = (habitId: number) => {
    if (completedToday.includes(habitId)) {
      setCompletedToday(completedToday.filter(id => id !== habitId));
    } else {
      setCompletedToday([...completedToday, habitId]);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flame className="w-8 h-8 text-orange-500" />
          Habits
        </h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{habits.reduce((sum, h) => sum + h.current_streak, 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Streak Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{Math.max(...habits.map(h => h.current_streak), 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Longest Current Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{completedToday.length}/{habits.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {habits.map(habit => (
          <Card key={habit.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    completedToday.includes(habit.id)
                      ? 'bg-green-500 scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 hover:scale-105'
                  }`}
                >
                  {completedToday.includes(habit.id) ? '✓' : habit.icon}
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className={`w-5 h-5 ${getStreakColor(habit.current_streak)}`} />
                    <span className={`font-bold text-lg ${getStreakColor(habit.current_streak)}`}>
                      {habit.current_streak}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Best: {habit.longest_streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}