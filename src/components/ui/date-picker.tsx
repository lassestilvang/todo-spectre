'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Select a date', className }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subDays(startOfWeek(currentMonth, { weekStartsOn: 1 }), 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addDays(endOfWeek(currentMonth, { weekStartsOn: 1 }), 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    onChange?.(today);
    setIsOpen(false);
  };

  const renderDays = () => {
    const start = startOfWeek(currentMonth, { weekStartsOn: 1 });
    const end = endOfWeek(addDays(start, 6 * 7 - 1), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
      const isCurrentDay = isToday(day);
      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

      return (
        <Button
          key={day.toISOString()}
          variant="ghost"
          size="sm"
          className={`w-8 h-8 p-0 ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${isSelected ? 'bg-primary text-primary-foreground' : ''} ${isCurrentDay ? 'border border-primary' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day.getDate()}
        </Button>
      );
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2 text-muted-foreground">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>

          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}