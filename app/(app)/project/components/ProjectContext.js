import { projectActions, useProject } from "@/utils/store/useProject";
import { useTime } from "@/utils/store/useTime";
import { tw } from "@/utils/tw";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ProjectContext() {
    const project = useProject((state) => state.project);

    return (
        <div className="flex flex-col gap-4">
            {project && !project.isOld && project.master && (
                <div className="flex-1 flex gap-3 flex-col">
                    <div className="p-4 h-64 flex items-center justify-center border border-stone-300">
                        <div className="text-center text-stone-600">
                            <p className="text-sm leading-relaxed">
                                {project.questions.map((question, index) => (
                                    <span key={index} className="block mb-2">
                                        <strong>{question.title}</strong> - {question.value}
                                    </span>
                                ))}
                            </p>
                            <div className="mt-8 text-lg font-medium">
                                עריכה
                            </div>
                        </div>
                    </div>

                    {/* Research topics */}
                    <Link href={`/research`} className="p-3 flex items-center justify-between border border-stone-300 hover:bg-stone-300 transition-colors">
                        <span className="text-sm text-stone-700">החקר שלי</span>
                        <ChevronLeft className="w-4 h-4 text-stone-400 cursor-pointer" />
                    </Link>

                    {/* Close project button */}
                    {project.status === "active" && (
                        <button className="px-4 py-2 border border-red-800 text-red-600 hover:bg-red-800 hover:text-white transition-colors"
                            onClick={() => {
                                projectActions.closeProject();
                            }}>
                            סגירת הפרויקט
                        </button>
                    )}
                </div>
            )}

            <OtherProjects />
        </div>
    )
}

const ProjectDiv = tw.div`
    flex gap-2
    text-sm text-stone-500 mr-2 p-1 hover:bg-stone-100 hover:text-stone-700 rounded-md cursor-pointer transition-colors
    ${props => props.$isActive && 'bg-stone-500 text-white'}
`

function OtherProjects() {
    const currProject = useProject((state) => state.project);
    const otherProjects = useProject((state) => state.otherProjects);
    const terms = useTime((state) => state.terms);

    useEffect(() => {
        projectActions.loadOtherProjects();
    }, [])

    const termsWithProjects = terms.map(term => ({
        ...term,
        projects: otherProjects.filter(project => project.terms.includes(term.id))
    })).filter(term => term.projects.length > 0).sort((a, b) => a.start - b.start);
    termsWithProjects.push({
        id: 'other', name: 'אחרים', start: '',
        projects: otherProjects.filter(project => !termsWithProjects.find(term => term.projects.includes(project)))
    });

    const clickOnProject = (project) => {
        if (project.id === currProject?.id) {
            projectActions.setProject(null);
            projectActions.loadProject();
        } else {
            projectActions.setProject(project);
        }
    }

    return (
        <div>
            <div className='w-full h-px bg-stone-300 mb-2'></div>
            <div className="text-sm text-stone-700 mb-4">כל הפרויקטים שלי</div>
            {termsWithProjects.map((term) => (
                <div key={term.id} className="flex flex-col gap-2">
                    <div className="text-xs text-stone-400">{term.start.split('-')[0]} - {term.name}</div>
                    {term.projects.map(project => (
                        <ProjectDiv key={project.id} onClick={() => clickOnProject(project)} $isActive={project.id === currProject?.id}>
                            {project.name}
                        </ProjectDiv>
                    ))}
                </div>
            ))}
        </div>
    )
}