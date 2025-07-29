"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, BookOpen } from "lucide-react"
import { useResearch } from "./Research"

export default function CompletionStage() {
  const research = useResearch(state => state.research);
  const [summary, setSummary] = useState(research.completion.summary)
  const [googleDocUrl, setGoogleDocUrl] = useState(research.completion.googleDocUrl)
  const updateResearch = useResearch(state => state.updateResearch);


  const handleSummaryChange = (value) => {
    setSummary(value)
    updateResearch({ summary: value, googleDocUrl })
  }

  const handleGoogleDocChange = (value) => {
    setGoogleDocUrl(value)
    updateResearch({ summary, googleDocUrl: value })
  }

  const totalSources = research.sources.length
  const totalMaterials = research.sources.reduce((acc, source) => acc + source.materials.length, 0)
  const totalNotes = research.sources.reduce(
    (acc, source) => acc + source.materials.reduce((matAcc, material) => matAcc + material.notes.length, 0),
    0,
  )
  const totalQuotes = research.sources.reduce(
    (acc, source) =>
      acc +
      source.materials.reduce(
        (matAcc, material) => matAcc + material.notes.filter((note) => note.type === "quote").length,
        0,
      ),
    0,
  )

  const createGoogleDoc = () => {
    const docTitle = encodeURIComponent(`Research: ${research.foundation.topic}`)
    const googleDocsUrl = `https://docs.google.com/document/create?title=${docTitle}`
    window.open(googleDocsUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>סיום החקר</CardTitle>
          <CardDescription>סכם את החקר שלך וצור את הפתק הסופי שלך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Research Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              תקציר החקר
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">שדה החקר</p>
                <p className="font-medium">{research.foundation.field}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">נושא החקר</p>
                <p className="font-medium">{research.foundation.topic}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">שאלת החקר</p>
              <p className="font-medium italic">&quot;{research.foundation.question}&quot;</p>
            </div>
          </div>

          {/* Research Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalSources}</div>
              <div className="text-sm text-blue-800">מקורות</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalMaterials}</div>
              <div className="text-sm text-green-800">חומרים</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalNotes - totalQuotes}</div>
              <div className="text-sm text-purple-800">פתקים</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{totalQuotes}</div>
              <div className="text-sm text-yellow-800">ציטוטים</div>
            </div>
          </div>

          {/* Research Summary */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="summary">תקציר החקר</Label>
              <p className="text-sm text-gray-500 mb-2">
                כתוב תקציר קצר של המצאות והמסקנות של החקר
              </p>
              <Textarea
                id="summary"
                placeholder="סכם את המצאות שלך, המסקנות והמסקנות..."
                value={summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={6}
              />
            </div>

            {/* Google Docs Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="google-doc">פתק סופי (Google Docs)</Label>
                  <p className="text-sm text-gray-500">צור או קשר אל הפתק הסופי שלך</p>
                </div>
                <Button onClick={createGoogleDoc} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  צור מסמך חדש
                </Button>
              </div>

              <Input
                id="google-doc"
                placeholder="הדבק את קישור הפתק הסופי שלך כאן..."
                value={googleDocUrl}
                onChange={(e) => handleGoogleDocChange(e.target.value)}
              />

              {googleDocUrl && (
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href={googleDocUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    פתק סופי
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Sources Summary */}
          {totalSources > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">מקורות שנעשו שימוש</h3>
              <div className="space-y-3">
                {research.sources.map((source) => (
                  <div key={source.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{source.title}</h4>
                        <p className="text-xs text-gray-600">by {source.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {source.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {source.materials.length} חומרים
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {source.materials.reduce((acc, m) => acc + m.notes.length, 0)} פתקים
                          </Badge>
                        </div>
                      </div>
                      {source.url && (
                        <Button asChild variant="ghost" size="sm">
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {summary && googleDocUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">החקר הושלם! 🎉</h4>
          <p className="text-sm text-green-700">
            מזל טוב! תוכל להמשיך ולסכם את החקר שלך.
          </p>
        </div>
      )}
    </div>
  )
}
