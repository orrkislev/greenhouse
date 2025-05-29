import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EditableList({ items: propItems = [], onChange, onCreate }) {
  const [items, setItems] = useState(propItems)
  const [newItem, setNewItem] = useState("")
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingText, setEditingText] = useState("")

  // Sync local state with prop changes
  useEffect(() => {
    setItems(propItems)
  }, [propItems])

  const handleAdd = () => {
    if (newItem.trim()) {
      const updated = [...items, newItem.trim()]
      setItems(updated)
      setNewItem("")
      if (onChange) onChange(updated)
      if (onCreate) onCreate(newItem.trim())
    }
  }

  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
    if (onChange) onChange(updated)
  }

  const handleEdit = (index) => {
    setEditingIndex(index)
    setEditingText(items[index])
  }

  const handleEditSave = () => {
    if (editingIndex !== null) {
      const updated = [...items]
      updated[editingIndex] = editingText
      setItems(updated)
      setEditingIndex(null)
      setEditingText("")
      if (onChange) onChange(updated)
    }
  }

  return (
    <div className="space-y-1 max-w-sm text-sm">
      {items.map((item, index) => (
        <div
          key={index}
          className="group flex items-center justify-between bg-muted px-2 py-1 rounded hover:bg-muted/70"
        >
          {editingIndex === index ? (
            <Input
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSave()
              }}
              className="text-sm h-7"
              autoFocus
            />
          ) : (
            <span>{item}</span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleEdit(index)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDelete(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd()
          }}
          className="text-sm h-7"
          placeholder="New item"
        />
        <Button size="icon" className="h-7 w-7" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
