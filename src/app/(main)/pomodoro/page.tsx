'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const durations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimeout(() => {
        setIsRunning(false);
        if (mode === 'work') {
          setCompletedPomodoros((prev) => prev + 1);
          if ((completedPomodoros + 1) % 4 === 0) {
            setMode('longBreak');
            setTimeLeft(durations.longBreak);
          } else {
            setMode('shortBreak');
            setTimeLeft(durations.shortBreak);
          }
        } else {
          setMode('work');
          setTimeLeft(durations.work);
        }
      }, 0);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedPomodoros, durations.longBreak, durations.shortBreak, durations.work]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'text-red-500';
      case 'shortBreak': return 'text-green-500';
      case 'longBreak': return 'text-blue-500';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'work': return <Brain className="w-6 h-6" />;
      case 'shortBreak': return <Coffee className="w-6 h-6" />;
      case 'longBreak': return <Coffee className="w-6 h-6" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">Pomodoro Timer</h1>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              onClick={() => switchMode('work')}
            >
              <Brain className="w-4 h-4 mr-2" /> Work
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'default' : 'outline'}
              onClick={() => switchMode('shortBreak')}
            >
              <Coffee className="w-4 h-4 mr-2" /> Short Break
            </Button>
            <Button
              variant={mode === 'longBreak' ? 'default' : 'outline'}
              onClick={() => switchMode('longBreak')}
            >
              <Coffee className="w-4 h-4 mr-2" /> Long Break
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className={`flex items-center justify-center gap-2 mb-4 ${getModeColor()}`}>
              {getModeIcon()}
              <h2 className="text-xl font-semibold capitalize">{mode.replace(/([A-Z])/g, ' $1').trim()}</h2>
            </div>
            <div className={`text-8xl font-bold font-mono ${getModeColor()}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={toggleTimer} className="px-8">
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" /> Start
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="w-5 h-5 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span>Completed Pomodoros</span>
            <span className="text-2xl font-bold">{completedPomodoros}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}