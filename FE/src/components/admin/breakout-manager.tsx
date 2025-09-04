"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, UserPlus, UserMinus, Clock, Zap, UserCheck, Settings, 
  Trash2, Plus, RefreshCw, MessageCircle, AlertCircle
} from "lucide-react"

// Tạm thời định nghĩa hàm toast thay thế
const showToast = (options: { title?: string; description?: string; variant?: string }) => {
  console.log(`${options.variant || 'info'}: ${options.title} - ${options.description}`);
  // Bạn có thể thay thế bằng window.alert tạm thời để thấy thông báo
  // window.alert(`${options.title}: ${options.description}`);
};

interface Student {
  id: number
  name: string
  email: string
  avatar?: string
}

interface Participant extends Student {
  isLeader: boolean
  isOnline: boolean
  joinedAt: Date
}

interface BreakoutRoom {
  id: number
  name: string
  topic: string
  status: "active" | "waiting" | "completed"
  maxCapacity: number
  participants: Participant[]
  createdAt: Date
  lastActivity: Date
  duration: number // in minutes
}

export function BreakoutManager() {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([
    {
      id: 1,
      name: "Nhóm 1",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      status: "active",
      maxCapacity: 4,
      participants: [
        {
          id: 1, 
          name: "Nguyễn Văn A", 
          email: "nguyenvana@uth.edu.vn",
          avatar: "/placeholder.svg?height=100&width=100&text=A", 
          isLeader: true, 
          isOnline: true,
          joinedAt: new Date(Date.now() - 30 * 60000)
        },
        {
          id: 2, 
          name: "Trần Thị B", 
          email: "tranthib@uth.edu.vn",
          avatar: "/placeholder.svg?height=100&width=100&text=B", 
          isLeader: false, 
          isOnline: true,
          joinedAt: new Date(Date.now() - 28 * 60000)
        },
        {
          id: 3, 
          name: "Lê Văn C", 
          email: "levanc@uth.edu.vn",
          avatar: "/placeholder.svg?height=100&width=100&text=C", 
          isLeader: false, 
          isOnline: false,
          joinedAt: new Date(Date.now() - 15 * 60000)
        },
      ],
      createdAt: new Date(Date.now() - 35 * 60000),
      lastActivity: new Date(),
      duration: 45,
    },
    {
      id: 2,
      name: "Nhóm 2",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      status: "active",
      maxCapacity: 4,
      participants: [
        {
          id: 4, 
          name: "Phạm Thị D", 
          email: "phamthid@uth.edu.vn",
          avatar: "/placeholder.svg?height=100&width=100&text=D", 
          isLeader: true, 
          isOnline: true,
          joinedAt: new Date(Date.now() - 25 * 60000)
        },
        {
          id: 5, 
          name: "Hoàng Văn E", 
          email: "hoangvane@uth.edu.vn",
          avatar: "/placeholder.svg?height=100&width=100&text=E", 
          isLeader: false, 
          isOnline: true,
          joinedAt: new Date(Date.now() - 20 * 60000)
        },
      ],
      createdAt: new Date(Date.now() - 30 * 60000),
      lastActivity: new Date(Date.now() - 5 * 60000),
      duration: 45,
    },
    {
      id: 3,
      name: "Nhóm 3",
      topic: "Thảo luận Case A: Chiến lược Coca-Cola",
      status: "waiting",
      maxCapacity: 4,
      participants: [],
      createdAt: new Date(Date.now() - 10 * 60000),
      lastActivity: new Date(Date.now() - 10 * 60000),
      duration: 45,
    },
  ])

  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([
    { id: 6, name: "Vũ Thị F", email: "vuthif@uth.edu.vn" },
    { id: 7, name: "Đặng Văn G", email: "dangvang@uth.edu.vn" },
    { id: 8, name: "Ngô Thị H", email: "ngothih@uth.edu.vn" },
    { id: 9, name: "Bùi Văn I", email: "buivani@uth.edu.vn" },
    { id: 10, name: "Lý Thị K", email: "lythik@uth.edu.vn" },
  ])

  // Dialog controls
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false)
  const [showEditRoomDialog, setShowEditRoomDialog] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<BreakoutRoom | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: string; id: number; roomId?: number } | null>(null)
  
  // Form states
  const [newRoomData, setNewRoomData] = useState({
    name: "",
    topic: "",
    maxCapacity: 4,
    duration: 45
  })

  // Helper functions
  const findRoomById = useCallback((roomId: number): BreakoutRoom | undefined => {
    return rooms.find(r => r.id === roomId);
  }, [rooms]);

  const validateRoomData = (data: typeof newRoomData): boolean => {
    if (!data.name.trim()) {
      showToast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên phòng",
        variant: "destructive"
      });
      return false;
    }
    
    if (!data.topic.trim()) {
      showToast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập chủ đề thảo luận",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  // Handlers for room operations
  const handleCreateRoom = () => {
    try {
      if (!validateRoomData(newRoomData)) return;

      const newRoom: BreakoutRoom = {
        id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1,
        name: newRoomData.name.trim(),
        topic: newRoomData.topic.trim(),
        status: "waiting",
        maxCapacity: newRoomData.maxCapacity,
        participants: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        duration: newRoomData.duration
      };
      
      setRooms([...rooms, newRoom]);
      setNewRoomData({
        name: "",
        topic: "",
        maxCapacity: 4,
        duration: 45
      });
      setShowNewRoomDialog(false);
      
      showToast({
        title: "Thành công",
        description: `Đã tạo phòng "${newRoom.name}"`,
      });
    } catch (error) {
      console.error("Error creating room:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể tạo phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleEditRoom = () => {
    try {
      if (!currentRoom) return;
      
      if (!currentRoom.name.trim() || !currentRoom.topic.trim()) {
        showToast({
          title: "Thiếu thông tin",
          description: "Vui lòng nhập đầy đủ tên phòng và chủ đề",
          variant: "destructive"
        });
        return;
      }
      
      // Validate max capacity compared to current participants
      if (currentRoom.participants.length > currentRoom.maxCapacity) {
        showToast({
          title: "Lỗi cấu hình",
          description: `Số thành viên hiện tại (${currentRoom.participants.length}) vượt quá số lượng tối đa (${currentRoom.maxCapacity})`,
          variant: "destructive"
        });
        return;
      }

      setRooms(rooms.map(room => 
        room.id === currentRoom.id ? {
          ...currentRoom,
          name: currentRoom.name.trim(),
          topic: currentRoom.topic.trim(),
          lastActivity: new Date()
        } : room
      ));
      
      setCurrentRoom(null);
      setShowEditRoomDialog(false);
      
      showToast({
        title: "Thành công",
        description: "Đã cập nhật thông tin phòng",
      });
    } catch (error) {
      console.error("Error editing room:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể cập nhật phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const confirmDeleteRoom = (roomId: number) => {
    const room = findRoomById(roomId);
    if (!room) return;
    
    if (room.participants.length > 0) {
      setPendingAction({ type: 'deleteRoom', id: roomId });
      setShowConfirmDialog(true);
    } else {
      handleDeleteRoom(roomId);
    }
  };
  
  const handleDeleteRoom = (roomId: number) => {
    try {
      // Return participants to unassigned list
      const room = findRoomById(roomId);
      if (!room) return;
      
      const participantsToReturn = room.participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: p.avatar
      }));
      
      setUnassignedStudents(prev => [...prev, ...participantsToReturn]);
      setRooms(rooms.filter(room => room.id !== roomId));
      
      // Close dialog if open
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
        setShowEditRoomDialog(false);
      }
      
      setShowConfirmDialog(false);
      setPendingAction(null);
      
      showToast({
        title: "Thành công",
        description: `Đã xóa phòng "${room.name}"`,
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể xóa phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const handleStartRoom = (roomId: number) => {
    try {
      const room = findRoomById(roomId);
      if (!room) return;
      
      if (room.participants.length === 0) {
        showToast({
          title: "Không thể bắt đầu",
          description: "Phòng thảo luận cần ít nhất một thành viên để bắt đầu",
          variant: "destructive"
        });
        return;
      }
      
      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, status: "active", lastActivity: new Date() } : room
      ));
      
      showToast({
        title: "Thành công",
        description: `Đã bắt đầu phòng "${room.name}"`,
      });
    } catch (error) {
      console.error("Error starting room:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể bắt đầu phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const handleEndRoom = (roomId: number) => {
    try {
      const room = findRoomById(roomId);
      if (!room) return;
      
      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, status: "completed", lastActivity: new Date() } : room
      ));
      
      showToast({
        title: "Thành công",
        description: `Đã kết thúc phòng "${room.name}"`,
      });
    } catch (error) {
      console.error("Error ending room:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể kết thúc phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  // Student assignment handlers
  const assignStudentToRoom = (studentId: number, roomId: number) => {
    try {
      const student = unassignedStudents.find(s => s.id === studentId);
      if (!student) {
        showToast({
          title: "Lỗi",
          description: "Không tìm thấy sinh viên",
          variant: "destructive"
        });
        return;
      }
      
      const targetRoom = findRoomById(roomId);
      if (!targetRoom) {
        showToast({
          title: "Lỗi",
          description: "Không tìm thấy phòng",
          variant: "destructive"
        });
        return;
      }
      
      if (targetRoom.status === "completed") {
        showToast({
          title: "Không thể thêm",
          description: "Không thể thêm sinh viên vào phòng đã kết thúc",
          variant: "destructive"
        });
        return;
      }
      
      if (targetRoom.participants.length >= targetRoom.maxCapacity) {
        showToast({
          title: "Phòng đã đầy",
          description: `Phòng "${targetRoom.name}" đã đạt số lượng thành viên tối đa`,
          variant: "destructive"
        });
        return;
      }
      
      const isFirstParticipant = targetRoom.participants.length === 0;
      
      // Create new participant object
      const newParticipant: Participant = {
        ...student,
        isLeader: isFirstParticipant,
        isOnline: false,
        joinedAt: new Date()
      };
      
      // Update rooms state
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              participants: [...room.participants, newParticipant],
              status: isFirstParticipant ? "active" : room.status,
              lastActivity: new Date()
            } 
          : room
      ));
      
      // Remove from unassigned list
      setUnassignedStudents(unassignedStudents.filter(s => s.id !== studentId));
      
      showToast({
        title: "Thành công",
        description: `Đã thêm ${student.name} vào phòng "${targetRoom.name}"`,
      });
    } catch (error) {
      console.error("Error assigning student:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể thêm sinh viên vào phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const confirmRemoveStudent = (studentId: number, roomId: number) => {
    setPendingAction({ type: 'removeStudent', id: studentId, roomId });
    setShowConfirmDialog(true);
  };
  
  const removeStudentFromRoom = (studentId: number, roomId: number) => {
    try {
      const room = findRoomById(roomId);
      if (!room) {
        showToast({
          title: "Lỗi",
          description: "Không tìm thấy phòng",
          variant: "destructive"
        });
        return;
      }
      
      const student = room.participants.find(p => p.id === studentId);
      if (!student) {
        showToast({
          title: "Lỗi",
          description: "Không tìm thấy sinh viên trong phòng",
          variant: "destructive"
        });
        return;
      }
      
      // Check if this is the last leader
      const isOnlyLeader = student.isLeader && room.participants.filter(p => p.isLeader).length === 1;
      
      // If removing the only leader and there are other participants, auto-assign a new leader
      let updatedParticipants = room.participants.filter(p => p.id !== studentId);
      if (isOnlyLeader && updatedParticipants.length > 0) {
        updatedParticipants = updatedParticipants.map((p, index) => 
          index === 0 ? { ...p, isLeader: true } : p
        );
      }
      
      // Update rooms state
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              participants: updatedParticipants,
              status: updatedParticipants.length === 0 ? "waiting" : room.status,
              lastActivity: new Date()
            } 
          : room
      ));
      
      // Add to unassigned list
      setUnassignedStudents([...unassignedStudents, {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar
      }]);
      
      setShowConfirmDialog(false);
      setPendingAction(null);
      
      showToast({
        title: "Thành công",
        description: `Đã xóa ${student.name} khỏi phòng "${room.name}"`,
      });
    } catch (error) {
      console.error("Error removing student:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể xóa sinh viên khỏi phòng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const randomAssignStudents = () => {
    try {
      if (unassignedStudents.length === 0) {
        showToast({
          title: "Không có sinh viên",
          description: "Không có sinh viên nào để phân nhóm",
          variant: "destructive"
        });
        return;
      }
      
      // Get available rooms
      const availableRooms = rooms.filter(r => 
        r.status !== "completed" && r.participants.length < r.maxCapacity
      );
      
      if (availableRooms.length === 0) {
        showToast({
          title: "Không có phòng trống",
          description: "Tất cả các phòng đã đầy hoặc đã kết thúc",
          variant: "destructive"
        });
        return;
      }
      
      // Clone current state
      let updatedRooms = [...rooms];
      
      // Shuffle students
      const shuffledStudents = [...unassignedStudents].sort(() => Math.random() - 0.5);
      let remainingStudents = [...shuffledStudents];
      let assignedStudents: Student[] = [];
      
      // Distribute students evenly across rooms
      while (remainingStudents.length > 0) {
        let studentAssigned = false;
        
        // Try to assign a student to each room in turn
        for (let i = 0; i < updatedRooms.length; i++) {
          if (updatedRooms[i].status === "completed") continue;
          
          if (updatedRooms[i].participants.length < updatedRooms[i].maxCapacity && remainingStudents.length > 0) {
            const student = remainingStudents.shift()!;
            assignedStudents.push(student);
            
            const isFirstParticipant = updatedRooms[i].participants.length === 0;
            
            // Add student to room
            updatedRooms[i] = {
              ...updatedRooms[i],
              participants: [
                ...updatedRooms[i].participants,
                { 
                  ...student,
                  isLeader: isFirstParticipant,
                  isOnline: false,
                  joinedAt: new Date()
                }
              ],
              status: isFirstParticipant ? "active" : updatedRooms[i].status,
              lastActivity: new Date()
            };
            
            studentAssigned = true;
          }
        }
        
        // If no student could be assigned, we're done
        if (!studentAssigned) break;
      }
      
      // Update state with new assignments
      setRooms(updatedRooms);
      
      // Remove assigned students from unassigned list
      const assignedIds = new Set(assignedStudents.map(s => s.id));
      setUnassignedStudents(unassignedStudents.filter(s => !assignedIds.has(s.id)));
      
      showToast({
        title: "Thành công",
        description: `Đã phân ${assignedStudents.length} sinh viên vào các nhóm`,
      });
    } catch (error) {
      console.error("Error in random assignment:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể phân nhóm ngẫu nhiên. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const makeLeader = (studentId: number, roomId: number) => {
    try {
      const room = findRoomById(roomId);
      if (!room) return;
      
      const student = room.participants.find(p => p.id === studentId);
      if (!student) return;
      
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              participants: room.participants.map(p => ({
                ...p,
                isLeader: p.id === studentId
              })),
              lastActivity: new Date()
            } 
          : room
      ));
      
      showToast({
        title: "Thành công",
        description: `Đã đặt ${student.name} làm trưởng nhóm`,
      });
    } catch (error) {
      console.error("Error setting leader:", error);
      showToast({
        title: "Lỗi",
        description: "Không thể đặt trưởng nhóm. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý nhóm thảo luận</h2>
          <p className="text-muted-foreground">Tạo và quản lý các phòng thảo luận (breakout rooms) cho sinh viên</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={randomAssignStudents}
            disabled={unassignedStudents.length === 0 || rooms.filter(r => r.status !== "completed" && r.participants.length < r.maxCapacity).length === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className="h-4 w-4" />
            Chia ngẫu nhiên
          </Button>
          <Button onClick={() => setShowNewRoomDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">
            <Plus className="h-4 w-4 mr-2" />
            Tạo nhóm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakout Rooms */}
        <div className="lg:col-span-2">
          <div className="space-y-5">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <Card key={room.id} className={`border-2 ${
                  room.status === 'active' 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : room.status === 'completed'
                      ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
                      : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
                }`}>
                  <CardHeader className={`pb-2 ${
                    room.status === 'active' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : room.status === 'completed'
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {room.name} - {room.participants.length}/{room.maxCapacity} thành viên
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white/20 text-white border-white/50">
                          {room.status === 'active' ? 'Đang diễn ra' : room.status === 'completed' ? 'Đã kết thúc' : 'Chờ bắt đầu'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-white hover:bg-white/20"
                              onClick={() => {
                                setCurrentRoom(room)
                                setShowEditRoomDialog(true)
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    </div>
                    <CardDescription className="text-white/90 text-xs">
                      {room.topic}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Room info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {room.participants.map((participant) => (
                              <Avatar key={participant.id} className="border-2 border-white">
                                <AvatarFallback className={`${
                                  participant.isLeader 
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                    : 'bg-gradient-to-br from-blue-400 to-purple-500'
                                } text-white`}>
                                  {participant.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {room.participants.length === 0 && (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">Thời lượng: {room.duration} phút</p>
                            <p className="text-muted-foreground text-xs">
                              Tạo: {room.createdAt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div>
                          {room.status === 'waiting' ? (
                            <Button 
                              onClick={() => handleStartRoom(room.id)} 
                              className="bg-gradient-to-r from-green-500 to-emerald-500"
                              disabled={room.participants.length === 0}
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Bắt đầu
                            </Button>
                          ) : room.status === 'active' ? (
                            <Button 
                              onClick={() => handleEndRoom(room.id)} 
                              variant="destructive"
                              className="bg-gradient-to-r from-red-500 to-pink-500"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Kết thúc
                            </Button>
                          ) : (
                            <Button
                              onClick={() => confirmDeleteRoom(room.id)} 
                              variant="outline"
                              className="border-red-300 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa phòng
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Participant List */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Danh sách thành viên:</h4>
                        <div className="divide-y">
                          {room.participants.map((participant) => (
                            <div key={participant.id} className="py-2 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={`${
                                    participant.isLeader 
                                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                      : 'bg-gradient-to-br from-blue-400 to-purple-500'
                                  } text-white text-xs`}>
                                    {participant.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{participant.name}</p>
                                    {participant.isLeader && (
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                        Nhóm trưởng
                                      </Badge>
                                    )}
                                    <span className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{participant.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!participant.isLeader && room.status !== 'completed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => makeLeader(participant.id, room.id)}
                                    className="h-8 bg-transparent border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Đặt làm trưởng nhóm
                                  </Button>
                                )}
                                {room.status !== 'completed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => confirmRemoveStudent(participant.id, room.id)}
                                    className="h-8 bg-transparent border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <UserMinus className="h-3 w-3 mr-1" />
                                    Xóa
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {room.participants.length === 0 && (
                            <div className="py-4 text-center text-muted-foreground text-sm">
                              Chưa có thành viên nào trong phòng
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có phòng thảo luận</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">Tạo phòng thảo luận mới để sinh viên có thể tham gia thảo luận nhóm</p>
                <Button onClick={() => setShowNewRoomDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo phòng thảo luận
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Unassigned Students */}
        <div>
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sinh viên chưa phân nhóm ({unassignedStudents.length})
              </CardTitle>
              <CardDescription className="text-gray-300 text-xs">
                Kéo thả hoặc chọn nhóm để phân sinh viên vào phòng thảo luận
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {unassignedStudents.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {unassignedStudents.map((student) => (
                    <div key={student.id} className="p-3 bg-white rounded-lg border hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>

                        <Select onValueChange={(value) => assignStudentToRoom(student.id, parseInt(value))}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Chọn nhóm" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms
                              .filter(room => room.status !== 'completed' && room.participants.length < room.maxCapacity)
                              .map(room => (
                                <SelectItem key={room.id} value={room.id.toString()}>
                                  {room.name} ({room.participants.length}/{room.maxCapacity})
                                </SelectItem>
                              ))}
                            {rooms.filter(room => room.status !== 'completed' && room.participants.length < room.maxCapacity).length === 0 && (
                              <SelectItem value="none" disabled>Không có phòng trống</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <UserCheck className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  Tất cả sinh viên đã được phân nhóm
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Room Dialog */}
      <Dialog open={showNewRoomDialog} onOpenChange={setShowNewRoomDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Tạo phòng thảo luận mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Tên phòng <span className="text-red-500">*</span></Label>
              <Input 
                id="room-name" 
                value={newRoomData.name}
                onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                placeholder="VD: Nhóm 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-topic">Chủ đề thảo luận <span className="text-red-500">*</span></Label>
              <Textarea 
                id="room-topic" 
                value={newRoomData.topic}
                onChange={(e) => setNewRoomData({...newRoomData, topic: e.target.value})}
                placeholder="Nhập chủ đề thảo luận cho nhóm..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Số thành viên tối đa</Label>
                <Select 
                  value={newRoomData.maxCapacity.toString()}
                  onValueChange={(value) => setNewRoomData({...newRoomData, maxCapacity: parseInt(value)})}
                >
                  <SelectTrigger id="room-capacity">
                    <SelectValue placeholder="Chọn số lượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 người</SelectItem>
                    <SelectItem value="3">3 người</SelectItem>
                    <SelectItem value="4">4 người</SelectItem>
                    <SelectItem value="5">5 người</SelectItem>
                    <SelectItem value="6">6 người</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-duration">Thời lượng (phút)</Label>
                <Select 
                  value={newRoomData.duration.toString()}
                  onValueChange={(value) => setNewRoomData({...newRoomData, duration: parseInt(value)})}
                >
                  <SelectTrigger id="room-duration">
                    <SelectValue placeholder="Chọn thời lượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 phút</SelectItem>
                    <SelectItem value="30">30 phút</SelectItem>
                    <SelectItem value="45">45 phút</SelectItem>
                    <SelectItem value="60">60 phút</SelectItem>
                    <SelectItem value="90">90 phút</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewRoomDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateRoom} disabled={!newRoomData.name || !newRoomData.topic}>
              Tạo phòng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditRoomDialog} onOpenChange={(open) => {
        if (!open) setCurrentRoom(null);
        setShowEditRoomDialog(open);
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng thảo luận</DialogTitle>
          </DialogHeader>
          {currentRoom && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-room-name">Tên phòng <span className="text-red-500">*</span></Label>
                <Input 
                  id="edit-room-name" 
                  value={currentRoom.name}
                  onChange={(e) => setCurrentRoom({...currentRoom, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-topic">Chủ đề thảo luận <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="edit-room-topic" 
                  value={currentRoom.topic}
                  onChange={(e) => setCurrentRoom({...currentRoom, topic: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-room-capacity">Số thành viên tối đa</Label>
                  <Select 
                    value={currentRoom.maxCapacity.toString()}
                    onValueChange={(value) => setCurrentRoom({...currentRoom, maxCapacity: parseInt(value)})}
                  >
                    <SelectTrigger id="edit-room-capacity">
                      <SelectValue placeholder="Chọn số lượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 người</SelectItem>
                      <SelectItem value="3">3 người</SelectItem>
                      <SelectItem value="4">4 người</SelectItem>
                      <SelectItem value="5">5 người</SelectItem>
                      <SelectItem value="6">6 người</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-duration">Thời lượng (phút)</Label>
                  <Select 
                    value={currentRoom.duration.toString()}
                    onValueChange={(value) => setCurrentRoom({...currentRoom, duration: parseInt(value)})}
                  >
                    <SelectTrigger id="edit-room-duration">
                      <SelectValue placeholder="Chọn thời lượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 phút</SelectItem>
                      <SelectItem value="30">30 phút</SelectItem>
                      <SelectItem value="45">45 phút</SelectItem>
                      <SelectItem value="60">60 phút</SelectItem>
                      <SelectItem value="90">90 phút</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-status">Trạng thái</Label>
                <Select 
                  value={currentRoom.status}
                  onValueChange={(value: "active" | "waiting" | "completed") => 
                    setCurrentRoom({...currentRoom, status: value})
                  }
                >
                  <SelectTrigger id="edit-room-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting">Chờ bắt đầu</SelectItem>
                    <SelectItem value="active">Đang diễn ra</SelectItem>
                    <SelectItem value="completed">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-3">
                <Button 
                  variant="destructive" 
                  className="mr-auto"
                  onClick={() => confirmDeleteRoom(currentRoom.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa phòng
                </Button>
                <Button variant="outline" onClick={() => {
                  setCurrentRoom(null);
                  setShowEditRoomDialog(false);
                }}>
                  Hủy
                </Button>
                <Button onClick={handleEditRoom} disabled={!currentRoom.name || !currentRoom.topic}>
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Xác nhận thao tác
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {pendingAction?.type === 'deleteRoom' && (
              <>
                <p>Bạn có chắc chắn muốn xóa phòng này?</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tất cả sinh viên trong phòng sẽ được chuyển về danh sách chưa phân nhóm.
                </p>
              </>
            )}
            {pendingAction?.type === 'removeStudent' && (
              <>
                <p>Bạn có chắc chắn muốn xóa sinh viên này khỏi phòng?</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Sinh viên sẽ được chuyển về danh sách chưa phân nhóm.
                </p>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setShowConfirmDialog(false);
              setPendingAction(null);
            }}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (pendingAction?.type === 'deleteRoom') {
                  handleDeleteRoom(pendingAction.id);
                } else if (pendingAction?.type === 'removeStudent' && pendingAction.roomId) {
                  removeStudentFromRoom(pendingAction.id, pendingAction.roomId);
                }
              }}
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}