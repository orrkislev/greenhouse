import SmartText from "@/components/SmartText"
import { studyActions } from "@/utils/store/useStudy"
import { Check, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { tw } from "@/utils/tw"

const SpecialButton = tw`p-4 border border-gray-200 rounded-md flex items-center gap-2 text-xs hover:bg-gray-100 cursor-pointer`;


export default function StudyPath({ path }) {

    const newSubject = () => {
        studyActions.addSubject(path.id, {
            name: "שם הנושא החדש",
            description: "תיאור הנושא החדש",
            steps: [],
        })
    }

    return (
        <div className="flex flex-col gap-8 p-4">

            <div className="flex gap-4">
                <SpecialButton onClick={() => studyActions.deletePath(path.id)}>
                    <Trash2 className="w-4 h-4" />
                    מחק נתיב
                </SpecialButton>
                <SpecialButton onClick={newSubject}>
                    <Plus className="w-4 h-4" />
                    הוסף נושא
                </SpecialButton>
            </div>

            <div className="flex flex-col gap-1">
                <SmartText className="text-xl" text={path.name} onEdit={(name) => studyActions.updatePath(path.id, { ...path, name })} />
                <SmartText className="text-sm text-gray-500" text={path.description} onEdit={(description) => studyActions.updatePath(path.id, { ...path, description })} />
            </div>

            {path.subjects.map(subject => (
                <Subject key={subject.name} path={path} subject={subject} />
            ))}
        </div>
    )
}

function Subject({ path, subject }) {

    const newStep = () => {
        studyActions.addStep(path.id, subject.id, {
            id: new Date().getTime(),
            source: "איך אני לומד את זה",
            text: "מה למדתי מזה",
            finished: false,
        })
    }
    return (
        <div key={subject.name} className="flex gap-1">
            <div className="flex-1 flex flex-col gap-4 p-4 border border-gray-300 justify-between group/subject">
                <div className="flex flex-col gap-1">
                    <SmartText className="text-lg" text={subject.name} onEdit={(name) => studyActions.updateSubject(path.id, subject.id, { ...subject, name })} />
                    <SmartText className="text-sm text-gray-500" text={subject.description} onEdit={(description) => studyActions.updateSubject(path.id, subject.id, { ...subject, description })} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover/subject:opacity-100 transition-all">
                    <SpecialButton onClick={() => studyActions.deleteSubject(path.id, subject.id)}>
                        <Trash2 className="w-4 h-4" />
                        מחק נושא
                    </SpecialButton>
                    <SpecialButton onClick={newStep}>
                        <Plus className="w-4 h-4" />
                        הוסף שלב
                    </SpecialButton>
                </div>
            </div>
            <div className="flex-3 flex flex-col gap-1">
                {subject.steps.map(step => (
                    <Step key={step.source} path={path} subject={subject} step={step} />
                ))}
            </div>
        </div>
    )
}


function Step({ path, subject, step }) {
    const [isHovered, setIsHovered] = useState(false)

    const editStep = (source, text) => {
        studyActions.updateStep(path.id, subject.id, step.id, { ...step, source, text })
    }
    return (
        <div className="flex border border-gray-300" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className={`${step.finished ? "bg-emerald-500" : ""} border-l border-gray-300 w-4`} />
            <div className="flex-1 flex gap-4 justify-between p-4">
                <div className="flex-1 flex flex-col gap-1">
                    <SmartText text={step.source} onEdit={(source) => editStep(source, step.text)} />
                    <SmartText text={step.text} className="text-sm text-gray-500" onEdit={(text) => editStep(step.source, text)} />
                </div>
                <div className={`flex flex-col gap-1 ${isHovered ? "opacity-100" : "opacity-0"} transition-all`}>
                    <Trash2 className="p-2 w-8 h-8 cursor-pointer hover:bg-gray-300/50 transition-colors rounded-full" onClick={() => studyActions.deleteStep(path.id, subject.id, step.id)} />
                    <Check className={`p-2 w-8 h-8 cursor-pointer ${step.finished ? "text-green-500" : "text-gray-500"} hover:bg-gray-300/50 transition-colors rounded-full`} onClick={() => studyActions.updateStep(path.id, subject.id, step.id, { ...step, finished: !step.finished })} />
                </div>
            </div>
        </div>
    )
}