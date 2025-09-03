"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"

interface User {
  id: number
  name: string
  avatar?: string
  isOnline: boolean
  isLeader: boolean
}

interface BreakoutRoom {
  id: number
  name: string
  topic: string
  participants: User[]
  status: "active" | "waiting" | "closed"
  maxCapacity: number
  createdAt: Date
  lastActivity: Date
  assignedMembers: number[]
}

interface UseBreakoutRoomsReturn {
  rooms: BreakoutRoom[]
  currentRoomId: number | null
  joinRoom: (roomId: number) => Promise<boolean>
  leaveRoom: () => void
  sendMessage: (message: string) => void
  toggleMute: () => void
  toggleVideo: () => void
  shareScreen: () => void
  isRoomLeader: boolean
  waitingRequests: Array<{ id: string; userId: number; userName: string; roomId: number }>
  approveRequest: (requestId: string) => void
  rejectRequest: (requestId: string) => void
  createRoom: (name: string, topic: string, maxCapacity: number) => Promise<number>
  closeRoom: (roomId: number) => Promise<boolean>
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  error: string | null
}

export function useBreakoutRooms(): UseBreakoutRoomsReturn {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<BreakoutRoom[]>([])
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [waitingRequests, setWaitingRequests] = useState<
    Array<{ id: string; userId: number; userName: string; roomId: number }>
  >([])

  // Tạo ID ngẫu nhiên an toàn
  const generateId = () => {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  // Load rooms từ API hoặc mock data
  useEffect(() => {
    // Mock data cho demo
    const mockRooms: BreakoutRoom[] = [
      {
        id: 1,
        name: "Phòng 1",
        topic: "Thảo luận Case A: Chiến lược Coca-Cola",
        participants: [
          { id: 1, name: "Nguyễn Văn A", isOnline: true, isLeader: true },
          { id: 2, name: "Trần Thị B", isOnline: true, isLeader: false },
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
          { id: 4, name: "Phạm Thị D", isOnline: true, isLeader: true },
        ],
        status: "active",
        maxCapacity: 4,
        createdAt: new Date(),
        lastActivity: new Date(),
        assignedMembers: [4, 5],
      },
    ]

    setRooms(mockRooms)
  }, [])

  // Join room
  const joinRoom = useCallback(
    async (roomId: number): Promise<boolean> => {
      try {
        if (!user) {
          setError("Bạn cần đăng nhập để tham gia phòng")
          return false
        }

        const room = rooms.find((r) => r.id === roomId)
        if (!room) {
          setError("Không tìm thấy phòng")
          return false
        }

        if (room.participants.length >= room.maxCapacity) {
          setError("Phòng đã đầy")
          return false
        }

        const isAssignedMember = room.assignedMembers.includes(parseInt(user.id))

        // Thêm người dùng vào phòng
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  participants: [
                    ...r.participants,
                    {
                      id: parseInt(user.id),
                      name: user.name,
                      isOnline: true,
                      isLeader: r.participants.length === 0,
                    },
                  ],
                  lastActivity: new Date(),
                }
              : r
          )
        )

        setCurrentRoomId(roomId)
        return true
      } catch (err) {
        setError("Lỗi khi tham gia phòng")
        return false
      }
    },
    [rooms, user]
  )

  // Leave room
  const leaveRoom = useCallback(() => {
    if (!currentRoomId || !user) return

    setRooms((prevRooms) =>
      prevRooms.map((r) =>
        r.id === currentRoomId
          ? {
              ...r,
              participants: r.participants.filter((p) => p.id !== parseInt(user.id)),
              lastActivity: new Date(),
            }
          : r
      )
    )

    setCurrentRoomId(null)
    setIsScreenSharing(false)
  }, [currentRoomId, user])

  // Send message - mock function
  const sendMessage = useCallback((message: string) => {
    console.log(`Gửi tin nhắn đến phòng ${currentRoomId}: ${message}`)
  }, [currentRoomId])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  // Toggle video
  const toggleVideo = useCallback(() => {
    setIsVideoOn((prev) => !prev)
  }, [])

  // Share screen
  const shareScreen = useCallback(() => {
    setIsScreenSharing((prev) => !prev)
  }, [])

  // Check if current user is room leader
  const isRoomLeader = useMemo(() => {
    if (!currentRoomId || !user) return false
    
    const room = rooms.find((r) => r.id === currentRoomId)
    if (!room) return false
    
    const currentUser = room.participants.find((p) => p.id === parseInt(user.id))
    return currentUser?.isLeader || false
  }, [currentRoomId, rooms, user])

  // Approve request
  const approveRequest = useCallback((requestId: string) => {
    const request = waitingRequests.find((r) => r.id === requestId)
    if (!request) return

    // Approve the request
    setWaitingRequests((prev) => prev.filter((r) => r.id !== requestId))

    // Add the user to the room
    setRooms((prevRooms) =>
      prevRooms.map((r) =>
        r.id === request.roomId
          ? {
              ...r,
              participants: [
                ...r.participants,
                {
                  id: request.userId,
                  name: request.userName,
                  isOnline: true,
                  isLeader: false,
                },
              ],
              lastActivity: new Date(),
            }
          : r
      )
    )
  }, [waitingRequests])

  // Reject request
  const rejectRequest = useCallback((requestId: string) => {
    setWaitingRequests((prev) => prev.filter((r) => r.id !== requestId))
  }, [])

  // Create room
  const createRoom = useCallback(
    async (name: string, topic: string, maxCapacity: number): Promise<number> => {
      try {
        if (!user) {
          setError("Bạn cần đăng nhập để tạo phòng")
          return -1
        }

        const newRoomId = rooms.length + 1
        const newRoom: BreakoutRoom = {
          id: newRoomId,
          name,
          topic,
          participants: [
            {
              id: parseInt(user.id),
              name: user.name,
              isOnline: true,
              isLeader: true,
            },
          ],
          status: "active",
          maxCapacity,
          createdAt: new Date(),
          lastActivity: new Date(),
          assignedMembers: [parseInt(user.id)],
        }

        setRooms((prev) => [...prev, newRoom])
        setCurrentRoomId(newRoomId)
        return newRoomId
      } catch (err) {
        setError("Lỗi khi tạo phòng")
        return -1
      }
    },
    [rooms, user]
  )

  // Close room
  const closeRoom = useCallback(
    async (roomId: number): Promise<boolean> => {
      try {
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  status: "closed",
                  participants: [],
                  lastActivity: new Date(),
                }
              : r
          )
        )
        
        if (currentRoomId === roomId) {
          setCurrentRoomId(null)
        }
        
        return true
      } catch (err) {
        setError("Lỗi khi đóng phòng")
        return false
      }
    },
    [currentRoomId]
  )

  return {
    rooms,
    currentRoomId,
    joinRoom,
    leaveRoom,
    sendMessage,
    toggleMute,
    toggleVideo,
    shareScreen,
    isRoomLeader,
    waitingRequests,
    approveRequest,
    rejectRequest,
    createRoom,
    closeRoom,
    isMuted,
    isVideoOn,
    isScreenSharing,
    error,
  }
}