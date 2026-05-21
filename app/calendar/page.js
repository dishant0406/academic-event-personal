"use client";

import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calendar state: defaults to current month
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        if (!res.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await res.json();
        
        const eventsList = data.data || data;
        
        // Ensure we only process an array, and filter for approved events if applicable
        const approvedEvents = Array.isArray(eventsList) 
          ? eventsList.filter(e => {
              const status = (e.status || '').toLowerCase();
              return status === 'approved' || status === ''; // Include if status is empty/missing
            })
          : [];
          
        setEvents(approvedEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Calendar navigation logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getColorForEventType = (type) => {
    const normalizedType = (type || '').toLowerCase();
    if (normalizedType.includes('seminar')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (normalizedType.includes('workshop')) return 'bg-green-100 text-green-800 border-green-200';
    if (normalizedType.includes('conference')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (normalizedType.includes('lecture')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Default styling
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  // Prepare calendar cells
  const calendarDays = [];
  
  // Fill empty slots for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 p-2 opacity-50"></div>
    );
  }

  // Render actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = events.filter(event => {
      const eventDateStr = event.date || event.startTime || event.createdAt;
      if (!eventDateStr) return false;
      try {
        const d = new Date(eventDateStr);
        return d.getFullYear() === currentDate.getFullYear() &&
               d.getMonth() === currentDate.getMonth() &&
               d.getDate() === day;
      } catch (e) {
        return false;
      }
    });

    calendarDays.push(
      <div key={`day-${day}`} className="min-h-[120px] bg-white p-2 flex flex-col hover:bg-gray-50 transition-colors">
        <span className="text-right font-medium text-gray-500 text-sm mb-1">{day}</span>
        <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {dayEvents.map((evt, idx) => {
            const eventId = evt._id || evt.id || idx;
            return (
              <div 
                key={eventId} 
                className={`text-xs p-1.5 rounded border truncate cursor-pointer shadow-sm ${getColorForEventType(evt.type)}`}
                title={evt.title || 'Untitled Event'}
              >
                {evt.title || 'Untitled Event'}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
        <div className="flex items-center space-x-4 bg-white shadow-sm rounded-lg p-1 border border-gray-200">
          <button 
            onClick={prevMonth}
            className="px-4 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium transition"
          >
            &larr; Prev
          </button>
          <span className="text-lg font-semibold text-gray-800 min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="px-4 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium transition"
          >
            Next &rarr;
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-100 p-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays}
        </div>
      </div>
    </div>
  );
}
