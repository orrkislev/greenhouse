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
import { Plus, Trash2, FileText, LinkIcon } from "lucide-react"
import { useResearch } from "./Research"

const sourceTypes = ["Academic Paper", "Book", "Journal Article", "Website", "News Article", "Report", "Thesis", "Conference Paper", "Other"]

export default function CollectionStage() {
    const research = useResearch(state => state.research);
    const updateResearch = useResearch(state => state.updateResearch);
    const [sources, setSources] = useState(research.sources)
    const [isAddingSource, setIsAddingSource] = useState(false)
    const [isAddingMaterial, setIsAddingMaterial] = useState(null)
    const [newSource, setNewSource] = useState({
        author: "",
        title: "",
        type: "",
        url: "",
    })
    const [newMaterial, setNewMaterial] = useState({
        title: "",
        description: "",
    })

    const updateSources = (newSources) => {
        setSources(newSources)
        updateResearch({ sources: newSources })
    }

    const addSource = () => {
        if (newSource.author && newSource.title && newSource.type) {
            const source = {
                id: Date.now().toString(),
                ...newSource,
                materials: [],
            }
            updateSources([...sources, source])
            setNewSource({ author: "", title: "", type: "", url: "" })
            setIsAddingSource(false)
        }
    }

    const deleteSource = (sourceId) => {
        updateSources(sources.filter((s) => s.id !== sourceId))
    }

    const addMaterial = (sourceId) => {
        if (newMaterial.title && newMaterial.description) {
            const updatedSources = sources.map((source) => {
                if (source.id === sourceId) {
                    return {
                        ...source,
                        materials: [
                            ...source.materials,
                            {
                                id: Date.now().toString(),
                                ...newMaterial,
                                notes: [],
                            },
                        ],
                    }
                }
                return source
            })
            updateSources(updatedSources)
            setNewMaterial({ title: "", description: "" })
            setIsAddingMaterial(null)
        }
    }

    const deleteMaterial = (sourceId, materialId) => {
        const updatedSources = sources.map((source) => {
            if (source.id === sourceId) {
                return {
                    ...source,
                    materials: source.materials.filter((m) => m.id !== materialId),
                }
            }
            return source
        })
        updateSources(updatedSources)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        אחזור מקורות וחומרים
                        <Dialog open={isAddingSource} onOpenChange={setIsAddingSource}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    הוסף מקור
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>הוסף מקור חדש</DialogTitle>
                                    <DialogDescription>הוסף מקור שתשתמש בו בחקר שלך</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="author">מחבר</Label>
                                        <Input
                                            id="author"
                                            placeholder="שם המחבר"
                                            value={newSource.author}
                                            onChange={(e) => setNewSource((prev) => ({ ...prev, author: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">כותרת</Label>
                                        <Input
                                            id="title"
                                            placeholder="כותרת המקור"
                                            value={newSource.title}
                                            onChange={(e) => setNewSource((prev) => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">סוג</Label>
                                        <Select
                                            value={newSource.type}
                                            onValueChange={(value) => setNewSource((prev) => ({ ...prev, type: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="בחר סוג מקור" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sourceTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url">URL (אופציונלי)</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://..."
                                            value={newSource.url}
                                            onChange={(e) => setNewSource((prev) => ({ ...prev, url: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddingSource(false)}>
                                        ביטול
                                    </Button>
                                    <Button onClick={addSource}>הוסף מקור</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardTitle>
                    <CardDescription>אחזור מקורות וחומרים לחקר שלך</CardDescription>
                </CardHeader>
                <CardContent>
                    {sources.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>אין מקורות נוספים. יש ללחוץ על &quot;הוסף מקור&quot; כדי להתחיל.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sources.map((source) => (
                                <Card key={source.id} className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{source.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    by {source.author} • <Badge variant="secondary">{source.type}</Badge>
                                                </CardDescription>
                                                {source.url && (
                                                    <a
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                                                    >
                                                        <LinkIcon className="h-3 w-3" />
                                                        צפה במקור
                                                    </a>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteSource(source.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">חומרים ({source.materials.length})</h4>
                                                <Dialog
                                                    open={isAddingMaterial === source.id}
                                                    onOpenChange={(open) => setIsAddingMaterial(open ? source.id : null)}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            הוסף חומר
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>הוסף חומר</DialogTitle>
                                                            <DialogDescription>הוסף חומר מ&quot;{source.title}&quot;</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="material-title">כותרת החומר</Label>
                                                                <Input
                                                                    id="material-title"
                                                                    placeholder="למשל, פרק 3, פסקה 2.1"
                                                                    value={newMaterial.title}
                                                                    onChange={(e) => setNewMaterial((prev) => ({ ...prev, title: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="material-description">תיאור</Label>
                                                                <Textarea
                                                                    id="material-description"
                                                                    placeholder="תיאור קצר של החומר"
                                                                    value={newMaterial.description}
                                                                    onChange={(e) => setNewMaterial((prev) => ({ ...prev, description: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsAddingMaterial(null)}>
                                                                ביטול
                                                            </Button>
                                                            <Button onClick={() => addMaterial(source.id)}>הוסף חומר</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            {source.materials.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">אין חומרים נוספים</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {source.materials.map((material) => (
                                                        <div
                                                            key={material.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                        >
                                                            <div>
                                                                <h5 className="font-medium text-sm">{material.title}</h5>
                                                                <p className="text-xs text-gray-600">{material.description}</p>
                                                                <Badge variant="outline" className="mt-1 text-xs">
                                                                    {material.notes.length} פתקים
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteMaterial(source.id, material.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {sources.length > 0 && sources.some((s) => s.materials.length > 0) && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">המעקב באחזור ✓</h4>
                    <p className="text-sm text-green-700">
                        מעולה! יש לך {sources.length} מקורות עם {sources.reduce((acc, s) => acc + s.materials.length, 0)}{" "}
                        חומרים. תוכל להמשיך ולהוסיף פתקים וציטוטים.
                    </p>
                </div>
            )}
        </div>
    )
}
