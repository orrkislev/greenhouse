import SmartText from "@/components/SmartText"
import { studyActions } from "@/utils/store/useStudy"
import { Check, EllipsisVertical, HandMetal, Plus, Quote, Sparkle, Target, Trash2 } from "lucide-react"
import { getNewStep } from "./example study paths"
import WithLabel from "@/components/WithLabel"
import StudyPath_Sources from "./StudyPath_Sources"
import Button, { IconButton } from "@/components/Button"
import Menu, { MenuList, MenuItem, MenuSeparator } from "@/components/Menu"
import { motion } from "motion/react"

export default function StudyPath({ path }) {

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
                {path.subjects.map((subject) => (
                    <Subject key={subject.id} path={path} subject={subject} />
                ))}
            </WithLabel>
        </div>
    )
}

function PathOptions({ path }) {

    const onDelete = () => {
        studyActions.deletePath(path.id)
    }

    return (
        <Menu className='float-left mt-2'>
            <MenuList>
                <MenuItem title="מחק תחום" icon={Trash2} onClick={onDelete} />
            </MenuList>
        </Menu>
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

    const NewStepButton = (
        <div className="bg-green-100 rounded-2xl p-4 shadow flex items-center justify-center">
            <Button data-role="new" onClick={async () => {
                const newStep = await getNewStep(path, subject)
                studyActions.addStep(path.id, subject.id, newStep)
            }}>
                שלב נוסף
                <Plus className="w-4 h-4 ml-2" />
            </Button>
        </div>
    )

    return (
        <div key={subject.id} className="flex gap-4">
            <div className="relative flex-1">
                <div className="flex">
                    <div className="flex-1 flex flex-col gap-8 pb-32">
                        {subject.steps.filter((_, index) => index % 2 == 0).map((step) => (
                            <Step key={step.id} path={path} subject={subject} step={step} side="right" />
                        ))}
                        {subject.steps.length % 2 == 1 && NewStepButton}
                    </div>
                    <StepsMiddleLine path={path} subject={subject} />
                    <div className="flex-1 flex flex-col gap-8 pt-8 pb-32">
                        {subject.steps.filter((_, index) => index % 2 == 1).map((step) => (
                            <Step key={step.id} path={path} subject={subject} step={step} side="left" />
                        ))}
                        {subject.steps.length % 2 == 0 && NewStepButton}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StepsMiddleLine() {
    return (
        <div className="w-16 flex justify-center relative">
            <div className="w-px h-full border-dashed border-r border-sky-600" />
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-32 bg-linear-to-b from-stone-100 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-linear-to-t from-stone-100 to-transparent" />
        </div>
    )
}


const contentIcons = {
    source: { icon: Plus, className: 'underline' },
    quote: { icon: Quote, className: 'italic' },
    exercise: { icon: HandMetal },
    goal: { icon: Target, className: 'font-semibold' },
}

function Step({ path, subject, step, side }) {
    return (
        <div className="group/step w-full relative">
            <div className="rounded-2xl shadow bg-white overflow-hidden relative">
                <motion.div
                    initial={{
                        scale: 0,
                        opacity: 1,
                    }}
                    animate={{
                        scale: step.finished ? 8 : 0,
                        opacity: 1,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute left-0 bottom-0 bg-sky-100 rounded-full"
                    style={{
                        width: "128px",
                        height: "128px",
                        zIndex: 0,
                    }}
                />

                <div className="relative z-10 p-4 pb-8">

                    <Menu className='absolute top-2 left-2 scale-80' icon={EllipsisVertical}>
                        <MenuList>
                            <MenuItem title="מקור מידע" icon={contentIcons.source.icon} onClick={() => studyActions.addStepContent(path.id, subject.id, step.id, { type: 'source', text: '' })} />
                            <MenuItem title="ציטוט" icon={contentIcons.quote.icon} onClick={() => studyActions.addStepContent(path.id, subject.id, step.id, { type: 'quote', text: '' })} />
                            <MenuItem title="תרגול" icon={contentIcons.exercise.icon} onClick={() => studyActions.addStepContent(path.id, subject.id, step.id, { type: 'exercise', text: '' })} />
                            <MenuItem title="מטרה" icon={contentIcons.goal.icon} onClick={() => studyActions.addStepContent(path.id, subject.id, step.id, { type: 'goal', text: '' })} />
                            <MenuSeparator />
                            <MenuItem title="מחק" icon={Trash2} onClick={() => studyActions.deleteStep(path.id, subject.id, step.id)} />
                        </MenuList>
                    </Menu>

                    <div className="flex flex-col gap-1 p-2">
                        <SmartText text={step.source} className="text-xl font-semibold text-stone-500" onEdit={(source) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, source })} />
                        <SmartText text={step.text} className="text-sm text-stone-500" onEdit={(text) => studyActions.updateStep(path.id, subject.id, step.id, { ...step, text })} />
                        {step.content && step.content.map((content) => {
                            const Content = contentIcons[content.type]
                            const className = `text-sm text-stone-500 ${Content.className || ''}`
                            return (
                                <div key={content.id} className="flex gap-2 items-center text-sm text-stone-500 p-1">
                                    <Content.icon className="w-4 h-4" />
                                    <SmartText text={content.text} className={className}
                                        onEdit={(text) => studyActions.updateStepContent(path.id, subject.id, step.id, content.id, { text })}
                                        onRemove={() => studyActions.deleteStepContent(path.id, subject.id, step.id, content.id)}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <div className="absolute bottom-2 left-2">
                        <IconButton
                            icon={Check}
                            className={`w-8 h-8 border rounded-full transition-colors ${step.finished ? 'bg-sky-200 border-sky-300 text-sky-600' : 'border-stone-300'}`}
                            onClick={() => studyActions.updateStep(path.id, subject.id, step.id, { ...step, finished: !step.finished })} />
                    </div>
                </div>
            </div>

            <div className={`absolute top-1/2 w-8 -translate-y-1/2 h-8 
                ${side == 'right' ? 'left-0 -translate-x-1/1 border-l rounded-bl-xl -ml-[0.5px]' : 'right-0 border-r translate-x-1/1 rounded-br-xl -mr-[0.5px]'}
                border-b border-sky-600 border-dashed
                `} />

            <div className={`absolute top-1/2 translate-y-3
                ${side == 'right' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}
                h-2 w-2 rounded-full bg-sky-600
                `} />

        </div>
    )
}
