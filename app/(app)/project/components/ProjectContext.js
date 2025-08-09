import { projectActions, useProject } from "@/utils/store/useProject";
import { useTime } from "@/utils/store/useTime";
import { useUser } from "@/utils/store/useUser";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";

export default function ProjectContext() {
    const user = useUser((state) => state.user);
    const project = useProject((state) => state.project);
    const otherProjects = useProject((state) => state.otherProjects);

    return (
        <div>
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
                    <div className="p-3 flex items-center justify-between border border-stone-300">
                        <span className="text-sm text-stone-700">החקר שלי</span>
                        <ChevronLeft className="w-4 h-4 text-stone-400 cursor-pointer" />
                    </div>

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

            {/* back to current project */}
            {project && project.id != user.projectId && (
                <button className="px-4 py-2 border border-stone-300 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                    onClick={() => {
                        projectActions.setProject(null);
                        projectActions.loadProject();
                    }}>
                    חזרה
                </button>
            )}

            <OtherProjects />
        </div>
    )
}

function OtherProjects() {
    const otherProjects = useProject((state) => state.otherProjects);
    const terms = useTime((state) => state.terms);

    useEffect(() => {
        projectActions.loadOtherProjects();
    }, [])

    const termsWithProjects = terms.map(term => ({
        ...term,
        projects: otherProjects.filter(project => project.terms.includes(term.id))
    })).filter(term => term.projects.length > 0).sort((a, b) => a.start - b.start);

    return (
        <div>
            <div className="text-sm text-stone-700 mb-4">הפרויקטים שלי</div>
            {termsWithProjects.map((term) => (
                <div key={term.id} className="flex flex-col gap-2">
                    <div className="text-xs text-stone-400">{term.start.split('-')[0]} - {term.name}</div>
                    {term.projects.map(project => (
                        <div key={project.id} className="text-sm text-stone-500 mr-2 p-1 hover:bg-stone-100 hover:text-stone-700 rounded-md cursor-pointer transition-colors"
                            onClick={() => {
                                projectActions.setProject(project);
                            }}>
                            {project.name}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}