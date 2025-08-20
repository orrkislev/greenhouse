import { useProject } from "@/utils/store/useProject";
import Avatar from "@/components/Avatar";
import { useTime } from "@/utils/store/useTime";

export default function ProjectInfo() {
    const project = useProject((state) => state.project);
    const terms = useTime((state) => state.terms);

    const termName = (term) => terms.find(t => t.id === term)?.name;

    return (
        <div className="flex gap-3">
            <div className="flex-1">
                <div>
                    {project.terms.length == 1 ? (
                        <h3 className="text-center text-stone-700 font-medium">פרויקט בתקופת {termName(project.terms[0])}</h3>
                    ) : (
                        <h3 className="text-center text-stone-700 font-medium">פרויקט בתקופות {project.terms.map(term => termName(term)).join(', ')}</h3>
                    )}
                </div>
            </div>

            <div className="flex-1">

            </div>

            <div className="flex-1">
                {project.master ? (
                    <div className="flex items-center gap-2 justify-center" >
                        <Avatar userId={project.master.id} />
                        <h3 className="text-center text-stone-700 font-medium">המאסטר שלי - {project.master.firstName} {project.master.lastName}</h3>
                    </div>
                ) : (
                    <h3 className="text-center text-stone-700 font-medium">אין מאסטר</h3>
                )}
            </div>
        </div>
    )
}