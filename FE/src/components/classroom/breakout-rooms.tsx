"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Video,
  Mic,
  MessageCircle,
  FileText,
  Send,
  Save,
  Home,
  Monitor,
  Hand,
  LogOut,
  Camera,
  ScreenShare,
  UserCheck,
  Clock,
  Zap,
  CheckCircle,
  X,
  UserPlus,
} from "lucide-react"

type NotiType = "info" | "success" | "warning"

// ID generator an toàn, tránh trùng key
const makeId = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

interface BreakoutRoomsProps {
  userRole: "admin" | "student";
  assignedRoomId: number | null;
  courseId: number; // Thêm courseId vào interface
}

export function BreakoutRooms({ userRole = "student", assignedRoomId = null }: BreakoutRoomsProps) {
  const [currentView, setCurrentView] = useState<"overview" | "room">("overview")
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [currentUser] = useState({ id: 1, name: "Bạn", role: userRole })
  const [roomTimer, setRoomTimer] = useState(900)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // id -> string để đảm bảo unique ổn định
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: NotiType }>
  >([])
  const [waitingQueue, setWaitingQueue] = useState<Array<{ userId: number; userName: string; timestamp: Date }>>([])
  const [pendingRequests, setPendingRequests] = useState<
    Array<{ id: string; userId: number; userName: string; roomId: number; timestamp: Date }>
  >([])

  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: "Phòng 1",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      participants: [
        { id: 1, name: "Nguyễn Văn A", avatar: "/placeholder.svg?height=100&width=100&text=A", isOnline: true, isLeader: true },
        { id: 2, name: "Trần Thị B", avatar: "/placeholder.svg?height=100&width=100&text=B", isOnline: true, isLeader: false },
        { id: 3, name: "Lê Văn C", avatar: "/placeholder.svg?height=100&width=100&text=C", isOnline: false, isLeader: false },
      ],
      status: "active",
      maxCapacity: 4,
      createdAt: new Date(),
      lastActivity: new Date(),
      assignedMembers: [1, 2, 3],
    },
    {
      id: 2,
      name: "Phòng 2",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      participants: [
        { id: 4, name: "Phạm Thị D", avatar: "/placeholder.svg?height=100&width=100&text=D", isOnline: true, isLeader: true },
        { id: 5, name: "Hoàng Văn E", avatar: "/placeholder.svg?height=100&width=100&text=E", isOnline: true, isLeader: false },
      ],
      status: "active",
      maxCapacity: 4,
      createdAt: new Date(),
      lastActivity: new Date(),
      assignedMembers: [4, 5],
    },
    {
      id: 3,
      name: "Phòng 3",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      participants: [
        { id: 6, name: "Vũ Thị F", avatar: "/placeholder.svg?height=100&width=100&text=F", isOnline: true, isLeader: true },
        { id: 7, name: "Đặng Văn G", avatar: "/placeholder.svg?height=100&width=100&text=G", isOnline: true, isLeader: false },
        { id: 8, name: "Ngô Thị H", avatar: "/placeholder.svg?height=100&width=100&text=H", isOnline: false, isLeader: false },
      ],
      status: "active",
      maxCapacity: 4,
      createdAt: new Date(),
      lastActivity: new Date(),
      assignedMembers: [6, 7, 8],
    },
    {
      id: 4,
      name: "Phòng 4",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      participants: [
        { id: 9, name: "Bùi Văn I", avatar: "/placeholder.svg?height=100&width=100&text=I", isOnline: true, isLeader: true },
        { id: 10, name: "Lý Thị K", avatar: "/placeholder.svg?height=100&width=100&text=K", isOnline: true, isLeader: false },
      ],
      status: "waiting",
      maxCapacity: 4,
      createdAt: new Date(),
      lastActivity: new Date(),
      assignedMembers: [9, 10],
    },
  ])

  useEffect(() => {
    if (assignedRoomId && userRole === "student") {
      const assignedRoom = rooms.find((r) => r.id === assignedRoomId && r.assignedMembers.includes(currentUser.id))
      if (assignedRoom) handleJoinRoom(assignedRoomId, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedRoomId, userRole])

  const findAvailableRoom = () => rooms.find((room) => room.participants.length < room.maxCapacity && room.status === "active")

  const addNotification = (message: string, type: NotiType) => {
    const newNotification = { id: makeId(), message, type }
    setNotifications((prev) => [...prev, newNotification])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
    }, 5000)
  }

  const handleJoinRoom = async (roomId: number, isAutoJoin = false) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    const isAssignedMember = room.assignedMembers.includes(currentUser.id)

    if (isAutoJoin && isAssignedMember) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? {
                ...r,
                participants: [
                  ...r.participants.filter((p) => p.id !== currentUser.id),
                  {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: `/placeholder.svg?height=100&width=100&text=${currentUser.name.charAt(0)}`,
                    isOnline: true,
                    isLeader: r.participants.length === 0,
                  },
                ],
                lastActivity: new Date(),
              }
            : r,
        ),
      )
      setSelectedRoom(roomId)
      setCurrentView("room")
      setIsTimerActive(true)
      addNotification(`Đã tham gia ${room.name} - nhóm được phân!`, "success")
      return
    }

    if (!isAssignedMember && userRole === "student") {
      const existingRequest = pendingRequests.find((r) => r.userId === currentUser.id && r.roomId === roomId)
      if (existingRequest) {
        addNotification("Bạn đã gửi yêu cầu tham gia phòng này!", "warning")
        return
      }
      setPendingRequests((prev) => [
        ...prev,
        { id: makeId(), userId: currentUser.id, userName: currentUser.name, roomId, timestamp: new Date() },
      ])
      addNotification("Đã gửi yêu cầu tham gia! Chờ trưởng nhóm duyệt.", "info")
      return
    }
    if (room.participants.some((p) => p.id === currentUser.id)) {
      addNotification("Bạn đã ở trong phòng này rồi!", "info")
      setSelectedRoom(roomId)
      setCurrentView("room")
      setIsTimerActive(true)
        return
      }
    if (room.participants.length >= room.maxCapacity) {
      addNotification("Phòng đã đầy! Bạn được thêm vào hàng đợi.", "warning")
      setWaitingQueue((prev) => [...prev, { userId: currentUser.id, userName: currentUser.name, timestamp: new Date() }])
      return
    }

    const userInRoom = rooms.find((r) => r.participants.some((p) => p.id === currentUser.id))
    if (userInRoom && userInRoom.id !== roomId) {
      addNotification("Bạn đang ở phòng khác. Rời phòng hiện tại trước!", "warning")
      return
    }

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              participants: [
                ...r.participants,
                {
                  id: currentUser.id,
                  name: currentUser.name,
                  avatar: `/placeholder.svg?height=100&width=100&text=${currentUser.name.charAt(0)}`,
                  isOnline: true,
                  isLeader: false,
                },
              ],
              lastActivity: new Date(),
            }
          : r,
      ),
    )
    setSelectedRoom(roomId)
    setCurrentView("room")
    setIsTimerActive(true)
    addNotification(`Đã tham gia ${room.name} thành công!`, "success")
  }

  const handleApproveRequest = (requestId: string) => {
    const request = pendingRequests.find((r) => r.id === requestId)
    if (!request) return
    const room = rooms.find((r) => r.id === request.roomId)
    if (!room || room.participants.length >= room.maxCapacity) {
      addNotification("Không thể duyệt: Phòng đã đầy!", "warning")
      return
    }
    setRooms((prev) =>
      prev.map((r) =>
        r.id === request.roomId
          ? {
              ...r,
              participants: [
                ...r.participants,
                {
                  id: request.userId,
                  name: request.userName,
                  avatar: `/placeholder.svg?height=100&width=100&text=${request.userName.charAt(0)}`,
                  isOnline: true,
                  isLeader: false,
                },
              ],
              lastActivity: new Date(),
            }
          : r,
      ),
    )
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId))
    addNotification(`Đã duyệt ${request.userName} tham gia phòng!`, "success")
  }

  const handleRejectRequest = (requestId: string) => {
    const request = pendingRequests.find((r) => r.id === requestId)
    if (!request) return
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId))
    addNotification(`Đã từ chối yêu cầu của ${request.userName}`, "info")
  }

  const handleLeaveRoom = () => {
    if (!selectedRoom) return
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom
          ? { ...r, participants: r.participants.filter((p) => p.id !== currentUser.id), lastActivity: new Date() }
          : r,
      ),
    )
    if (waitingQueue.length > 0) {
      const nextUser = waitingQueue[0]
      setWaitingQueue((prev) => prev.slice(1))
      addNotification(`${nextUser.userName} đã được mời vào phòng từ hàng đợi!`, "info")
    }
    setCurrentView("overview")
    setSelectedRoom(null)
    setIsTimerActive(false)
    addNotification("Đã rời phòng thành công!", "info")
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isTimerActive && roomTimer > 0) {
      interval = setInterval(() => {
        setRoomTimer((prev) => {
          if (prev <= 1) {
            addNotification("Thời gian thảo luận đã kết thúc!", "warning")
            setIsTimerActive(false)
            return 0
          }
          if (prev === 300) addNotification("Còn 5 phút nữa sẽ kết thúc thảo luận!", "warning")
          return prev - 1
        })
      }, 1000)
    }
    return () => interval && clearInterval(interval)
  }, [isTimerActive, roomTimer])

  useEffect(() => {
    const cleanup = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          const inactiveTime = Date.now() - room.lastActivity.getTime()
          if (inactiveTime > 300000 && room.participants.length === 0) return { ...room, status: "waiting" }
          return room
        }),
      )
    }, 60000)
    return () => clearInterval(cleanup)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; message: string; time: string }>>([
    { id: makeId(), user: "Nguyễn Văn A", message: "Chào mọi người! Chúng ta bắt đầu thảo luận case Coca-Cola nhé", time: "14:30" },
    { id: makeId(), user: "Trần Thị B", message: "Ok, tôi nghĩ chiến lược branding của họ rất mạnh", time: "14:31" },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [groupNotes, setGroupNotes] = useState(
    "• Coca-Cola có thương hiệu mạnh toàn cầu\n• Chiến lược marketing cảm xúc hiệu quả\n• Cần phân tích thêm về đối thủ cạnh tranh",
  )

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const newMsg = {
      id: makeId(),
      user: currentUser.name,
      message: newMessage,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    }
    setChatMessages((prev) => [...prev, newMsg])
    setNewMessage("")
  }

  const isRoomLeader = () => {
    if (!selectedRoom) return false
    const room = rooms.find((r) => r.id === selectedRoom)
    return room?.participants.find((p) => p.id === currentUser.id)?.isLeader || false
  }

  if (currentView === "room" && selectedRoom) {
    const room = rooms.find((r) => r.id === selectedRoom)
    const roomRequests = pendingRequests.filter((r) => r.roomId === selectedRoom)

    return (
      <div className="space-y-6">
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg shadow-lg ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : notification.type === "warning"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView("overview")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <Home className="h-4 w-4" />
              Quay lại danh sách
            </Button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {room?.name}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 text-orange-700 px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(roomTimer)}
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-700 px-4 py-2">
              <UserCheck className="h-4 w-4 mr-2" />
              {room?.participants.length}/{room?.maxCapacity}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  {room?.topic}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                  <Zap className="h-3 w-3 mr-1" />
                  {room?.status === "active" ? "Đang hoạt động" : "Chờ tham gia"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {room?.participants.map((participant) => (
                  <div
                    key={participant.id} // ✅ dùng id thay vì index
                    className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl relative overflow-hidden border-2 border-white shadow-lg"
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                      <span className="text-6xl font-bold text-white drop-shadow-lg">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {participant.name}
                      {participant.isLeader && <span className="ml-1 text-yellow-400">👑</span>}
                      <span className={`ml-2 w-2 h-2 rounded-full inline-block ${participant.isOnline ? "bg-green-400" : "bg-gray-400"}`} />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="bg-green-500 rounded-full p-2 shadow-lg">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-green-500 rounded-full p-2 shadow-lg">
                        <Mic className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" className="flex items-center gap-2 bg-white/80 border-blue-300 hover:bg-blue-50">
                  <Video className="h-4 w-4" />
                  Camera
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-white/80 border-blue-300 hover:bg-blue-50">
                  <Mic className="h-4 w-4" />
                  Microphone
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-white/80 border-green-300 hover:bg-green-50">
                  <ScreenShare className="h-4 w-4" />
                  Chia sẻ màn hình
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-white/80 border-yellow-300 hover:bg-yellow-50">
                  <Hand className="h-4 w-4" />
                  Giơ tay
                </Button>
                <Button variant="destructive" onClick={handleLeaveRoom} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Rời phòng
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {isRoomLeader() && roomRequests.length > 0 && (
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5" />
                    Yêu cầu tham gia ({roomRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {roomRequests.map((request) => (
                      <div key={request.id} className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{request.userName}</p>
                            <p className="text-xs text-gray-500">
                              {request.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveRequest(request.id)} className="bg-green-500 hover:bg-green-600 text-white">
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)} className="text-red-600 hover:text-red-700 border-red-300">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5" />
                  Chat nhóm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-48 overflow-y-auto space-y-3 mb-4 bg-white/50 rounded-lg p-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-green-700 text-sm">{msg.user}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border-green-300 focus:border-green-500"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="sm" className="bg-green-500 hover:bg-green-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Ghi chú nhóm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Textarea
                  value={groupNotes}
                  onChange={(e) => setGroupNotes(e.target.value)}
                  placeholder="Ghi chú thảo luận của nhóm..."
                  className="h-32 mb-3 border-yellow-300 focus:border-yellow-500 bg-white/70"
                />
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Save className="h-4 w-4 mr-2" />
                  Lưu ghi chú
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : notification.type === "warning"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Phòng thảo luận nhóm
        </h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-700 px-4 py-2">
            <UserCheck className="h-4 w-4" />
            {rooms.filter((r) => r.status === "active").length} phòng đang hoạt động
          </Badge>
          {waitingQueue.length > 0 && (
            <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700 px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {waitingQueue.length} người đang chờ
            </Badge>
          )}
          {pendingRequests.length > 0 && (
            <Badge variant="outline" className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 text-orange-700 px-4 py-2">
              <UserPlus className="h-4 w-4 mr-2" />
              {pendingRequests.length} yêu cầu chờ duyệt
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const isAssignedRoom = room.assignedMembers.includes(currentUser.id)
          const roomRequests = pendingRequests.filter((r) => r.roomId === room.id)
          return (
            <Card
              key={room.id}
              className={`hover:shadow-xl transition-all duration-300 border-2 hover:scale-105 ${
                isAssignedRoom
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400"
                  : "bg-gradient-to-br from-white to-blue-50 border-blue-100 hover:border-blue-300"
              }`}
            >
              <CardHeader
                className={`text-white rounded-t-lg ${
                  isAssignedRoom ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-400 to-purple-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    {room.name}
                    {isAssignedRoom && <span className="text-yellow-300">⭐</span>}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={room.status === "active" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700"}
                    >
                      {room.status === "active" ? (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Chờ
                        </>
                      )}
                    </Badge>
                    {roomRequests.length > 0 && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        {roomRequests.length} yêu cầu
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-6">
                <div className="bg-white/70 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {room.topic}
                  </p>
                  {isAssignedRoom && <p className="text-xs text-green-600 font-medium mt-1">⭐ Nhóm được phân cho bạn</p>}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Thành viên ({room.participants.length}):
                  </p>
                  <div className="flex -space-x-2">
                    {room.participants.map((participant) => (
                      <Avatar key={participant.id} className="border-3 border-white shadow-lg hover:scale-110 transition-transform">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold text-lg">
                          {participant.name.charAt(0).toUpperCase()}
                          {participant.isLeader && <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">👑</span>}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                <Button
                  className={`w-full font-semibold py-3 shadow-lg hover:shadow-xl transition-all text-white ${
                    room.participants.length >= room.maxCapacity
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : isAssignedRoom
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  }`}
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.participants.length >= room.maxCapacity}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {room.participants.length >= room.maxCapacity ? "Phòng đã đầy" : isAssignedRoom ? "Vào nhóm của bạn!" : "Yêu cầu tham gia"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
