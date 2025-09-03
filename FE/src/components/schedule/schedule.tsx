"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MessageCircle } from "lucide-react"

interface ScheduleProps {
  courseId?: number;
}

export function Schedule({ courseId }: ScheduleProps) {
  const qaSchedule = [
    {
      id: 1,
      title: "Q&A Session - Marketing Fundamentals",
      date: "2024-01-15",
      time: "19:00 - 20:00",
      instructor: "TS. Nguyễn Văn Minh",
      registered: 24,
      maxParticipants: 30,
      status: "upcoming",
    },
    {
      id: 2,
      title: "Q&A Session - Digital Marketing Strategies",
      date: "2024-01-29",
      time: "19:00 - 20:00",
      instructor: "TS. Trần Thị Lan",
      registered: 18,
      maxParticipants: 30,
      status: "open",
    },
    {
      id: 3,
      title: "Q&A Session - Consumer Behavior Analysis",
      date: "2024-02-12",
      time: "19:00 - 20:00",
      instructor: "TS. Lê Văn Hùng",
      registered: 0,
      maxParticipants: 30,
      status: "open",
    },
  ]

  const upcomingClasses = [
    {
      id: 1,
      title: "Bài 6: Phân tích thị trường mục tiêu",
      date: "2024-01-10",
      time: "14:00 - 16:00",
      type: "video-lecture",
    },
    {
      id: 2,
      title: "Bài 7: Xây dựng thương hiệu",
      date: "2024-01-12",
      time: "14:00 - 16:00",
      type: "video-lecture",
    },
    {
      id: 3,
      title: "Workshop: Thực hành chiến lược marketing",
      date: "2024-01-14",
      time: "09:00 - 12:00",
      type: "workshop",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lịch học và Q&A{courseId ? ` - Khóa học #${courseId}` : ''}</h2>

      {/* Q&A Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Buổi Q&A định kỳ (2 tuần/lần)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {qaSchedule.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">Giảng viên: {session.instructor}</p>
                </div>
                <Badge variant={session.status === "upcoming" ? "default" : "secondary"}>
                  {session.status === "upcoming" ? "Sắp diễn ra" : "Mở đăng ký"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(session.date).toLocaleDateString("vi-VN")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {session.time}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {session.registered}/{session.maxParticipants} người
                </div>
              </div>

              <Button
                variant={session.status === "upcoming" ? "secondary" : "default"}
                disabled={session.status === "upcoming"}
                className="w-full sm:w-auto"
              >
                {session.status === "upcoming" ? "Đã đăng ký" : "Đăng ký tham gia"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Lịch học sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingClasses.map((classItem) => (
            <div key={classItem.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{classItem.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(classItem.date).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {classItem.time}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{classItem.type === "video-lecture" ? "Video bài giảng" : "Workshop"}</Badge>
              </div>

              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                Đặt lịch nhắc nhở
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}