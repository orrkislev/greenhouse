"use client"

import { useState } from "react"
import { BookOpen, NotebookTabs } from "lucide-react"
import { useUser } from "@/utils/store/useUser"
import JournalNew from "./JournalNew"
import Journal from "./Journal"
import { tw } from "@/utils/tw"

export default function JournalHandle() {
    const originalUser = useUser(state => state.originalUser);

    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const [rotation, setRotation] = useState(0)

    const handleMouseMove = (e) => {
        setRotation(-(e.clientX - window.innerWidth / 2) / 50)
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-xs transition-all duration-500 ease-out ${isOpen ? "opacity-100 pointer-events-auto z-40" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => {
                    setIsHovered(false)
                    setIsOpen(false)
                }}
            />

            <div
                className={`fixed overflow-y-hidden max-h-[80vh] left-1/2 -translate-x-1/2 w-full max-w-2xl transition-all duration-700 z-50 ${isOpen
                    ? "bottom-[50%] translate-y-1/2 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    : isHovered
                        ? `translate-y-[calc(100%-80px)] ease-out delay-50 ${originalUser ? 'bottom-16' : 'bottom-0'}`
                        : `translate-y-[calc(100%-40px)] ease-out ${originalUser ? 'bottom-16' : 'bottom-0'}`
                    }`}
                onMouseEnter={() => !isOpen && setIsHovered(true)}
                onMouseLeave={() => !isOpen && setIsHovered(false)}
                onMouseMove={(e) => !isOpen && handleMouseMove(e)}
            >
                <div className="overflow-y-hidden relative flex flex-col items-center group transition-all duration-300 ease-out" onClick={() => !isOpen && setIsOpen(true)}
                    style={(!isOpen && isHovered) ? {
                        transform: `rotate(${rotation}deg)`,
                        transformStyle: 'preserve-3d'
                    } : {}}
                >

                    <div className="h-[40px] flex items-center justify-center gap-3">
                        <JournalTab
                            onClick={() => setIsOpen(true)}
                            label="השורה התחתונה"
                            Icon={BookOpen}
                        />
                    </div>


                    <div className="flex-1 bg-white w-2xl border border-stone-300 rounded-md">
                        <JournalNew isOpen={isOpen} setIsOpen={setIsOpen} />
                    </div>
                </div>
            </div>
        </>
    )
}


const JournalTabDiv = tw.button`min-w-32 h-[40px] flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden flex-shrink-0 transition-all duration-300
    px-32 bg-stone-600 group-hover:bg-gradient-to-t from-stone-700 to-stone-600 text-stone-100/70 hover:text-stone-100 z-10`;

const JournalTabHandle = tw.div`absolute top-1 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-300 bg-stone-200/30 w-12 group-hover:w-16`

function JournalTab({ onClick, label, Icon}) {
    return (
        <JournalTabDiv onClick={onClick}
            style={{
                cornerTopLeftShape: 'bevel',
                cornerTopRightShape: 'bevel',
                borderTopLeftRadius: '100vw',
                borderTopRightRadius: '100vw',
            }}
        >
            <JournalTabHandle />

            <Icon className="w-4 h-4 transition-colors duration-300 relative z-10" />
            <span className="tracking-wider transition-colors duration-300 relative z-10">
                {label}
            </span>
        </JournalTabDiv>
    )
}