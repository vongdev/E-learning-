"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PenLine, Clock, Save, Bookmark, BookmarkPlus, Search, X, Edit } from "lucide-react"

interface Note {
  id: string
  content: string
  timestamp: number
  videoId: string
  isBookmarked: boolean
}

interface NotesSystemProps {
  videoId: string
  currentVideoTime: number
}

export function NotesSystem({ videoId, currentVideoTime }: NotesSystemProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "note1",
      content: "Bốn thành phần chính của Marketing Mix: Product, Price, Place, Promotion",
      timestamp: 245,
      videoId: "video1",
      isBookmarked: true,
    },
    {
      id: "note2",
      content: "Product (sản phẩm) là những gì doanh nghiệp cung cấp cho khách hàng",
      timestamp: 380,
      videoId: "video1",
      isBookmarked: false,
    },
  ])
  const [newNote, setNewNote] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const addNote = () => {
    if (!newNote.trim()) return
    
    const newNoteObj: Note = {
      id: `note-${Date.now()}`,
      content: newNote,
      timestamp: currentVideoTime,
      videoId,
      isBookmarked: false,
    }
    
    setNotes((prev) => [newNoteObj, ...prev])
    setNewNote("")
  }

  const toggleBookmark = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, isBookmarked: !note.isBookmarked } : note
      )
    )
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = () => {
    if (!editingNoteId) return
    
    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNoteId ? { ...note, content: editContent } : note
      )
    )
    
    setEditingNoteId(null)
    setEditContent("")
  }

  const filteredNotes = searchTerm
    ? notes.filter((note) => 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : notes

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg p-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <PenLine className="h-5 w-5" />
          Ghi chú của bạn
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Add New Note */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Thêm ghi chú tại thời điểm hiện tại..."
              className="border-blue-300"
            />
          </div>
          <Button 
            onClick={addNote} 
            className="bg-gradient-to-r from-blue-500 to-indigo-500"
            disabled={!newNote.trim()}
          >
            <PenLine className="h-4 w-4 mr-2" />
            Ghi chú
          </Button>
        </div>

        {/* Search Notes */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm ghi chú..."
            className="pl-10 border-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Notes List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border ${
                  note.isBookmarked 
                    ? "bg-yellow-50 border-yellow-300" 
                    : "bg-white border-blue-200"
                } hover:shadow-md transition-all`}
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="border-blue-300 min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-500 bg-transparent"
                        onClick={() => setEditingNoteId(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Hủy
                      </Button>
                      <Button 
                        size="sm"
                        onClick={saveEdit}
                        className="bg-blue-500"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Lưu
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200">
                        <Clock className="h-3 w-3" />
                        {formatTime(note.timestamp)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                          onClick={() => startEdit(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className={`h-7 w-7 p-0 ${note.isBookmarked ? "text-yellow-500" : "text-gray-500"}`}
                          onClick={() => toggleBookmark(note.id)}
                        >
                          {note.isBookmarked ? 
                            <Bookmark className="h-4 w-4 fill-yellow-500" /> : 
                            <BookmarkPlus className="h-4 w-4" />
                          }
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                          onClick={() => deleteNote(note.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800">{note.content}</p>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <PenLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có ghi chú nào</p>
              <p className="text-sm">Thêm ghi chú mới để lưu lại ý quan trọng</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}