import { memo } from "react"
import { useEffect, useState } from "react"
import { X, Calendar, Save } from "lucide-react"
import Button, { IconButton } from "@/components/Button"
import WithLabel from "@/components/WithLabel"
import ItemContextPicker from "@/components/ItemContextPicker"
import { adminActions, useAdmin } from "@/utils/store/useAdmin"
import { usePathname, useSearchParams } from "next/navigation"
import { studyUtils } from "@/utils/store/useStudy"
import { projectUtils } from "@/utils/store/useProject"
import { logsActions, useNewLog } from "@/utils/store/useLogs"
import Journal from "./Journal"
import { useUser } from "@/utils/store/useUser"
import { Combobox } from "@/components/ui/combobox"


function JournalNew({ isOpen, setIsOpen, showArchive = true }) {
    const originalUser = useUser(state => state.originalUser)
    const path = usePathname()
    const searchParams = useSearchParams()
    const allMembers = useAdmin(state => state.allMembers)
    const [selectedStaff, setSelectedStaff] = useState(originalUser ? originalUser.user : null)
    const [context, setContext] = useState(null)
    const logText = useNewLog(state => state.text)
    const [text, setText] = useState('')
    const user = useUser(state => state.user)

    useEffect(() => {
        if (!logText) return;
        setText(logText)
    }, [logText])

    useEffect(() => {
        adminActions.loadData();
    }, [])

    useEffect(() => {
        setSelectedStaff(originalUser ? originalUser.user : null)
    }, [originalUser])

    useEffect(() => {
        if (!isOpen) return;
        setContext(null)
        if (path === '/study' && searchParams.get('id')) setContext(studyUtils.getContext(searchParams.get('id')))
        if (path === '/project') setContext(projectUtils.getContext())
    }, [path, searchParams, isOpen])

    const handleSave = () => {
        if (!text || text.trim().length === 0) return;
        const newLog = { text, context, mentor: selectedStaff }
        logsActions.addLog(newLog)
        setIsOpen(false)
        setText('')
        setContext(null)
        setSelectedStaff(null)
    }

    return (
        <div className="flex flex-col gap-4 relative p-4 w-2xl">
            {isOpen && <IconButton icon={X} onClick={() => setIsOpen(false)} className="absolute top-2 left-2 z-10" />}

            <div className="flex items-start justify-between mb-4 flex-shrink-0 relative">
                <div>
                    <h2 className="text-2xl tracking-tight text-foreground mb-2">השורה התחתונה</h2>
                    <p className="text-sm text-foreground/70 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString("he-IL", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        })}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center divide-x divide-stone-300">
                <WithLabel label="נושא" className='flex-1'>
                    <ItemContextPicker context={context} onContextChange={setContext} />
                </WithLabel>

                <WithLabel label="הפגישה שלי עם..." className='flex-1 px-4'>
                    <div className="flex w-64">
                        {user.role === 'student' && (
                            <Combobox items={allMembers.filter(m => m.role === 'staff').map(s => ({ value: s.id, label: s.first_name + ' ' + s.last_name }))} value={selectedStaff?.id} onChange={(value) => setSelectedStaff(allMembers.find(s => s.id === value))} />
                        )}
                        {user.role === 'staff' && (
                            <Combobox items={allMembers.filter(m => m.role === 'student').map(s => ({ value: s.id, label: s.first_name + ' ' + s.last_name }))} value={selectedStaff?.id} onChange={(value) => setSelectedStaff(allMembers.find(s => s.id === value))} />
                        )}
                    </div>
                </WithLabel>
            </div>

            <textarea placeholder="סיכום הפגישה..."
                className="w-full min-h-[50px] p-4 bg-muted border border-border rounded-md resize-none outline-none placeholder:text-foreground/70"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <Button data-role="save" onClick={handleSave} className="w-full justify-center" data-active={text.trim().length > 0}>
                <Save className="w-4 h-4" />
                שמירה
            </Button>

            {showArchive && <Journal />}
        </div>
    )
}

export default memo(JournalNew)