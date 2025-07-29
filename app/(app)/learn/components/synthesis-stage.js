"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, Quote, StickyNote } from "lucide-react"
import { useResearch } from "./Research"

export default function SynthesisStage() {
  const research = useResearch(state => state.research);
  const updateResearch = useResearch(state => state.updateResearch);
  const [sources, setSources] = useState(research.sources)
  const [isAddingNote, setIsAddingNote] = useState(null)
  const [newNote, setNewNote] = useState({ content: "", type: "note", page: "" })

  const updateSources = (newSources) => {
    setSources(newSources)
    updateResearch({ sources: newSources })
  }

  const addNote = (sourceId, materialId) => {
    if (newNote.content) {
      const updatedSources = sources.map((source) => {
        if (source.id === sourceId) {
          return {
            ...source,
            materials: source.materials.map((material) => {
              if (material.id === materialId) {
                return {
                  ...material,
                  notes: [
                    ...material.notes,
                    {
                      id: Date.now().toString(),
                      ...newNote,
                    },
                  ],
                }
              }
              return material
            }),
          }
        }
        return source
      })
      updateSources(updatedSources)
      setNewNote({ content: "", type: "note", page: "" })
      setIsAddingNote(null)
    }
  }

  const deleteNote = (sourceId, materialId, noteId) => {
    const updatedSources = sources.map((source) => {
      if (source.id === sourceId) {
        return {
          ...source,
          materials: source.materials.map((material) => {
            if (material.id === materialId) {
              return {
                ...material,
                notes: material.notes.filter((n) => n.id !== noteId),
              }
            }
            return material
          }),
        }
      }
      return source
    })
    updateSources(updatedSources)
  }

  const materialsWithSources = sources
    .flatMap((source) =>
      source.materials.map((material) => ({
        ...material,
        source,
      })),
    )
    .filter((item) => item.materials !== undefined)

  const totalNotes = sources.reduce(
    (acc, source) => acc + source.materials.reduce((matAcc, material) => matAcc + material.notes.length, 0),
    0,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>הסכם החקר</CardTitle>
          <CardDescription>
            הוסף פתקים וציטוטים מהחומרים שלך כדי לנתח ולסכם את החקר שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materialsWithSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>אין חומרים זמינים. יש להוסיף מקורות וחומרים בשלב האחזור קודם.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
                  <div className="text-sm text-blue-800">מקורות</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{materialsWithSources.length}</div>
                  <div className="text-sm text-blue-800">חומרים</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalNotes}</div>
                  <div className="text-sm text-blue-800">פתקים וציטוטים</div>
                </div>
              </div>

              {sources.map((source) => (
                <Card key={source.id} className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{source.title}</CardTitle>
                    <CardDescription>by {source.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {source.materials.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">אין חומרים במקור זה</p>
                    ) : (
                      <div className="space-y-4">
                        {source.materials.map((material) => (
                          <div key={material.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{material.title}</h4>
                                <p className="text-sm text-gray-600">{material.description}</p>
                              </div>
                              <Dialog
                                open={isAddingNote?.sourceId === source.id && isAddingNote?.materialId === material.id}
                                onOpenChange={(open) =>
                                  setIsAddingNote(open ? { sourceId: source.id, materialId: material.id } : null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Plus className="h-3 w-3 mr-1" />
                                    הוסף פתק
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>הוסף פתק או ציטוט</DialogTitle>
                                    <DialogDescription>הוסף פתק או ציטוט מ&quot;{material.title}&quot;</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="note-type">סוג</Label>
                                      <Select
                                        value={newNote.type}
                                        onValueChange={(value) =>
                                          setNewNote((prev) => ({ ...prev, type: value }))
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="note">פתק אישי</SelectItem>
                                          <SelectItem value="quote">ציטוט ישיר</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="note-content">תוכן</Label>
                                      <Textarea
                                        id="note-content"
                                        placeholder={
                                          newNote.type === "quote"
                                            ? "Enter the exact quote..."
                                            : "Enter your note or analysis..."
                                        }
                                        value={newNote.content}
                                        onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="note-page">Page/Location (optional)</Label>
                                      <Input
                                        id="note-page"
                                        placeholder="e.g., p. 42, Section 3.1"
                                        value={newNote.page}
                                        onChange={(e) => setNewNote((prev) => ({ ...prev, page: e.target.value }))}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddingNote(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => addNote(source.id, material.id)}>
                                      Add {newNote.type === "quote" ? "Quote" : "Note"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>

                            {material.notes.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">אין פתקים נוספים</p>
                            ) : (
                              <div className="space-y-3">
                                {material.notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className={`p-3 rounded-lg border-l-4 ${note.type === "quote"
                                      ? "bg-yellow-50 border-l-yellow-400"
                                      : "bg-blue-50 border-l-blue-400"
                                      }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          {note.type === "quote" ? (
                                            <Quote className="h-4 w-4 text-yellow-600" />
                                          ) : (
                                            <StickyNote className="h-4 w-4 text-blue-600" />
                                          )}
                                          <Badge variant={note.type === "quote" ? "default" : "secondary"}>
                                            {note.type === "quote" ? "ציטוט" : "פתק"}
                                          </Badge>
                                          {note.page && (
                                            <Badge variant="outline" className="text-xs">
                                              {note.page}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm">{note.content}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteNote(source.id, material.id, note.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalNotes > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">המעקב בהסכם ✓</h4>
          <p className="text-sm text-green-700">
            מעולה! יש לך {totalNotes} פתקים וציטוטים מהחומרים שלך. תוכל להמשיך ולסכם את החקר שלך.
          </p>
        </div>
      )}
    </div>
  )
}
