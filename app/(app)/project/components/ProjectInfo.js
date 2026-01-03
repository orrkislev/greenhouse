import { projectActions, useProjectData } from "@/utils/store/useProject";
import Avatar from "@/components/Avatar";
import { daysOfWeek, timeActions, useTime } from "@/utils/store/useTime";
import { useMeetings } from "@/utils/store/useMeetings";
import { CalendarFold } from "lucide-react";
import { useEffect } from "react";

export default function ProjectInfo() {
  const project = useProjectData(state => state.project);
  const meetings = useMeetings()
  const terms = useTime(state => state.terms)

  useEffect(() => {
    timeActions.loadTerms();
  }, []);

  const getTermName = (termId) => terms.find(term => term.id === termId)?.name
  const meeting = meetings.find(m => m.other_participants?.[0]?.id === project.master?.id);

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        {project.term && (
          <div>
            {project.term.length == 1 ? (
              <h3 className="text-center text-foreground font-medium">פרויקט בתקופת {getTermName(project.term[0])}</h3>
            ) : (
              <h3 className="text-center text-foreground font-medium">פרויקט בתקופות {project.term.map(term => getTermName(term)).join(', ')}</h3>
            )}
          </div>
        )}
      </div>

      <div className="flex-1"></div>

      <div className="flex-1">
        {project.master ? (
          <div className="flex items-center justify-center flex-col" >
            <div className="flex items-center gap-2">
              <Avatar user={project.master} />
              <h3 className="text-center text-foreground font-medium">המאסטר שלי - {project.master.first_name} {project.master.last_name}</h3>
            </div>
            <div className="flex gap-2">
              <CalendarFold className="w-4 h-4" />
              {meeting ? (
                <div className="text-xs">ימי {daysOfWeek[meeting.day - 1]} בשעה {meeting.start}</div>
              ) : (
                <div className="text-xs text-destructive">אין פגישה מתוכננת</div>
              )}
            </div>
          </div>
        ) : (
          <h3 className="text-center text-foreground font-medium">אין מאסטר</h3>
        )}
      </div>
    </div>
  )
}