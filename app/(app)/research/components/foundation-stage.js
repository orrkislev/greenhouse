"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useResearch } from "./Research"


const researchFields = [
  "Computer Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Psychology",
  "Sociology",
  "History",
  "Literature",
  "Economics",
  "Political Science",
  "Philosophy",
  "Education",
  "Medicine",
  "Engineering",
  "Other",
]

export default function FoundationStage() {
  const research = useResearch(state => state.research);
  const updateResearch = useResearch(state => state.updateResearch);
  const [formData, setFormData] = useState(research.foundation)

  const handleChange = (field, value) => {
    const newData = {
      ...formData,
      [field]: value,
    }
    setFormData(newData)
    updateResearch({ foundation: newData })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">הגדרת החקר</CardTitle>
        <CardDescription>הגדר את שדה החקר, נושא החקר והצג את השאלה שאתה מנסה לענות באמצעות החקר</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="field">שדה החקר</Label>
            <Select value={formData.field} onValueChange={(value) => handleChange("field", value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר את שדה החקר שלך" />
              </SelectTrigger>
              <SelectContent>
                {researchFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">נושא החקר</Label>
            <Input
              id="topic"
              placeholder="למשל, מכונות למידה ברפואה"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">שאלת החקר</Label>
          <Textarea
            id="question"
            placeholder="מה מדויקת השאלה שאתה מנסה לענות באמצעות החקר?"
            value={formData.question}
            onChange={(e) => handleChange("question", e.target.value)}
            rows={4}
          />
          <p className="text-sm text-gray-500">
            שאלה טובה בחקר היא מדויקת, מדידה וניתנת לעניין באמצעות החקר.
          </p>
        </div>

        {formData.field && formData.topic && formData.question && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">בסיס החקר מוגדר! ✓</h4>
            <p className="text-sm text-green-700">
              אתה מגדיר את בסיס החקר שלך. תוכל להמשיך ולאחזר מקורות וחומרים.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
