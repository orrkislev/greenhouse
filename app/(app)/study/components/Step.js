import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Button, { IconButton } from "@/components/Button";
import TaskModal from "@/components/TaskModal";
import { studyActions, studyUtils } from "@/utils/store/useStudy";
import { Check, ExternalLink, Plus, Quote, HandMetal, Target } from "lucide-react";
import { format } from "date-fns";

// const contentIcons = {
//     source: { icon: Plus, className: 'underline' },
//     quote: { icon: Quote, className: 'italic' },
//     exercise: { icon: HandMetal },
//     goal: { icon: Target, className: 'font-semibold' },
// }

export default function Step({ path, step, side }) {

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
                    initial={false}
                    animate={{ scaleX: step.status == 'completed' ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0 z-0 rounded-2xl bg-sky-100 pointer-events-none"
                    style={{
                        transformOrigin: "left",
                        willChange: "transform",
                    }}
                />

                <div className="relative z-10">
                    <div className="flex justify-between p-4">

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
                            <div className='text-xl font-semibold text-muted-foreground'>{step.title}</div>
                            <div className='text-sm text-muted-foreground'>{step.description}</div>
                            {/* <SmartText text={step.title} className="text-xl font-semibold text-muted-foreground" onEdit={(title) => studyActions.updateStep(path.id, step.id, { ...step, title })} /> */}
                            {/* <SmartText text={step.description} className="text-sm text-muted-foreground" onEdit={(description) => studyActions.updateStep(path.id, step.id, { ...step, description })} /> */}
                            {/* {step.content && step.content.map((content) => {
                            const Content = contentIcons[content.type]
                            const className = `text-sm text-muted-foreground ${Content.className || ''}`
                            return (
                                <div key={content.id} className="flex gap-2 items-center text-sm text-muted-foreground p-1">
                                    <Content.icon className="w-4 h-4" />
                                    <SmartText text={content.text} className={className}
                                        onEdit={(text) => updateContent(content.id, { text })}
                                        onRemove={() => removeContent(content.id)}
                                    />
                                </div>
                            )
                        })} */}

                            {step.url && (
                                <Link href={step.url.startsWith('http') ? step.url : `https://${step.url}`} target="_blank">
                                    <Button className="mt-4 p-1 bg-accent text-sm text-muted-foreground underline decoration-none cursor-pointer hover:text-secondary transition-all duration-200 flex gap-2 items-center"
                                     onClick={(e) => e.stopPropagation()}>
                            
                                        <ExternalLink className="w-4 h-4" />
                                        {step.url.length > 20 ? step.url.slice(0, 20) + '...' : step.url}
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-col h-full p-2">
                            <IconButton
                                icon={Check}
                                className={`w-8 h-8 border rounded-full transition-colors ${step.status == 'completed' ? 'bg-sky-200 border-sky-300 text-sky-600' : 'border-border'}`}
                                onClick={() => studyActions.updateStep(path.id, step.id, { ...step, status: step.status == 'todo' ? 'completed' : 'todo' })} />
                        </div>
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

            {step.updated_at && <div className="absolute top-1 right-2 font-mono text-[10px] text-stone-400">
                עודכן ב{format(new Date(step.updated_at), 'dd/MM')}
            </div>}
        </div>
    )
}
