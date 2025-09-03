"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Clock, Play, FileText, HelpCircle, Check } from "lucide-react"

interface QuizCreatorProps {
  courseId?: number;
  onSave?: (quizData: any) => void;
  onCancel?: () => void;
}

export function QuizCreator({ courseId, onSave, onCancel }: QuizCreatorProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    videoId: "",
    showAtTime: 0,
    duration: 60,
    points: 10,
    questions: [
      {
        id: "1",
        text: "",
        options: [
          { id: "a", text: "", correct: false },
          { id: "b", text: "", correct: false },
          { id: "c", text: "", correct: false },
          { id: "d", text: "", correct: false },
        ],
        studyTips: [""]
      }
    ]
  })
  
  const [videos, setVideos] = useState([
    { id: "1", title: "Bài 1: Giới thiệu về Marketing", duration: "45:00" },
    { id: "2", title: "Bài 2: Nghiên cứu thị trường", duration: "38:20" },
    { id: "3", title: "Bài 3: Phân khúc thị trường", duration: "42:15" },
    { id: "4", title: "Bài 4: Định vị thương hiệu", duration: "40:10" },
    { id: "5", title: "Bài 5: Nguyên lý Marketing Cơ bản", duration: "45:00" },
  ])
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  const parseTimeToSeconds = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
  }
  
  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          id: String(Date.now()),
          text: "",
          options: [
            { id: "a", text: "", correct: false },
            { id: "b", text: "", correct: false },
            { id: "c", text: "", correct: false },
            { id: "d", text: "", correct: false },
          ],
          studyTips: [""]
        }
      ]
    })
  }
  
  const updateQuizField = (field: string, value: any) => {
    setQuiz({...quiz, [field]: value})
  }
  
  const updateQuestionField = (questionId: string, field: string, value: any) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => 
        q.id === questionId 
          ? {...q, [field]: value}
          : q
      )
    })
  }
  
  const updateOptionField = (questionId: string, optionId: string, field: string, value: any) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => 
        q.id === questionId 
          ? {
              ...q, 
              options: q.options.map(o => 
                o.id === optionId 
                  ? {...o, [field]: value}
                  : field === 'correct' && value === true 
                    ? {...o, correct: false} // Uncheck other options if this one is checked
                    : o
              )
            }
          : q
      )
    })
  }
  
  const addStudyTip = (questionId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => 
        q.id === questionId 
          ? {...q, studyTips: [...q.studyTips, ""]}
          : q
      )
    })
  }
  
  const updateStudyTip = (questionId: string, index: number, value: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => 
        q.id === questionId 
          ? {
              ...q, 
              studyTips: q.studyTips.map((tip, i) => 
                i === index ? value : tip
              )
            }
          : q
      )
    })
  }
  
  const removeStudyTip = (questionId: string, index: number) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => 
        q.id === questionId 
          ? {
              ...q, 
              studyTips: q.studyTips.filter((_, i) => i !== index)
            }
          : q
      )
    })
  }
  
  const removeQuestion = (questionId: string) => {
    if (quiz.questions.length <= 1) return; // Giữ lại ít nhất 1 câu hỏi
    
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter(q => q.id !== questionId)
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate quiz data
    if (!quiz.title || !quiz.videoId || quiz.questions.some(q => !q.text || q.options.some(o => !o.text))) {
      alert("Vui lòng điền đầy đủ thông tin quiz và câu hỏi");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Trong thực tế, gọi API để lưu quiz vào database
      console.log("Submitting quiz data:", quiz);
      
      // Giả lập API call thành công
      setTimeout(() => {
        setIsSubmitting(false);
        onSave?.(quiz);
      }, 1000);
    } catch (error) {
      console.error("Error saving quiz:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-md border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Tạo Quiz mới
        </CardTitle>
        <CardDescription>
          Tạo quiz tương tác để hiển thị trong video bài giảng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
              <TabsTrigger value="preview">Xem trước</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề Quiz <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={quiz.title}
                    onChange={(e) => updateQuizField('title', e.target.value)}
                    placeholder="VD: Quiz về 4P Marketing"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video">Video bài giảng <span className="text-red-500">*</span></Label>
                  <Select 
                    value={quiz.videoId}
                    onValueChange={(value) => updateQuizField('videoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn video" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos.map(video => (
                        <SelectItem key={video.id} value={video.id}>{video.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="showAtTime">
                    <div className="flex items-center gap-1">
                      Hiển thị tại thời điểm <span className="text-red-500">*</span>
                      <HelpCircle className="h-3 w-3 text-gray-400" />
                    </div>
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="showAtTime"
                        type="text"
                        value={formatTime(quiz.showAtTime)}
                        onChange={(e) => {
                          const seconds = parseTimeToSeconds(e.target.value);
                          if (!isNaN(seconds)) {
                            updateQuizField('showAtTime', seconds);
                          }
                        }}
                        placeholder="MM:SS"
                        className="pl-10"
                      />
                    </div>
                    <span className="text-gray-500">phút:giây</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Thời gian làm bài (giây)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={quiz.duration}
                    onChange={(e) => updateQuizField('duration', Number(e.target.value))}
                    min={10}
                    max={300}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả quiz</Label>
                <Textarea
                  id="description"
                  value={quiz.description}
                  onChange={(e) => updateQuizField('description', e.target.value)}
                  placeholder="Mô tả ngắn gọn về nội dung quiz..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="points">Điểm thưởng khi trả lời đúng</Label>
                <Input
                  id="points"
                  type="number"
                  value={quiz.points}
                  onChange={(e) => updateQuizField('points', Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-20"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  Tiếp theo
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-6">
              {quiz.questions.map((question, qIndex) => (
                <Card key={question.id} className="border border-gray-200">
                  <CardHeader className="bg-slate-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Câu hỏi {qIndex + 1}</CardTitle>
                      {quiz.questions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="h-8 w-8 p-0 text-red-500 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}`}>
                        Nội dung câu hỏi <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`question-${question.id}`}
                        value={question.text}
                        onChange={(e) => updateQuestionField(question.id, 'text', e.target.value)}
                        placeholder="Nhập câu hỏi..."
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Các lựa chọn (chọn đáp án đúng) <span className="text-red-500">*</span></Label>
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`option-${question.id}-${option.id}`}
                            checked={option.correct}
                            onCheckedChange={(checked: boolean) => 
                              updateOptionField(question.id, option.id, 'correct', checked)
                            }
                          />
                          <div className="flex-1">
                            <Input
                              value={option.text}
                              onChange={(e) => updateOptionField(question.id, option.id, 'text', e.target.value)}
                              placeholder={`Lựa chọn ${option.id.toUpperCase()}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Gợi ý học tập (hiển thị khi trả lời)</Label>
                      {question.studyTips.map((tip, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={tip}
                            onChange={(e) => updateStudyTip(question.id, index, e.target.value)}
                            placeholder="Thêm gợi ý học tập..."
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeStudyTip(question.id, index)}
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addStudyTip(question.id)}
                        className="mt-2 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm gợi ý
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </div>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                >
                  Quay lại
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    Xem trước
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Xem trước Quiz</CardTitle>
                  <CardDescription>
                    Kiểm tra lại thông tin quiz trước khi lưu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Tiêu đề</p>
                      <p className="font-semibold">{quiz.title || "Chưa có tiêu đề"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Video</p>
                      <p className="font-semibold">
                        {videos.find(v => v.id === quiz.videoId)?.title || "Chưa chọn video"}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Hiển thị tại</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatTime(quiz.showAtTime)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Thời gian làm bài</p>
                      <p className="font-semibold">{quiz.duration} giây</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Mô tả</p>
                    <p>{quiz.description || "Không có mô tả"}</p>
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    <p className="text-base font-semibold">Câu hỏi ({quiz.questions.length})</p>
                    
                    {quiz.questions.map((question, qIndex) => (
                      <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                        <p className="font-medium mb-2">
                          {qIndex + 1}. {question.text || "Chưa có nội dung câu hỏi"}
                        </p>
                        
                        <div className="space-y-2 ml-5">
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                option.correct ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                              }`}>
                                {option.correct && <Check className="h-3 w-3" />}
                              </div>
                              <span>{option.text || `Lựa chọn ${option.id.toUpperCase()} (trống)`}</span>
                            </div>
                          ))}
                        </div>
                        
                        {question.studyTips.some(tip => tip.trim()) && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-medium text-gray-500 mb-1">Gợi ý học tập:</p>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {question.studyTips.filter(tip => tip.trim()).map((tip, index) => (
                                <li key={index}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("questions")}
                >
                  Quay lại
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>Lưu Quiz</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  )
}