"use client"

import { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Users, 
  Send, 
  Loader2, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/toast'

interface Message {
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface Participant {
  userId: string;
  name: string;
  isOnline: boolean;
  isLeader: boolean;
  joinedAt: string;
}

interface Room {
  _id: string;
  name: string;
  topic: string;
  status: 'active' | 'waiting' | 'closed';
  maxCapacity: number;
  participants: Participant[];
  createdAt: string;
  lastActivity: string;
}

interface CourseDiscussionsProps {
  courseId: string;
}

export default function CourseDiscussions({ courseId }: CourseDiscussionsProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      fetchRooms()
    }
  }, [courseId])

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom._id)
    }
  }, [activeRoom])

  useEffect(() => {
    // Scroll xuống tin nhắn mới nhất
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch breakout rooms from API
      const response = await fetch(`/api/courses/${courseId}/breakout-rooms`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải danh sách phòng thảo luận')
      }
      
      setRooms(data.data)
      
      // Nếu có phòng, chọn phòng đầu tiên làm phòng active
      if (data.data.length > 0) {
        setActiveRoom(data.data[0])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setError('Không thể tải danh sách phòng thảo luận. Vui lòng thử lại sau.')
      
      // Fallback to demo data if API fails
      const demoRooms = [
        {
          _id: '1',
          name: 'Phòng thảo luận chung',
          topic: 'Thảo luận chung về khóa học',
          status: 'active' as const,
          maxCapacity: 20,
          participants: [
            {
              userId: '1',
              name: 'Giảng viên',
              isOnline: true,
              isLeader: true,
              joinedAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
      ]
      setRooms(demoRooms)
      setActiveRoom(demoRooms[0])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      setLoadingMessages(true)
      
      // Fetch messages from API
      const response = await fetch(`/api/breakout-rooms/${roomId}/messages`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải tin nhắn')
      }
      
      setMessages(data.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      
      // Fallback to empty messages if API fails
      setMessages([])
      
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể tải tin nhắn. Vui lòng thử lại sau.",
        variant: "destructive"
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeRoom || !user) return
    
    try {
      // Send message to API
      const response = await fetch(`/api/breakout-rooms/${activeRoom._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageText }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể gửi tin nhắn')
      }
      
      // Thêm tin nhắn vào danh sách hiện tại (optimistic update)
      setMessages([
        ...messages,
        {
          userId: user.id,
          userName: user.name || 'Bạn',
          content: messageText,
          timestamp: new Date().toISOString()
        }
      ])
      
      // Clear input
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
        variant: "destructive"
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const joinRoom = async (roomId: string) => {
    if (!user) return
    
    try {
      // Call API to join room
      const response = await fetch(`/api/breakout-rooms/${roomId}/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể tham gia phòng')
      }
      
      const data = await response.json()
      
      // Update room list
      setRooms(rooms.map(room => 
        room._id === roomId ? data.data : room
      ))
      
      // Update active room if current room
      if (activeRoom?._id === roomId) {
        setActiveRoom(data.data)
      }
      
      toast({
        title: "Tham gia thành công",
        description: "Bạn đã tham gia vào phòng thảo luận",
      })
    } catch (error) {
      console.error('Error joining room:', error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể tham gia phòng. Vui lòng thử lại sau.",
        variant: "destructive"
      })
    }
  }

  const leaveRoom = async (roomId: string) => {
    if (!user) return
    
    try {
      // Call API to leave room
      const response = await fetch(`/api/breakout-rooms/${roomId}/leave`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể rời khỏi phòng')
      }
      
      const data = await response.json()
      
      // Update room list
      setRooms(rooms.map(room => 
        room._id === roomId ? data.data : room
      ))
      
      // Update active room if current room
      if (activeRoom?._id === roomId) {
        setActiveRoom(data.data)
      }
      
      toast({
        title: "Rời phòng thành công",
        description: "Bạn đã rời khỏi phòng thảo luận",
      })
    } catch (error) {
      console.error('Error leaving room:', error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể rời phòng. Vui lòng thử lại sau.",
        variant: "destructive"
      })
    }
  }

  // Kiểm tra xem user hiện tại có trong phòng không
  const isInRoom = (room: Room) => {
    if (!user) return false
    return room.participants.some(p => p.userId === user.id)
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Đang tải phòng thảo luận...</p>
        </div>
      </div>
    )
  }

  if (error && rooms.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={fetchRooms}
            variant="outline" 
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có phòng thảo luận</h3>
        <p className="text-gray-500 mb-4">
          Giảng viên chưa tạo phòng thảo luận nào cho khóa học này.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      {/* Danh sách phòng */}
      <div className="w-full md:w-1/3 md:max-w-xs">
        <Card className="h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Phòng thảo luận</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {rooms.map((room) => {
                const isActive = activeRoom && activeRoom._id === room._id
                const userInRoom = isInRoom(room)
                
                return (
                  <div 
                    key={room._id} 
                    onClick={() => setActiveRoom(room)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      isActive ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{room.name}</h3>
                        {room.topic && (
                          <p className="text-sm text-gray-500 mt-1">{room.topic}</p>
                        )}
                      </div>
                      
                      <Badge className="bg-blue-500">
                        {room.participants.length} / {room.maxCapacity}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {format(new Date(room.lastActivity), 'dd/MM HH:mm', { locale: vi })}
                        </span>
                      </div>
                      
                      {userInRoom ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            leaveRoom(room._id)
                          }}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Rời phòng
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            joinRoom(room._id)
                          }}
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          Tham gia
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Khu vực chat */}
      <div className="w-full md:w-2/3 flex-1">
        <Card className="h-full flex flex-col">
          {!activeRoom ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Chọn một phòng để bắt đầu thảo luận</h3>
              <p className="text-gray-500">
                Hãy chọn một phòng thảo luận từ danh sách bên trái để bắt đầu trò chuyện.
              </p>
            </div>
          ) : (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{activeRoom.name}</CardTitle>
                    {activeRoom.topic && (
                      <p className="text-sm text-gray-500 mt-1">{activeRoom.topic}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{activeRoom.participants.length}</span>
                    </Badge>
                    
                    {isInRoom(activeRoom) ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => leaveRoom(activeRoom._id)}
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Rời phòng
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => joinRoom(activeRoom._id)}
                      >
                        <LogIn className="h-3 w-3 mr-1" />
                        Tham gia
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
                    <span>Đang tải tin nhắn...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <MessageSquare className="h-10 w-10 text-gray-400 mb-4" />
                    <h3 className="text-base font-medium text-gray-800 mb-2">Chưa có tin nhắn</h3>
                    <p className="text-gray-500">
                      Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isCurrentUser = user && message.userId === user.id
                      const avatarText = message.userName.substring(0, 2).toUpperCase()
                      const messageDate = new Date(message.timestamp)
                      
                      return (
                        <div 
                          key={index}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.userName)}`} />
                                <AvatarFallback>{avatarText}</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div>
                              <div className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div 
                                  className={`px-3 py-2 rounded-lg ${
                                    isCurrentUser 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {!isCurrentUser && (
                                    <div className="text-xs font-medium mb-1">{message.userName}</div>
                                  )}
                                  <div className="break-words">{message.content}</div>
                                </div>
                              </div>
                              
                              <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                {format(messageDate, 'HH:mm', { locale: vi })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              
              <div className="p-4 border-t">
                {isInRoom(activeRoom) ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => joinRoom(activeRoom._id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Tham gia phòng để gửi tin nhắn
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}