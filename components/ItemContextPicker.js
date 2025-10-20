import { tw } from "@/utils/tw";
import { IconButton } from "./Button";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useAllProjects } from "@/utils/store/useProject";
import { useStudyPaths } from "@/utils/store/useStudy";
import { useState } from "react";
import usePopper from "./Popper";
import { createPortal } from "react-dom";

const contextNames = {
    projects: "פרויקט",
    study_paths: "למידה",
    research: "חקר",
    meetings: "פגישה",
    mentorships: "מנחה",
    groups: "קבוצה",
};

const ContextTagDiv = tw`px-3 py-1 rounded-full font-medium flex items-center gap-2
    ${props => props.tag === 'projects' && 'bg-blue-400 text-white'}
    ${props => props.tag === 'study_paths' && 'bg-green-400 text-white'}
    ${props => props.tag === 'research' && 'bg-yellow-400 text-white'}
    ${props => props.tag === 'meetings' && 'bg-red-400 text-white'}
    ${props => props.tag === 'mentorships' && 'bg-purple-400 text-white'}
    ${props => props.tag === 'groups' && 'bg-orange-400 text-white'}
`;


export default function ItemContextPicker({ context, onContextChange }) {
    const { isOpen, open, close, baseRef, Popper } = usePopper()

    return (
        <>
            <div ref={baseRef} className="flex group/context-picker">
                {context ? (
                    <div className="flex items-center gap-2 text-sm p-1 rounded-md bg-sky-200 group-hover/context-picker:bg-sky-300 transition-all duration-300">
                        {context.title}
                        <X onClick={() => onContextChange(null)} className="w-0 h-4 group-hover/context-picker:w-4 group-hover/context-picker:h-4 cursor-pointer hover:bg-white  rounded-full transition-all duration-300" />
                    </div>
                ) : (
                    <div onClick={open} className="text-sm p-1 rounded-md border border-stone-300 group-hover/context-picker:bg-stone-100 transition-all duration-300 cursor-pointer">
                        בחר נושא
                    </div>
                )}
            </div>
            {createPortal(
                isOpen && (
                    <Popper className="bg-transparent p-1 blur-0">
                        <ContextPicker onPick={onContextChange} close={close} />
                    </Popper>
                ), document.body)}
        </>
    )
}

function ContextPicker({ onPick, close }) {
    const allProjects = useAllProjects()
    const allProjectsContexts = allProjects.map(project => ({ table: 'projects', id: project.id, title: project.title }))
    const allStudyPaths = useStudyPaths(state => state.paths)
    const allStudyPathsContexts = allStudyPaths.map(path => ({ table: 'study_paths', id: path.id, title: path.title }))

    const allContexts = [...allProjectsContexts, ...allStudyPathsContexts]

    const pickContext = (context) => {
        onPick(context)
        close()
    }

    return (
        <div className="flex flex-col gap-1 divide-y divide-stone-300">
            {allContexts.map(context => (
                <div key={context.id} className="text-sm p-1 hover:bg-stone-100 cursor-pointer" onClick={() => pickContext(context)}>
                    {context.title} <span className="text-xs text-stone-500">({contextNames[context.table]})</span>
                </div>
            ))}
        </div>
    )
}