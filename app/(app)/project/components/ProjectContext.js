import Button from "@/components/Button";
import WithLabel from "@/components/WithLabel";
import { projectActions, useProject, useProjectData } from "@/utils/store/useProject";
import { timeActions, useTime } from "@/utils/store/useTime";
import { tw } from "@/utils/tw";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ProjectContext() {
    const project = useProject();

    return (
        <div className="flex flex-col gap-4">
            {project && (
                <div className="flex-1 flex gap-3 flex-col">
                    <div className="p-4 flex flex-col gap-4 border border-border text-sm text-muted-foreground">
                        {project.metadata.questions && project.metadata.questions.map((question, index) => (
                            <WithLabel key={index} label={question.title}>
                                <div className="text-sm text-muted-foreground">{question.value}</div>
                            </WithLabel>
                        ))}
                    </div>

                    {/* Research topics */}
                    <Link href={`/research`} className="p-3 flex items-center justify-between border border-border hover:bg-accent transition-colors">
                        <span className="text-sm text-foreground">החקר שלי</span>
                        <ChevronLeft className="w-4 h-4 text-stone-400 cursor-pointer" />
                    </Link>
                </div>
            )}

            <OtherProjects />

            {project && project.terms && !project.terms.some(term => term.id === useTime.getState().currTerm.id) && (
                <Button data-role="close" onClick={() => projectActions.setProject(null)}>
                    חזרה
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            )}
        </div>
    )
}

const ProjectDiv = tw.div`
    flex gap-2
    text-sm text-muted-foreground mr-2 p-1 hover:bg-muted hover:text-foreground rounded-md cursor-pointer transition-colors
    ${props => props.$isActive && 'bg-muted0 text-white'}
`

function OtherProjects() {
    const currProject = useProjectData((state) => state.project);
    const allProjects = useProjectData((state) => state.allProjects);

    useEffect(() => {
        projectActions.loadAllProjects();
    }, [])

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
            <div className="text-sm text-foreground mb-4">כל הפרויקטים שלי</div>
            {allProjects.map(project => (
                <ProjectDiv key={project.id} onClick={() => clickOnProject(project)} $isActive={project.id === currProject?.id}>
                    {project.title}
                </ProjectDiv>
            ))}
        </div>
    )
}