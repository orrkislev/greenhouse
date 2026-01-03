'use client'
import Button, { IconButton } from '@/components/Button'
import { supabase } from '@/utils/supabase/client'
import { Coins, Earth, Heart, Save, Star, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/utils/store/useUser'
import { toastsActions } from '@/utils/store/useToasts'

export default function Ikigai({ data, onSave }) {
    const originalUser = useUser(state => state.originalUser)
    const [markers, setMarkers] = useState(data?.ikigai?.markers || [])
    const [editingId, setEditingId] = useState(null)
    const containerRef = useRef(null)

    useEffect(() => {
        setMarkers(data?.ikigai?.markers || [])
    }, [data])

    const handleAddMarker = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('.marker')) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        const newMarker = {
            id: Date.now(),
            x,
            y,
            label: ''
        }

        const newMarkers = [...markers, newMarker]
        setMarkers(newMarkers)
        setEditingId(newMarker.id)
    }

    const handleDragMarker = (id, e) => {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        const newMarkers = markers.map(m =>
            m.id === id ? { ...m, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : m
        )
        setMarkers(newMarkers)
    }

    const handleLabelChange = (id, label) => {
        const newMarkers = markers.map(m => m.id === id ? { ...m, label } : m)
        setMarkers(newMarkers)
    }

    const handleDeleteMarker = (id) => {
        const newMarkers = markers.filter(m => m.id !== id)
        setMarkers(newMarkers)
    }

    const handleSave = async () => {
        if (originalUser) onSave?.({ markers })
        else {
            const { error } = await supabase.rpc('update_student_ikigai', { new_ikigai: { markers } })
            if (error) toastsActions.addFromError(error)
        }
        setEditingId(null)
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-start relative">
            <div className="absolute top-2 right-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">איקיגאי מחצית א</h2>
                <p className="text-gray-600">לחץ בכל מקום כדי להוסיף סמן חדש</p>
            </div>

            <div
                ref={containerRef}
                onClick={handleAddMarker}
                className="relative h-[40vw] aspect-square cursor-crosshair select-none"
            >

                {/* Circles */}
                <div className="absolute top-1/2 left-1/2 translate-y-[-10vw] translate-x-[10vw] ">
                    <div className="absolute w-[20vw] h-[20vw] flex items-center justify-center rounded-full bg-[#7DD3FC99] translate-x-[-40%] p-4">
                        <Star className="w-10 h-10 text-gray-800 -translate-x-1/1" />
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 translate-y-[-10vw] translate-x-[10vw] ">
                    <div className="absolute w-[20vw] h-[20vw] flex items-center justify-center rounded-full bg-[#86EFAC99] translate-x-[40%] p-4">
                        <Earth className="w-10 h-10 text-gray-800 translate-x-1/1" />
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 translate-y-[-10vw] translate-x-[10vw] ">
                    <div className="absolute w-[20vw] h-[20vw] flex items-center justify-center rounded-full bg-[#FDE04799] translate-y-[40%] p-12">
                        <Coins className="w-10 h-10 text-gray-800 translate-y-1/1" />
                    </div>
                </div>

                <div className="absolute top-1/2 right-1/2 translate-y-[-10vw] translate-x-[10vw] ">
                    <div className="absolute w-[20vw] h-[20vw] flex items-center justify-center rounded-full bg-[#F9A8D499] translate-y-[-40%] p-12">
                        <Heart className="w-10 h-10 text-gray-800 -translate-y-1/1" />
                    </div>
                </div>

                {/* Center Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-2xl font-bold text-gray-800">איקיגאי</div>
                    <div className="text-xs text-gray-600">生き甲斐</div>
                </div>

                {/* Markers */}
                {markers.map(marker => (
                    <div
                        key={marker.id}
                        className="marker absolute"
                        style={{
                            left: `${marker.x}%`,
                            top: `${marker.y}%`,
                        }}
                    >
                        <div className="group flex flex-col items-center justify-center -translate-x-1/2">
                            {/* Label */}
                            <div className="min-w-[120px]">
                                {editingId === marker.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={marker.label}
                                        onChange={(e) => handleLabelChange(marker.id, e.target.value)}
                                        onBlur={() => setEditingId(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setEditingId(null)
                                            if (e.key === 'Escape') setEditingId(null)
                                        }}
                                        placeholder="הכנס טקסט..."
                                        className="w-full px-2 py-1 text-sm text-center bg-white border-2 border-purple-400 rounded shadow-lg focus:outline-none focus:border-purple-600"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingId(marker.id)
                                        }}
                                        className="px-3 py-1 text-sm text-center bg-white/95 rounded-lg shadow-lg cursor-text hover:bg-white transition-all border border-purple-200 text-nowrap"
                                    >
                                        {marker.label || 'לחץ לעריכה'}
                                    </div>
                                )}
                            </div>

                            <div
                                draggable
                                onDragEnd={(e) => handleDragMarker(marker.id, e)}
                                className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full cursor-move border-2 border-white hover:scale-125 transition-transform"
                            />

                            {/* Delete Button */}
                            <IconButton small icon={X}
                                className="absolute -top-2 -right-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteMarker(marker.id)
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 mb-4" >
                <p>גרור סמנים כדי לשנות את מיקומם • לחץ על הטקסט כדי לערוך • מעבר עם העכבר כדי למחוק</p>
            </div>

            <Button data-role="save" onClick={handleSave}>
                <Save className="w-4 h-4" />
                שמור
            </Button>
        </div>
    )
}
