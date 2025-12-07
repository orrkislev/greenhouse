import Button from "@/components/Button";
import Tooltip from "@/components/ToolTip";
import { projectActions, useProject, useProjectData } from "@/utils/store/useProject";
import { useTime } from "@/utils/store/useTime";
import { tw } from "@/utils/tw";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProjectContext() {
    const project = useProject();

    return (
        <div className="flex flex-col gap-4">
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
    flex flex-col
    text-sm text-sl mr-2 p-1 hover:bg-muted hover:text-foreground rounded-md cursor-pointer transition-colors
    ${props => props.$isActive && 'bg-slate-300 text-slate-900'}
`

function OtherProjects() {
    const allProjects = useProjectData((state) => state.allProjects);

    useEffect(() => {
        projectActions.loadAllProjects();
    }, [])

    return (
        <div>
            <div className='w-full h-px bg-stone-300 mb-2'></div>
            <div className="text-sm text-foreground mb-4">כל הפרויקטים שלי</div>
            {allProjects.map(project => (
                <SingleProject key={project.id} project={project} />
            ))}
        </div>
    )
}

function SingleProject({ project }) {
    const currProject = useProjectData((state) => state.project);
    const currTerm = useTime((state) => state.currTerm);
    const [terms, setTerms] = useState([]);

    useEffect(() => {
        projectActions.getProjectTerms(project.id).then(setTerms);
    }, [])

    const clickOnProject = (project) => {
        if (project.id === currProject?.id) {
            projectActions.setProject(null);
            projectActions.loadProject();
        } else {
            projectActions.setProject(project);
        }
    }

    let needsReview = false;
    if (terms.length > 0) {
        if (!terms.some(term => term.id === currTerm.id)) {
            if (!project.metadata?.review) needsReview = true;
            else if (!project.metadata.review.summary) needsReview = true;
        }
    }

    return (
        <ProjectDiv onClick={() => clickOnProject(project)} $isActive={project.id === currProject?.id}>
            <div className='flex items-center gap-2'>
                {project.title}
                {needsReview && <div className="w-3 h-3 rounded-full bg-destructive"></div>}
            </div>
            {terms.length > 0 && <div className="text-xs text-muted-foreground">תקופת {terms[0].name}</div>}
            {needsReview && <Tooltip side="right">נדרש משוב</Tooltip>}
        </ProjectDiv>
    )
}