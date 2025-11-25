"use client"

import { useEffect, useState } from "react"
import { BookOpen, NotebookTabs, Archive } from "lucide-react"
import { useUser } from "@/utils/store/useUser"
import JournalNew from "./JournalNew"
import Journal from "./Journal"
import { tw } from "@/utils/tw"
import { useNewLog } from "@/utils/store/useLogs"
import Button from "@/components/Button"

const InnerTab = tw.div`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-300
${props => props.$isActive ? 'bg-secondary-200' : 'bg-secondary-50 border border-secondary-200'}
`

export default function JournalHandle() {
    const originalUser = useUser(state => state.originalUser);
    const newLog = useNewLog(state => state.text)
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [notifyNewLog, setNotifyNewLog] = useState(false)
    const [activeTab, setActiveTab] = useState('new') // 'new' or 'archive'

    useEffect(() => {
        if (newLog.length > 0) setNotifyNewLog(true)
    }, [newLog])

    useEffect(() => {
        if (isOpen) setNotifyNewLog(false)
    }, [isOpen])


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
                className={`fixed max-h-[70vh] md:max-h-[70vh] left-1/2 -translate-x-1/2 w-full transition-all duration-700 z-50 ${isOpen
                    ? "top-[10%] md:top-[50%] md:-translate-y-[20vh] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    : isHovered
                        ? `translate-y-[calc(100%-10vh)] ease-out delay-50 ${originalUser ? 'bottom-16' : 'bottom-0'}`
                        : `translate-y-[calc(100%-40px)] ease-out ${originalUser ? 'bottom-16' : 'bottom-0'}`
                    }`}
                onMouseEnter={() => !isOpen && setIsHovered(true)}
                onMouseLeave={() => !isOpen && setIsHovered(false)}
                onMouseMove={(e) => !isOpen && handleMouseMove(e)}
            >
                <div className="relative flex flex-col items-center group transition-all duration-300 ease-out" onClick={() => !isOpen && setIsOpen(true)}
                    style={(!isOpen && isHovered) ? {
                        transform: `rotate(${rotation}deg)`,
                        transformStyle: 'preserve-3d'
                    } : {}}
                >

                    {/* Mobile: Show tabs when open, Desktop: Show single tab */}
                    <div className="h-[40px] flex items-center justify-center gap-3">
                        <JournalTab
                            onClick={() => { setIsOpen(true); setActiveTab('new'); }}
                            label="השורה התחתונה"
                            Icon={BookOpen}
                            notifyNewLog={notifyNewLog}
                        />
                    </div>

                    <div className="flex-1 bg-white border border-border rounded-md max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
                        <div className="flex gap-2 justify-center">
                            <InnerTab onClick={() => setActiveTab('new')} $isActive={activeTab === 'new'}><BookOpen className="w-4 h-4" /> השורה התחתונה</InnerTab>
                            <InnerTab onClick={() => setActiveTab('archive')} $isActive={activeTab === 'archive'}><Archive className="w-4 h-4" /> ארכיון</InnerTab>
                        </div>
                        {activeTab === 'new' && <JournalNew isOpen={isOpen} setIsOpen={setIsOpen} showArchive={false} />}
                        {activeTab === 'archive' && <Journal />}
                    </div>
                </div>
            </div>
        </>
    )
}


const JournalTabDiv = tw.button`min-w-24 md:min-w-32 h-[40px] flex items-center justify-center gap-2 md:gap-3 cursor-pointer relative flex-shrink-0 transition-all duration-300
    px-4 md:px-32 text-stone-100/70 hover:text-stone-100 z-10
    ${props => props.$isActive ? 'bg-stone-700' : 'bg-stone-600 group-hover:bg-gradient-to-t from-stone-700 to-stone-600'}`;

const JournalTabHandle = tw.div`absolute top-1 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-300 bg-accent/30 w-12 group-hover:w-16`

function JournalTab({ onClick, label, Icon, notifyNewLog, isActive = false }) {
    return (
        <JournalTabDiv onClick={(e) => { e.stopPropagation(); onClick(); }} $isActive={isActive}
            style={{
                cornerTopLeftShape: 'bevel',
                cornerTopRightShape: 'bevel',
                borderTopLeftRadius: '100vw',
                borderTopRightRadius: '100vw',
            }}
        >
            <JournalTabHandle />

            <Icon className="w-3 h-3 md:w-4 md:h-4 transition-colors duration-300 relative z-10" />
            <span className="text-xs md:text-sm tracking-wider transition-colors duration-300 relative z-10">
                {label}
            </span>
            {notifyNewLog && <div className="w-3 h-3 md:w-4 md:h-4 bg-destructive rounded-full animate-pulse" />}
        </JournalTabDiv>
    )
}