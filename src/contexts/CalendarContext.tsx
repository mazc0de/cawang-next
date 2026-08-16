'use client';
import React, { createContext, useContext, useState } from 'react';

interface CalendarContextType {
  referenceDate: Date;
  setReferenceDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <CalendarContext.Provider
      value={{
        referenceDate,
        setReferenceDate,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  return useContext(CalendarContext);
}
