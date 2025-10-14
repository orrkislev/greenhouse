import SmartText from "@/components/SmartText"
import { studyActions, studyUtils } from "@/utils/store/useStudy"
import { Check, EllipsisVertical, HandMetal, Plus, Quote, Target, Trash2, Edit, Image } from "lucide-react"
import { getNewStep } from "./example study paths"
import WithLabel from "@/components/WithLabel"
import StudyPath_Sources from "./StudyPath_Sources"
import Button, { IconButton } from "@/components/Button"
import Menu, { MenuList, MenuItem, MenuSeparator } from "@/components/Menu"
import { motion } from "motion/react"
import { useState, useRef, useMemo } from "react"
import TaskModal from "@/components/TaskModal"

export default function StudyPath({ path }) {

    return (
        <div className="flex flex-col gap-4">
            <PathBG key={path.id} path={path} />
            <div className="">
                <div className="inline-block -mt-4">
                    <SmartText className="text-6xl font-bold" text={path.title}
                        onEdit={(title) => studyActions.updatePath(path.id, { ...path, title })} />
                    <SmartText className="text-xl text-stone-500" text={path.description}
                        onEdit={(description) => studyActions.updatePath(path.id, { ...path, description })} />
                </div>
            </div>

            <StudyPath_Sources path={path} />


            <WithLabel label="מה אני לומד.ת">
                <Steps key={path.id} path={path} />
            </WithLabel>
        </div>
    )
}

function PathBG({ path }) {
    const inputRef = useRef(null)

    const imgUrl = useMemo(() => {
        if (path.metadata?.image) return `url(${path.metadata?.image})`;
        return 'linear-gradient(to right, #f7797d, #FBD786, #C6FFDD)'
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
        <div className="relative border border-stone-200 w-full aspect-[5/1] bg-contain bg-center flex items-center justify-center" style={{ backgroundImage: imgUrl }} >
            <Menu className='absolute top-4 left-4 bg-white'>
                <MenuList>
                    <MenuItem title="מחק תחום" icon={Trash2} onClick={onDelete} />
                    <MenuItem title="העלאת תמונה" icon={Image} onClick={() => inputRef.current.click()} />
                    <input type="file" accept="image/*" onChange={onFile} className="hidden" ref={inputRef} />
                </MenuList>
            </Menu>
        </div>
    )
}

function Steps({ path }) {
    const [openNewStepModal, setOpenNewStepModal] = useState(false)

    const NewStepButton = (
        <Button className="border-none bg-emerald-500 hover:bg-emerald-600 text-white px-16 absolute bottom-0 right-1/2 translate-x-1/2"
            onClick={async () => {
                // const newStep = await getNewStep(path)
                // studyActions.addStep(path.id, newStep)
                setOpenNewStepModal(true)
            }}>
            שלב נוסף
            <Plus className="w-4 h-4 ml-2" />
        </Button>
    )

    return (
        <div key={path.id} className="flex gap-4">
            <div className="relative flex-1">
                <div className="flex pb-16">
                    <div className="flex-1 flex flex-col gap-8">
                        {path.steps.filter((_, index) => index % 2 == 0).map((step) => (
                            <Step key={step.id} path={path} step={step} side="right" />
                        ))}
                        {/* {path.steps.length % 2 == 1 && NewStepButton} */}
                    </div>
                    <StepsMiddleLine path={path} />
                    <div className="flex-1 flex flex-col gap-8 pt-8">
                        {path.steps.filter((_, index) => index % 2 == 1).map((step) => (
                            <Step key={step.id} path={path} step={step} side="left" />
                        ))}
                        {/* {path.steps.length % 2 == 0 && NewStepButton} */}
                    </div>
                </div>
                {NewStepButton}
            </div>
            <TaskModal isOpen={openNewStepModal} onClose={() => setOpenNewStepModal(false)} context={studyUtils.getContext(path.id)} />
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

function Step({ path, step, side }) {

    const [openTaskModal, setOpenTaskModal] = useState(false);

    // const addContent = (type) => {
    //     // TODO
    // }

    // const updateContent = (contentId, data) => {
    //     // TODO
    // }

    // const removeContent = (contentId) => {
    //     // TODO
    // }

    return (
        <div className="group/step w-full relative">
            <div className="rounded-2xl shadow bg-white overflow-hidden relative">
                <motion.div
                    initial={{
                        scale: 0,
                        opacity: 1,
                    }}
                    animate={{
                        scale: step.status == 'completed' ? 8 : 0,
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

                <div className="flex justify-between z-10">

                    {/* <Menu className='absolute top-2 left-2 scale-80' icon={EllipsisVertical}> */}
                    {/* <MenuList> */}
                    {/* <MenuItem title="עריכה" icon={Edit} onClick={() => setOpenTaskModal(true)} /> */}
                    {/* <MenuItem title="מקור מידע" icon={contentIcons.source.icon} onClick={() => addContent('source')} />
                            <MenuItem title="ציטוט" icon={contentIcons.quote.icon} onClick={() => addContent('quote')} />
                            <MenuItem title="תרגול" icon={contentIcons.exercise.icon} onClick={() => addContent('exercise')} />
                            <MenuItem title="מטרה" icon={contentIcons.goal.icon} onClick={() => addContent('goal')} />
                            <MenuSeparator />
                            <MenuItem title="מחק" icon={Trash2} onClick={() => studyActions.deleteStep(path.id, step.id)} /> */}
                    {/* </MenuList> */}
                    {/* </Menu> */}

                    <div className="flex-1 flex flex-col px-4 py-2 hover:underline decoration-dashed cursor-pointer " onClick={() => setOpenTaskModal(true)}>
                        <div className='text-xl font-semibold text-stone-500'>{step.title}</div>
                        <div className='text-sm text-stone-500'>{step.description}</div>
                        {/* <SmartText text={step.title} className="text-xl font-semibold text-stone-500" onEdit={(title) => studyActions.updateStep(path.id, step.id, { ...step, title })} /> */}
                        {/* <SmartText text={step.description} className="text-sm text-stone-500" onEdit={(description) => studyActions.updateStep(path.id, step.id, { ...step, description })} /> */}
                        {/* {step.content && step.content.map((content) => {
                            const Content = contentIcons[content.type]
                            const className = `text-sm text-stone-500 ${Content.className || ''}`
                            return (
                                <div key={content.id} className="flex gap-2 items-center text-sm text-stone-500 p-1">
                                    <Content.icon className="w-4 h-4" />
                                    <SmartText text={content.text} className={className}
                                        onEdit={(text) => updateContent(content.id, { text })}
                                        onRemove={() => removeContent(content.id)}
                                    />
                                </div>
                            )
                        })} */}
                    </div>

                    <div className="flex flex-col h-full p-2">
                        <IconButton
                            icon={Check}
                            className={`w-8 h-8 border rounded-full transition-colors ${step.status == 'completed' ? 'bg-sky-200 border-sky-300 text-sky-600' : 'border-stone-300'}`}
                            onClick={() => studyActions.updateStep(path.id, step.id, { ...step, status: step.status == 'todo' ? 'completed' : 'todo' })} />
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

            <TaskModal task={{ ...step, context: studyUtils.getContext(path.id) }} isOpen={openTaskModal} onClose={() => setOpenTaskModal(false)} />

        </div>
    )
}
