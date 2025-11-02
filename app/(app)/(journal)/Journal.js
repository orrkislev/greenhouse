import Avatar from "@/components/Avatar"
import { IconButton } from "@/components/Button"
import { logsActions, useLogs } from "@/utils/store/useLogs"
import { useUser } from "@/utils/store/useUser"
import { ArrowDownFromLineIcon, NotebookText, Trash2, X } from "lucide-react"
import { useState } from "react"

const table_names = {
    projects: "פרויקט",
    study_paths: "למידה",
    research: "חקר",
    meetings: "פגישה",
    mentorships: "מנחה",
    groups: "קבוצה",
}


export default function Journal() {
    const user = useUser(state => state.user)
    const logs = useLogs()
    const [filterTags, setFilterTags] = useState([])
    const [filterInput, setFilterInput] = useState('')

    if (logs.length === 0) return null;

    const handleAddFilter = (e) => {
        if (e.key === 'Enter' && filterInput.trim()) {
            if (!filterTags.includes(filterInput.trim())) {
                setFilterTags([...filterTags, filterInput.trim()])
            }
            setFilterInput('')
        }
    }

    const removeFilter = (tagToRemove) => {
        setFilterTags(filterTags.filter(tag => tag !== tagToRemove))
    }

    const filteredLogs = logs.filter(log => {
        if (filterTags.length === 0) return true

        return filterTags.every(filterTag => {
            const lowerFilter = filterTag.toLowerCase()
            const text = log.text?.toLowerCase() || ''
            const contextTitle = log.context?.title?.toLowerCase() || ''
            const contextTable = table_names[log.context_table]?.toLowerCase() || ''
            const mentorFirstName = log.mentor?.first_name?.toLowerCase() || ''
            const mentorLastName = log.mentor?.last_name?.toLowerCase() || ''
            const day = new Date(log.created_at).toLocaleString('he-IL', { weekday: 'long' }).replace('יום ', '')

            return text.includes(lowerFilter) ||
                contextTitle.includes(lowerFilter) ||
                contextTable.includes(lowerFilter) ||
                mentorFirstName.includes(lowerFilter) ||
                mentorLastName.includes(lowerFilter) ||
                day.includes(lowerFilter)
        })
    })

    return (
        <div className="flex flex-col gap-2 mt-4 border-t-2 border-dashed border-stone-300 pt-4">
            <div className="text-sm font-medium flex items-center gap-2">
                <NotebookText className="w-4 h-4" />
                ארכיון
            </div>
            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    value={filterInput}
                    onChange={(e) => setFilterInput(e.target.value)}
                    onKeyDown={handleAddFilter}
                    placeholder="הקלד לסינון ולחץ Enter"
                    className="w-fit min-w-48 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                {filterTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filterTags.map(tag => (
                            <div
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-stone-200 rounded-md text-sm"
                            >
                                <span>{tag}</span>
                                <IconButton icon={X} onClick={() => removeFilter(tag)} small={true} className="text-stone-600 hover:text-stone-900 font-bold" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col divide-y divide-stone-300 overflow-y-auto">
                {filteredLogs
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(log => (
                        <div key={log.id} className='flex justify-between items-center hover:bg-stone-100 group/log'>
                            <div className='py-[3px] flex items-center gap-2'>
                                {log.user.id !== user.id && (
                                    <Avatar user={log.user} />
                                )}
                                <JournalDate date={log.created_at} />
                                <h2 className='text-sm'>
                                    {log.text}

                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {log.context && (
                                    <span className='text-xs text-stone-500 rounded-full bg-stone-200 px-2 py-1 group-hover/log:bg-stone-300'
                                        onClick={() => setFilterTags([...filterTags, table_names[log.context_table], log.context.title])}
                                    >
                                        {table_names[log.context_table]} {log.context.title}
                                    </span>
                                )}
                                {log.mentor && (
                                    <span className='text-xs text-stone-500 rounded-full bg-stone-200 px-2 py-1 group-hover/log:bg-stone-300'>
                                        {log.mentor.first_name} {log.mentor.last_name}
                                    </span>
                                )}
                                <IconButton icon={Trash2} onClick={() => logsActions.deleteLog(log.id)} className="opacity-0 group-hover/log:opacity-100 transition-opacity duration-500 text-stone-700" />
                            </div>
                        </div>
                    ))}
                {logs.length % 20 === 0 && (
                    <div className="flex justify-center items-center h-10">
                        <IconButton icon={ArrowDownFromLineIcon} onClick={() => logsActions.loadMoreLogs()} className="text-stone-700" />
                    </div>
                )}
            </div>
        </div>
    )
}

function JournalDate({ date }) {
    return (
        <div className='p-1 flex items-center justify-center rounded-sm bg-stone-100 gap-1 group-hover/log:bg-stone-300'>
            <div className='text-sm text-stone-500 font-medium'>{new Date(date).toLocaleString('he-IL', { weekday: 'long' }).replace('יום ', '')}</div>
            <div className='text-xs text-stone-500 mt-[1px]'>{new Date(date).toLocaleString('he-IL', { month: 'short', day: 'numeric' })}</div>
        </div>
    )
}