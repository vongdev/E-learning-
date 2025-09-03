"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Users,
  Book,
  CheckCircle,
  PlusCircle,
  FileText,
} from "lucide-react"

type EventType = "lecture" | "assignment" | "exam" | "discussion" | "workshop" | "holiday"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  startTime?: string
  endTime?: string
  type: EventType
  description?: string
  location?: string
  course?: string
  isCompleted?: boolean
}

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterType, setFilterType] = useState<EventType | "all">("all")
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    type: "lecture",
    date: new Date(),
    startTime: "",
    endTime: "",
    description: "",
  })

  // Sample events - in a real app, this would come from an API or context
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Bài 5: Nguyên lý Marketing Cơ bản",
      date: new Date(2024, 0, 15),
      startTime: "14:00",
      endTime: "16:00",
      type: "lecture",
      description: "Tìm hiểu về các nguyên lý cơ bản của marketing và cách áp dụng trong thực tế",
      course: "Nguyên lý Marketing",
      isCompleted: false,
    },
    {
      id: "2",
      title: "Nộp bài: Case study marketing",
      date: new Date(2024, 0, 20),
      type: "assignment",
      description: "Phân tích chiến lược marketing của một thương hiệu lớn",
      course: "Nguyên lý Marketing",
      isCompleted: false,
    },
    {
      id: "3",
      title: "Thảo luận nhóm: Chiến lược digital marketing",
      date: new Date(2024, 0, 18),
      startTime: "10:00",
      endTime: "11:30",
      type: "discussion",
      description: "Thảo luận về các xu hướng digital marketing mới nhất",
      course: "Nguyên lý Marketing",
      location: "Phòng 3.2",
      isCompleted: false,
    },
    {
      id: "4",
      title: "Kỳ thi giữa kỳ",
      date: new Date(2024, 1, 5),
      startTime: "08:00",
      endTime: "10:00",
      type: "exam",
      description: "Kỳ thi giữa kỳ môn Marketing",
      course: "Nguyên lý Marketing",
      location: "Phòng 5.1",
      isCompleted: false,
    },
    {
      id: "5",
      title: "Workshop: Thực hành xây dựng kế hoạch marketing",
      date: new Date(2024, 0, 25),
      startTime: "14:00",
      endTime: "17:00",
      type: "workshop",
      description: "Workshop thực hành xây dựng kế hoạch marketing cho dự án thực tế",
      course: "Nguyên lý Marketing",
      location: "Phòng Lab 2",
      isCompleted: false,
    },
  ])

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1)
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    
    // Total number of days in the month
    const daysInMonth = lastDayOfMonth.getDate()
    
    // Array to hold all calendar days
    const days = []
    
    // Add days from previous month to fill the first week
    const prevMonth = month === 0 ? 11 : month - 1
    const prevMonthYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = daysInPrevMonth - firstDayOfWeek + i + 1
      days.push({
        date: new Date(prevMonthYear, prevMonth, day),
        isCurrentMonth: false,
        events: [] as CalendarEvent[],
      })
    }
    
    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.getDate() === day && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year &&
               (filterType === "all" || event.type === filterType)
      })
      
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents,
      })
    }
    
    // Add days from next month to complete the calendar grid
    const remainingDays = 42 - days.length // 6 rows * 7 days = 42
    const nextMonth = month === 11 ? 0 : month + 1
    const nextMonthYear = month === 11 ? year + 1 : year
    
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(nextMonthYear, nextMonth, day),
        isCurrentMonth: false,
        events: [] as CalendarEvent[],
      })
    }
    
    return days
  }, [currentDate, events, filterType])

  // Generate week view
  const weekViewDays = useMemo(() => {
    const startDate = new Date(currentDate)
    const dayOfWeek = startDate.getDay() // 0 for Sunday, 1 for Monday, etc.
    
    // Adjust to start from Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.getDate() === date.getDate() && 
               eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear() &&
               (filterType === "all" || event.type === filterType)
      })
      
      days.push({
        date,
        events: dayEvents,
      })
    }
    
    return days
  }, [currentDate, events, filterType])

  // Day view events
  const dayViewEvents = useMemo(() => {
    if (!selectedDate) return []
    
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear() &&
             (filterType === "all" || event.type === filterType)
    })
  }, [selectedDate, events, filterType])

  // Navigate to previous month/week/day
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  // Navigate to next month/week/day
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Handle click on a date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    
    if (viewMode !== "day") {
      // If we're not already in day view, switch to day view
      setViewMode("day")
      setCurrentDate(date)
    }
  }

  // Handle click on an event
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering date click
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  // Get event type color
  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 border-blue-300 text-blue-800"
      case "assignment":
        return "bg-green-100 border-green-300 text-green-800"
      case "exam":
        return "bg-red-100 border-red-300 text-red-800"
      case "discussion":
        return "bg-purple-100 border-purple-300 text-purple-800"
      case "workshop":
        return "bg-orange-100 border-orange-300 text-orange-800"
      case "holiday":
        return "bg-gray-100 border-gray-300 text-gray-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  // Get event type icon
  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "lecture":
        return <Video className="h-4 w-4" />
      case "assignment":
        return <FileText className="h-4 w-4" />
      case "exam":
        return <Book className="h-4 w-4" />
      case "discussion":
        return <Users className="h-4 w-4" />
      case "workshop":
        return <Users className="h-4 w-4" />
      case "holiday":
        return <CalendarIcon className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  // Format the date range for display
  const getDateRangeText = () => {
    if (viewMode === "month") {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    } else if (viewMode === "week") {
      const startOfWeek = new Date(weekViewDays[0].date)
      const endOfWeek = new Date(weekViewDays[6].date)
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${MONTHS[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`
      } else {
        return `${startOfWeek.getDate()} ${MONTHS[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${MONTHS[endOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`
      }
    } else {
      return new Date(currentDate).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    }
  }

  // Toggle event completion status
  const toggleEventCompletion = (event: CalendarEvent) => {
    setEvents(events.map(e => 
      e.id === event.id ? { ...e, isCompleted: !e.isCompleted } : e
    ))
    setSelectedEvent({ ...event, isCompleted: !event.isCompleted })
  }

  // Handle creating a new event
  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    
    const createdEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      type: newEvent.type as EventType,
      description: newEvent.description,
      location: newEvent.location,
      course: newEvent.course,
      isCompleted: false,
    }
    
    setEvents([...events, createdEvent])
    setNewEvent({
      title: "",
      type: "lecture",
      date: new Date(),
      startTime: "",
      endTime: "",
      description: "",
    })
    setIsCreatingEvent(false)
  }

  // Truncate text if too long
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Lịch học & Sự kiện</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as "month" | "week" | "day")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Chọn chế độ xem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="day">Ngày</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={(value) => setFilterType(value as EventType | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="lecture">Bài giảng</SelectItem>
                <SelectItem value="assignment">Bài tập</SelectItem>
                <SelectItem value="exam">Kiểm tra</SelectItem>
                <SelectItem value="discussion">Thảo luận</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="holiday">Ngày nghỉ</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => setIsCreatingEvent(true)} className="bg-transparent">
              <PlusCircle className="h-4 w-4 mr-2" />
              Tạo sự kiện
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPrevious} className="bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext} className="bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="font-medium text-lg">{getDateRangeText()}</h2>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday} className="bg-transparent">
              Hôm nay
            </Button>
          </div>
          
          {/* Month View */}
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center font-medium py-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, index) => {
                const isToday = 
                  day.date.getDate() === new Date().getDate() && 
                  day.date.getMonth() === new Date().getMonth() && 
                  day.date.getFullYear() === new Date().getFullYear()
                
                return (
                  <div 
                    key={index}
                    onClick={() => handleDateClick(day.date)}
                    className={`min-h-24 p-2 border rounded-lg overflow-hidden transition-colors cursor-pointer ${
                      isToday ? 'bg-blue-50 border-blue-300' :
                      day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={isToday ? 'font-bold text-blue-600' : ''}>
                        {day.date.getDate()}
                      </span>
                      {day.events.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {day.events.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map(event => (
                        <div 
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`px-2 py-1 text-xs rounded-md border ${getEventTypeColor(event.type)} ${event.isCompleted ? 'opacity-60 line-through' : ''}`}
                        >
                          {truncateText(event.title, 15)}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-gray-500 pl-1">
                          + {day.events.length - 2} sự kiện khác
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Week View */}
          {viewMode === "week" && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {weekViewDays.map((day, index) => {
                  const isToday = 
                    day.date.getDate() === new Date().getDate() && 
                    day.date.getMonth() === new Date().getMonth() && 
                    day.date.getFullYear() === new Date().getFullYear()
                  
                  return (
                    <div key={index} className="text-center">
                      <div 
                        className={`py-2 font-medium ${isToday ? 'text-blue-600' : ''}`}
                      >
                        {DAYS_OF_WEEK[day.date.getDay()]}
                      </div>
                      <div 
                        onClick={() => handleDateClick(day.date)}
                        className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto cursor-pointer ${
                          isToday ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        {day.date.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="border rounded-lg divide-y">
                {weekViewDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="p-3">
                    <h3 className="font-medium mb-2">
                      {day.date.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    {day.events.length > 0 ? (
                      <div className="space-y-2">
                        {day.events.map(event => (
                          <div 
                            key={event.id} 
                            onClick={(e) => handleEventClick(event, e)}
                            className={`p-3 rounded-lg border ${getEventTypeColor(event.type)} cursor-pointer ${event.isCompleted ? 'opacity-60' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="font-medium flex items-center gap-1">
                                  {getEventTypeIcon(event.type)}
                                  <span className={event.isCompleted ? 'line-through' : ''}>
                                    {event.title}
                                  </span>
                                </div>
                                {event.startTime && (
                                  <div className="text-sm flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.startTime} - {event.endTime}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="text-sm">{event.location}</div>
                                )}
                              </div>
                              {event.isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 py-4 text-center italic">
                        Không có sự kiện
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Day View */}
          {viewMode === "day" && selectedDate && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-xl mb-4">
                {selectedDate.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              
              {dayViewEvents.length > 0 ? (
                <div className="space-y-3">
                  {dayViewEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`p-4 rounded-lg border ${getEventTypeColor(event.type)} ${event.isCompleted ? 'opacity-60' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getEventTypeIcon(event.type)}
                            <h4 className={`font-semibold ${event.isCompleted ? 'line-through' : ''}`}>
                              {event.title}
                            </h4>
                            <Badge variant="outline" className="ml-2">{event.type}</Badge>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm mb-3">{event.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            {event.startTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.startTime} - {event.endTime}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                            {event.course && (
                              <div className="flex items-center gap-1">
                                <Book className="h-4 w-4" />
                                {event.course}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={event.isCompleted ? "outline" : "default"}
                            className={event.isCompleted ? "bg-transparent" : ""}
                            onClick={() => toggleEventCompletion(event)}
                          >
                            {event.isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-lg">Không có sự kiện nào trong ngày này</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Event Detail Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getEventTypeIcon(selectedEvent.type)}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                {selectedEvent.description ? (
                  <p>{selectedEvent.description}</p>
                ) : (
                  <p className="text-gray-500 italic">Không có mô tả</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Ngày</div>
                  <div className="font-medium flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {selectedEvent.date.toLocaleDateString("vi-VN")}
                  </div>
                </div>
                
                {selectedEvent.startTime && (
                  <div className="border p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Thời gian</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </div>
                  </div>
                )}
                
                {selectedEvent.location && (
                  <div className="border p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Địa điểm</div>
                    <div className="font-medium">{selectedEvent.location}</div>
                  </div>
                )}
                
                {selectedEvent.course && (
                  <div className="border p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Khóa học</div>
                    <div className="font-medium">{selectedEvent.course}</div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => toggleEventCompletion(selectedEvent)} className="bg-transparent">
                  {selectedEvent.isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                </Button>
                <Button onClick={() => setShowEventDialog(false)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Event Dialog */}
      <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo sự kiện mới</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Tiêu đề</Label>
              <Input 
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Nhập tiêu đề sự kiện"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Ngày</Label>
                <Input 
                  id="event-date"
                  type="date"
                  value={newEvent.date ? newEvent.date.toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewEvent({...newEvent, date: new Date(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-type">Loại sự kiện</Label>
                <Select 
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({...newEvent, type: value as EventType})}
                >
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Chọn loại sự kiện" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Bài giảng</SelectItem>
                    <SelectItem value="assignment">Bài tập</SelectItem>
                    <SelectItem value="exam">Kiểm tra</SelectItem>
                    <SelectItem value="discussion">Thảo luận</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="holiday">Ngày nghỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-start-time">Giờ bắt đầu</Label>
                <Input 
                  id="event-start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-end-time">Giờ kết thúc</Label>
                <Input 
                  id="event-end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-location">Địa điểm</Label>
                <Input 
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Địa điểm (tùy chọn)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-course">Khóa học</Label>
                <Input 
                  id="event-course"
                  value={newEvent.course}
                  onChange={(e) => setNewEvent({...newEvent, course: e.target.value})}
                  placeholder="Khóa học (tùy chọn)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-description">Mô tả</Label>
              <Textarea 
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Mô tả chi tiết (tùy chọn)"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreatingEvent(false)} className="bg-transparent">
                Hủy
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title || !newEvent.date}>
                Tạo sự kiện
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}