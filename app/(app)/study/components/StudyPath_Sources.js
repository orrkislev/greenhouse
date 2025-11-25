import Button, { IconButton } from "@/components/Button"
import usePopper from "@/components/Popper"
import SmartText from "@/components/SmartText"
import WithLabel from "@/components/WithLabel"
import { EnglishPathID, studyActions } from "@/utils/store/useStudy"
import { useUser } from "@/utils/store/useUser"
import { Icon } from "@iconify/react"
import IconifyPicker from "@zunicornshift/mui-iconify-picker"
import { Edit, ExternalLink, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function StudyPath_Sources({ path }) {

    if (path.id === EnglishPathID) return <StudyPath_Sources_English path={path} />

    return (
        <WithLabel label="מקורות מידע">
            <div className="flex gap-4 flex-wrap">
                <Button data-role="new" icon={Plus} onClick={() => studyActions.addSource(path.id, 'מקור מידע')} className='group/new-source'>
                    <Plus className="w-4 h-4 group-hover/new-source:rotate-90 transition-transform duration-200" />
                    מקור מידע חדש
                </Button>
                {path.sources && path.sources.map((source, sourceIndex) => (
                    <div key={sourceIndex} className="flex items-center bg-white border border-border rounded-md p-2 group/source ">
                        <SmartText text={source}
                            onEdit={(text) => studyActions.updateSource(path.id, sourceIndex, text)}
                            withIcon={false}
                            className="text-sm text-muted-foreground"
                        />
                        <Trash2 className="mr-2 h-4 cursor-pointer text-muted-foreground w-0 group-hover/source:w-4 opacity-0 group-hover/source:opacity-100 hover:bg-accent/50 transition-all rounded-full" onClick={() => studyActions.deleteSource(path.id, sourceIndex)} />
                    </div>
                ))}
            </div>
        </WithLabel>
    )
}

function StudyPath_Sources_English({ path }) {
    const user = useUser(state => state.user)
    const isOwner = path.student_id === user?.id
    const [selectedSourceIndex, setSelectedSourceIndex] = useState(0)

    const clickNewSource = () => {
        studyActions.addSource(path.id, 'מקור מידע')
        const newSource = {
            title: 'New Item',
            description: 'Item Description',
            icon: 'mdi:book-open',
            url: 'external link url'
        }
        studyActions.updateSource(path.id, path.sources.length - 1, newSource)
    }


    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
                {path.sources.map((source, sourceIndex) => (
                    <EnglishSource key={sourceIndex} source={source} isSelected={selectedSourceIndex === sourceIndex} onSelect={() => setSelectedSourceIndex(sourceIndex)} />
                ))}
                {isOwner && (
                    <Button data-role="new" icon={Plus} onClick={clickNewSource} className='group/new-source'>
                        <Plus className="w-4 h-4 group-hover/new-source:rotate-90 transition-transform duration-200" />
                    </Button>
                )}
            </div>
            {path.sources[selectedSourceIndex] && <EnglishSourceContent key={selectedSourceIndex} {...{ path, source: path.sources[selectedSourceIndex], sourceIndex: selectedSourceIndex, isOwner }} />}
        </div>
    )
}
function EnglishSource({ source, isSelected, onSelect }) {

    return (
        <div className={`relative flex gap-2 pr-4 items-center bg-accent text-muted-foreground rounded-full p-2 hover:bg-stone-600 hover:text-white transition-all duration-200 cursor-pointer ${isSelected ? 'bg-stone-600 text-white' : ''}`}
            onClick={onSelect}>

            {source.icon && <Icon icon={source.icon} className="w-4 h-4" />}
            {source.title && <div className="text-sm">{source.title}</div>}
        </div>
    )
}

function EnglishSourceContent({ path, source, sourceIndex, isOwner }) {

    const [isEditing, setIsEditing] = useState(false)
    const [icon, setIcon] = useState(source.icon)
    const [title, setTitle] = useState(source.title)
    const [description, setDescription] = useState(source.description)
    const [url, setUrl] = useState(source.url)

    const save = () => {
        studyActions.updateSource(path.id, sourceIndex, { ...source, icon, title, description, url })
        setIsEditing(false)
    }

    const addAsStep = () => {
        studyActions.addStep(path.id, {
            title: source.title,
            description: source.description,
            url: source.url,
            metadata: { icon: source.icon, english: true }
        })
    }

    return (
        <div className="bg-white rounded-md p-4 relative">
            {isEditing ? (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <WithLabel label="Icon">
                            <IconifyPicker value={icon} onChange={(value) => setIcon(value)} />
                        </WithLabel>
                        <WithLabel label="Title">
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </WithLabel>
                    </div>
                    <WithLabel label="Description">
                        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full" />
                    </WithLabel>
                    <WithLabel label="URL">
                        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
                    </WithLabel>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                            {icon && <Icon icon={icon} className="w-10 h-10 text-muted-foreground" />}
                            <div className="text-lg font-semibold">{title}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                        {url.length > 0 && (
                            <Link href={url.startsWith('http') ? url : `https://${url}`} target="_blank">
                                <Button className="p-1 bg-accent text-sm text-muted-foreground underline decoration-none cursor-pointer hover:text-secondary transition-all duration-200 flex gap-2 items-center">
                                    <ExternalLink className="w-4 h-4" />
                                    {url.length > 20 ? url.slice(0, 20) + '...' : url}
                                </Button>
                            </Link>
                        )}
                        <div className="flex gap-2">
                            <Button data-role="save" onClick={addAsStep}>
                                <Plus className="w-4 h-4" />
                                <span>I want to do this</span>
                            </Button>
                        </div>
                    </div>
                </>
            )}
            {isOwner && (
                <div className="absolute top-2 right-2">
                    {isEditing ? <IconButton icon={Save} onClick={save} /> : <IconButton icon={Edit} onClick={() => setIsEditing(true)} />}
                    <IconButton icon={Trash2} onClick={() => studyActions.deleteSource(path.id, sourceIndex)} />
                </div>
            )}
        </div>
    )
}