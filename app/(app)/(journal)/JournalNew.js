import { memo } from "react"
import { useEffect, useState } from "react"
import { X, Calendar, Save } from "lucide-react"
import Button, { IconButton } from "@/components/Button"
import WithLabel from "@/components/WithLabel"
import ItemContextPicker from "@/components/ItemContextPicker"
import { useAllStaff } from "@/utils/store/useAdmin"
import { usePathname, useSearchParams } from "next/navigation"
import { studyUtils } from "@/utils/store/useStudy"
import { projectUtils } from "@/utils/store/useProject"
import { logsActions } from "@/utils/store/useLogs"
import Journal from "./Journal"
import { useUser } from "@/utils/store/useUser"


function JournalNew({ isOpen, setIsOpen }) {
    const originalUser = useUser(state => state.originalUser)
    const path = usePathname()
    const searchParams = useSearchParams()
    const staff = useAllStaff()
    const [selectedStaff, setSelectedStaff] = useState(originalUser ? originalUser.user : null)
    const [context, setContext] = useState(null)
    const [text, setText] = useState('')

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
        <div className="flex flex-col gap-4 relative p-4">
            {isOpen && <IconButton icon={X} onClick={() => setIsOpen(false)} className="absolute top-2 left-2" />}

            <div className="flex items-start justify-between mb-4 flex-shrink-0 relative">
                <div>
                    <h2 className="text-2xl tracking-tight text-stone-700 mb-2">השורה התחתונה</h2>
                    <p className="text-sm text-stone-700/70 flex items-center gap-2">
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
                        <select className="w-full text-sm rounded-md px-2 py-1 border border-stone-300" value={selectedStaff?.id} onChange={(e) => setSelectedStaff(staff.find(s => s.id === e.target.value))}>
                            <option value="">בחר מנטור / מאסטר</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                            ))}
                        </select>
                    </div>
                </WithLabel>
            </div>

            <textarea placeholder="סיכום הפגישה..."
                className="w-full min-h-[50px] p-4 bg-secondary/50 border border-border rounded-md resize-none outline-none placeholder:text-stone-700/70"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <Button data-role="save" onClick={handleSave} className="w-full justify-center">
                <Save className="w-4 h-4" />
                שמירה
            </Button>

            <Journal />
        </div>
    )
}

export default memo(JournalNew)