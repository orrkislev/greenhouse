import { tw } from "@/utils/tw";
import { IconButton } from "./Button";
import { Minus, Plus, X } from "lucide-react";
import { useAllProjects } from "@/utils/store/useProject";
import { useStudyPaths } from "@/utils/store/useStudy";
import { useState } from "react";

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
    const [isOpen, setIsOpen] = useState(false)

    const handleContextChange = (context) => {
        onContextChange(context)
        setIsOpen(false)
    }

    return (
        <div className="flex gap-1 group relative">
            {context ? (
                <ContextTagDiv tag={context.table}>
                    <div className="text-sm flex gap-1 items-center">
                        {context.title}
                        <span className='text-xs'>
                            ({contextNames[context.table]})
                        </span>
                    </div>
                    <IconButton icon={X} onClick={() => onContextChange(null)} small className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-black" />
                </ContextTagDiv>
            ) : (
                <>
                    {isOpen ? (
                        <IconButton icon={Minus} onClick={() => setIsOpen(false)} />
                    ) : (
                        <IconButton icon={Plus} onClick={() => setIsOpen(true)} />
                    )}
                </>
            )}
            {isOpen && <ContextPicker onContextChange={handleContextChange} />}
        </div>
    )
}

function ContextPicker({ onContextChange }) {
    const allProjects = useAllProjects()
    const allProjectsContexts = allProjects.map(project => ({ table: 'projects', id: project.id, title: project.title }))
    const allStudyPaths = useStudyPaths(state => state.paths)
    const allStudyPathsContexts = allStudyPaths.map(path => ({ table: 'study_paths', id: path.id, title: path.title }))

    const allContexts = [...allProjectsContexts, ...allStudyPathsContexts]

    return (
        <div className="bg-white max-w-xl border border-stone-300 p-2 rounded-md">
            <div className="flex gap-1 flex-wrap">
                {allContexts.map(context => (
                    <ContextTagDiv key={context.table} tag={context.table} onClick={() => onContextChange(context)} className="cursor-pointer opacity-50 scale-90 hover:scale-100 hover:opacity-100 transition-all duration-300">
                        <div className="text-sm flex gap-1 items-center">
                            {context.title}
                            <span className='text-xs'>
                                ({contextNames[context.table]})
                            </span>
                        </div>
                    </ContextTagDiv>
                ))}
            </div>
        </div>
    )
}