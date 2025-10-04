import { projectActions, useProjectData } from "@/utils/store/useProject";
import Avatar from "@/components/Avatar";
import { daysOfWeek, useTime } from "@/utils/store/useTime";
import { useMeetings } from "@/utils/store/useMeetings";
import { CalendarFold } from "lucide-react";
import { useEffect } from "react";

export default function ProjectInfo() {
    const project = useProjectData((state) => state.project);
    const meetings = useMeetings()

    useEffect(() => {
        projectActions.loadProjectTerms();
        projectActions.loadProjectMasters();
    }, []);

    const meeting = meetings.find(m => m.staff === project.master.id);

    return (
        <div className="flex gap-3">
            <div className="flex-1">
                {project.terms && (
                    <div>
                        {project.terms.length == 1 ? (
                            <h3 className="text-center text-stone-700 font-medium">פרויקט בתקופת {project.terms[0].name}</h3>
                        ) : (
                            <h3 className="text-center text-stone-700 font-medium">פרויקט בתקופות {project.terms.map(term => term.name).join(', ')}</h3>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1"></div>

            <div className="flex-1">
                {project.masters ? (
                    <div className="flex items-center justify-center flex-col" >
                        <div className="flex items-center gap-2">
                            <Avatar user={project.master[0]} />
                            <h3 className="text-center text-stone-700 font-medium">המאסטר שלי - {project.master[0].first_name} {project.master[0].last_name}</h3>
                        </div>
                        <div className="flex gap-2">
                            <CalendarFold className="w-4 h-4" />
                            {meeting ? (
                                <div className="text-xs">ימי {daysOfWeek[meeting.day - 1]} בשעה {meeting.start}</div>
                            ) : (
                                <div className="text-xs text-red-600">אין פגישה מתוכננת</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <h3 className="text-center text-stone-700 font-medium">אין מאסטר</h3>
                )}
            </div>
        </div>
    )
}