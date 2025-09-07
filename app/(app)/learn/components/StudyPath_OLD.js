import SmartText, { AutoSizeTextarea } from "@/components/SmartText"
import { studyActions } from "@/utils/store/useStudy"
import { Check, Ellipsis, Hamburger, Loader2, Menu, Pencil, Plus, Sparkle, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { tw } from "@/utils/tw"
import { getNewStep, getNewSubject } from "./example study paths"
import { generateImage } from "@/utils/firebase/firebase"
import WithLabel from "@/components/WithLabel"
import StudyPath_Sources from "./StudyPath_Sources"
import { IconButton } from "@/components/Button"

const SpecialButton = tw`p-4 border border-stone-200 rounded-md flex items-center gap-2 text-xs hover:bg-stone-100 cursor-pointer`;

export default function StudyPath({ path }) {
    const [loading, setLoading] = useState(false)

    const newSubject = async () => {
        setLoading(true)
        const newSubject = await getNewSubject(path)
        studyActions.addSubject(path.id, newSubject)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <PathBG key={path.id} path={path} />
            <div className="">
                <div className="inline-block -mt-4">
                    <SmartText className="text-6xl font-bold" text={path.name} onEdit={(name) => {
                        studyActions.updatePath(path.id, { ...path, name })
                        studyActions.createImage(path, name)
                    }} />
                    <SmartText className="text-xl text-stone-500" text={path.description} onEdit={(description) => studyActions.updatePath(path.id, { ...path, description })} />
                </div>
                <PathOptions path={path} />
            </div>

            <StudyPath_Sources path={path} />


            <WithLabel label="מה אני לומד.ת">
                <div className="flex flex-col gap-4">
                    <div className="flex">
                        <SpecialButton onClick={newSubject} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {loading ? "רגע..." : "הוסף נושא"}
                        </SpecialButton>
                    </div>

                    {path.subjects.map((subject) => (
                        <Subject key={subject.id} path={path} subject={subject} />
                    ))}
                </div>
            </WithLabel>
        </div>
    )
}

function PathOptions({ path }) {
    const [isOpen, setIsOpen] = useState(false)

    const onDelete = () => {
        studyActions.deletePath(path.id)
        setIsOpen(false)
    }

    return (
        <div className={`border border-stone-200 bg-white float-left mt-2 max-w-8 transition-all duration-300 overflow-hidden ${isOpen ? 'max-w-40' : ''}`}>
            {!isOpen ? (
                <Ellipsis className="w-6 h-6 cursor-pointer p-1 hover:bg-stone-200 rounded-full" onClick={() => setIsOpen(true)} />
            ) : (
                <div className="p-2 rounded-md flex flex-col gap-2">
                    <div className="flex justify-end">
                        <X className="w-6 h-6 cursor-pointer p-1 hover:bg-stone-200 rounded-full" onClick={() => setIsOpen(false)} />
                    </div>
                    <div className="flex gap-2 items-center text-stone-500 cursor-pointer hover:text-stone-500 hover:bg-stone-200 rounded-md p-1 transition-all truncate" onClick={onDelete}>
                        <Trash2 className="w-4 h-4" />
                        מחק תחום
                    </div>
                </div>
            )}
        </div>
    )
}

function PathBG({ path }) {
    return (
        <div className="border border-stone-200 w-full h-64 bg-contain bg-center flex items-center justify-center" style={{ backgroundImage: path.image ? `url(${path.image})` : 'none' }} >
            {!path.image && (
                <Sparkle className="w-16 h-16 animate-pulse" />
            )}
        </div>
    )
}

function Subject({ path, subject }) {
    const [loading, setLoading] = useState(false)

    const newStep = async () => {
        setLoading(true)
        const newStep = await getNewStep(path, subject)
        studyActions.addStep(path.id, subject.id, newStep)
        setLoading(false)
    }
    return (
        <div key={subject.id} className="flex gap-4">
            <div className="z-2 w-64">
                <div className="bg-white flex flex-col gap-4 p-4 border border-stone-300 justify-between group/subject">
                    <div className="flex flex-col gap-1">
                        <SmartText className="text-lg" text={subject.name} onEdit={(name) => studyActions.updateSubject(path.id, subject.id, { ...subject, name })} />
                        <SmartText className="text-sm text-stone-500" text={subject.description} onEdit={(description) => studyActions.updateSubject(path.id, subject.id, { ...subject, description })} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover/subject:opacity-100 transition-all">
                        <SpecialButton onClick={() => studyActions.deleteSubject(path.id, subject.id)}>
                            <Trash2 className="w-4 h-4" />
                            מחק נושא
                        </SpecialButton>
                        <SpecialButton onClick={newStep} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {loading ? "רגע..." : "הוסף שלב"}
                        </SpecialButton>
                    </div>
                </div>
            </div>
            <div className="relative flex-1">
                <Steps path={path} subject={subject} />
            </div>
        </div>
    )
}

function Steps({ path, subject }) {
    return (
        <div className="flex flex-col gap-3">
            {subject.steps.map((step) => (
                <Step key={step.id} path={path} subject={subject} step={step} />
            ))}
        </div>
    )
}

function Step({ path, subject, step }) {
    return (
        <div className="flex justify-between border border-stone-300 group/step w-full">
            <div className="flex-[3] flex flex-col gap-1 p-2">
                <SmartText text={step.source} className="text-sm font-semibold text-stone-500" onEdit={(source) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, source })} />
                <SmartText text={step.text} className="text-sm text-stone-500" onEdit={(text) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, text })} />
            </div>
            <div className="flex-[1] border-r border-stone-300 border-dashed pr-2 flex justify-between">
                <SmartText text={step.test || "איך אדע שהצלחתי"} className="text-xs text-stone-500" onEdit={(test) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, test })} />
                <div className="flex flex-col gap-2 opacity-0 group-hover/step:opacity-100 transition-all">
                    <IconButton icon={Check} onClick={() => studyActions.updateStep(path.id, subject.id, step.id, { ...step, finished: !step.finished })} />
                    <IconButton icon={Trash2} onClick={() => studyActions.deleteStep(path.id, subject.id, step.id)} />
                </div>
            </div>
        </div>
    )
}

// function Steps({ path, subject }) {
//     const [counter, setCounter] = useState(0)
//     const [svg, setSvg] = useState(null)
//     const stepsRef = useRef(null)

//     useEffect(() => {
//         const timer = setInterval(() => {
//             calcSVG()
//         }, 100)
//         return () => clearInterval(timer)
//     }, [])

//     const calcSVG = () => {
//         if (!stepsRef.current) return
//         const container = stepsRef.current.getBoundingClientRect()
//         const steps = stepsRef.current.querySelectorAll(".step")
//         let newSVg = []
//         for (let i = 0; i < steps.length - 1; i++) {
//             const s1 = steps[i]
//             const s2 = steps[i + 1]
//             const s1Rect = s1.getBoundingClientRect()
//             const s2Rect = s2.getBoundingClientRect()
//             const startY = s1Rect.top - container.top + s1Rect.height / 2
//             const startX = i % 2 == 0 ? s1Rect.left - container.left : s1Rect.left - container.left + s1Rect.width
//             const endy = s2Rect.top - container.top + s2Rect.height / 2
//             const endx = i % 2 == 0 ? s2Rect.left - container.left : s2Rect.left - container.left + s2Rect.width
//             const dx = i % 2 == 0 ? Math.min(startX, endx) - 30 : Math.max(startX, endx) + 30
//             const radius = (startY - endy) / 2
//             newSVg.push(<path key={i + '1'} d={`M${startX}, ${startY} L ${dx}, ${startY}`} />)
//             newSVg.push(<path key={i + '2'} d={`M${dx}, ${startY} A ${radius} ${radius} 0 0 ${i % 2 == 0 ? 0 : 1} ${dx}, ${endy}`} />)
//             newSVg.push(<path key={i + '3'} d={`M${dx}, ${endy} L ${endx}, ${endy}`} />)
//         }
//         setSvg(newSVg)
//     }



//     return (
//         <>
//             {stepsRef.current && svg && (
//                 <div className="absolute inset-0">
//                     <svg viewBox={`0 0 ${stepsRef.current.clientWidth} ${stepsRef.current.clientHeight}`} preserveAspectRatio="none" stroke="#777" strokeWidth="1" strokeDasharray="3" fill="none">
//                         {svg}
//                     </svg>
//                 </div>
//             )}
//             <div className="flex flex-col gap-3 z-1 w-full" ref={stepsRef} key={`${path.id}-${subject.id}-${counter}`}>
//                 {subject.steps.map((step, index) => (
//                     <Step key={step.id} path={path} subject={subject} step={step} index={index} />
//                 ))}
//             </div>
//         </>
//     )
// }

// const StepPill = tw`step flex border border-stone-500 bg-white rounded-full border-dashed p-2 px-6 relative z-2 group/step
//     ${({ $finished }) => $finished ? 'bg-green-50 border-solid border-stone-300 text-stone-500' : ''}
// `

// function Step({ path, subject, step, index }) {
//     return (
//         <div style={{ marginRight: index % 2 == 0 ? (index == 0 ? "10%" : "20%") : "35%" }} className="flex max-w-128">
//             <div className="relative flex">
//                 {index == 0 && <div className="absolute top-[50%] right-0 w-64 translate-x-[100%] h-px border-b border-dashed border-stone-500" />}
//                 <StepPill $finished={step.finished}>
//                     <div className="flex-1 flex gap-4 justify-between items-center">
//                         <div className="flex-1 flex flex-col">
//                             <SmartText text={step.source} className="text-sm font-semibold text-stone-500" onEdit={(source) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, source })} />
//                             <SmartText text={step.text} className="text-sm text-stone-500" onEdit={(text) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, text })} />
//                         </div>
//                         <div className="flex opacity-0 group-hover/step:opacity-100 transition-all">
//                             <Trash2 className="p-1 w-6 h-6 cursor-pointer hover:bg-stone-300/50 transition-colors rounded-full" onClick={() => studyActions.deleteStep(path.id, subject.id, step.id)} />
//                             <Check className={`p-1 w-6 h-6 cursor-pointer ${step.finished ? "text-green-500" : "text-stone-500"} hover:bg-stone-300/50 transition-colors rounded-full`} onClick={() => studyActions.updateStep(path.id, subject.id, step.id, { ...step, finished: !step.finished })} />
//                         </div>
//                     </div>
//                 </StepPill>
//             </div>
//         </div>
//     )
// }

