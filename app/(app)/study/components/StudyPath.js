import SmartText from "@/components/SmartText"
import { EnglishPathID, studyActions } from "@/utils/store/useStudy"
import { Trash2, Image, Library, Plus } from "lucide-react"
import StudyPath_Sources from "./StudyPath_Sources"
import Menu, { MenuList, MenuItem } from "@/components/Menu"
import { useRef, useMemo } from "react"
import Steps from "../Steps"
import Box2 from "@/components/Box2"
import Button from "@/components/Button"
import { useUser } from "@/utils/store/useUser"

export default function StudyPath({ path }) {
    const user = useUser(state => state.user)
    const isOwner = path.student_id === user?.id
    const isEnglish = path.id === EnglishPathID

    return (
        <div className={`flex flex-col gap-8 ${isEnglish ? 'ltr' : ''}`}>
            <PathBG key={path.id} path={path} />

            <div className="flex justify-between gap-8">
                <div className="flex-1 flex flex-col gap-4 self-start">
                    <StudyPath_Sources path={path} />
                    <Steps key={path.id} path={path} />
                </div>
                {(isOwner && !isEnglish) && <Vocabulary path={path} />}
            </div>
        </div>
    )
}

function PathBG({ path }) {
    const user = useUser(state => state.user)
    const isOwner = path.student_id === user?.id
    const inputRef = useRef(null)

    const imgUrl = useMemo(() => {
        if (path.metadata?.image) return `url(${path.metadata?.image})`;
        return 'url(/images/study.png)'
    }, [path.metadata?.image])

    const onFile = (e) => {
        if (e.target.files[0]) {
            studyActions.uploadImage(path.id, e.target.files[0])
        }
    }

    const onDelete = () => {
        studyActions.deletePath(path.id)
    }

    return (
        <div className="flex flex-col">
            <div className="overflow-hidden relative border border-border w-full aspect-[5/1] rounded-b-xl bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: imgUrl }} >
                {isOwner && (
                    <Menu className='absolute top-4 left-4 bg-white'>
                        <MenuList>
                            <MenuItem title="מחק תחום" icon={Trash2} onClick={onDelete} />
                            <MenuItem title="העלאת תמונה" icon={Image} onClick={() => inputRef.current.click()} />
                            <input type="file" accept="image/*" onChange={onFile} className="hidden" ref={inputRef} />
                        </MenuList>
                    </Menu>
                )}
                <div className="absolute bottom-1 left-1 right-1">
                    <SmartText className="text-6xl font-bold bg-white" text={path.title}
                        onEdit={(title) => studyActions.updatePath(path.id, { ...path, title })} editable={isOwner} />
                </div>
            </div>
            <SmartText className="text-xl text-muted-foreground" text={path.description}
                onEdit={(description) => studyActions.updatePath(path.id, { ...path, description })} editable={isOwner} />
        </div >
    )
}


function Vocabulary({ path }) {
    const addWord = () => studyActions.addVocabulary(path.id, '')
    const deleteWord = (wordIndex) => studyActions.deleteVocabulary(path.id, wordIndex)
    const updateWord = (wordIndex, word) => {
        if (word.trim() === '') return deleteWord(wordIndex)
        studyActions.updateVocabulary(path.id, wordIndex, word)
    }

    return (
        <Box2 label="מושגים חשובים" LabelIcon={Library} className='min-w-64 min-h-64 relative pb-8 self-start shadow-[0_0_30px_rgba(250,60,120,0.1)]' >
            <Button data-role="new" icon={Plus} onClick={addWord} className="absolute bottom-2 left-2 group/new-vocabulary">
                <Plus className="w-4 h-4 group-hover/new-vocabulary:rotate-90 transition-transform duration-200" />
                <span>מושג חדש</span>
            </Button>
            <div className="flex gap-2 flex-wrap">
                {path.vocabulary.map((word, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 bg-accent px-2 py-1 rounded-full text-xs hover:bg-accent transition-colors">
                        <div contentEditable={true} suppressContentEditableWarning onBlur={(e) => updateWord(index, e.target.innerText)} className="w-full outline-none min-w-2">
                            {word}
                        </div>
                    </div>
                ))}
            </div>
        </Box2>
    )
}