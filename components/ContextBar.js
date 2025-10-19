'use client'

import { tw } from "@/utils/tw"
import { ChevronRight } from "lucide-react"
import React, { useMemo, useState } from "react"

// Main ContextBar component that handles ALL animations
export default function ContextBar({ name, children, initialOpen = true }) {
    const [isOpen, setIsOpen] = useState(initialOpen)

    return (
        <div className={`mt-2 p-2 flex flex-col bg-white transition-all duration-500  border border-gray-200 rounded-tr-lg ${isOpen ? 'min-w-64 w-64' : 'min-w-12 w-12'
            }`}>
            {/* Header with toggle button */}
            <div className="flex items-center justify-start mb-2">
                <div className={`font-medium text-gray-700 transition-all duration-500 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                    {name}
                </div>
                <button
                    className={`p-1 hover:bg-gray-100 rounded-full transition-all duration-500 cursor-pointer flex-shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Content area with all animation logic contained here */}
            <div className={`flex-1 overflow-x-hidden transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}>
                <div className={`overflow-y-auto h-full transition-all duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-2'
                    }`}>
                    {/* Children are rendered as-is, no animation props passed */}
                    {children}
                </div>
            </div>
        </div>
    )
}

export const PageMain = tw`flex-1 h-screen pt-8 px-4 pb-16 overflow-y-auto relative`

const pasterColors = ["#797d62","#9b9b7a","#d9ae94","#f1dca7","#ffcb69","#d08c60","#997b66"]
export const BGGrads = ({ ammount = 20, opacity = 0.2 }) => {

    const circles = useMemo(() => Array(ammount).fill(0).map((_, index) => (
        <div key={index} className="absolute rounded-full" style={{
            top: Math.random() * 100 + '%',
            left: Math.random() * 90 + '%',
            width: Math.random() * 10 + 10 + '%',
            height: Math.random() * 10 + 10 + '%',
            opacity: Math.random() * 100 * opacity,
            background: pasterColors[Math.floor(Math.random() * pasterColors.length)],
        }} />
    )), []);

    return (
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ filter: 'blur(100px) contrast(5) saturate(3)' }}>
            {circles}
        </div>
    )
}