import { tw } from "@/utils/tw"
import { ChevronRight } from "lucide-react"
import React, { useState } from "react"

// Main ContextBar component that handles ALL animations
export default function ContextBar({ name, children }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className={`m-4 p-2 flex flex-col bg-white transition-all duration-500 border border-gray-200 rounded-lg ${isOpen ? 'min-w-64 w-64' : 'min-w-12 w-12'
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
            <div className={`flex-1 overflow-x-hidden transition-all duration-500 ${isOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
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

export const PageMain = tw`flex-1 h-screen pt-8 px-4 pb-16 overflow-y-auto`