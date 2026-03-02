import Avatar from "@/components/Avatar";

export function StudentCard({ student, group, onSelect, selected }) {
    const tasks = group?.tasks || [];
    const studentTasks = tasks.filter(t => !t.assigned_to?.length || t.assigned_to.includes(student.id));
    const doneTasks = studentTasks.filter(t => t.completed_by?.includes(student.id));
    const pendingTasks = studentTasks.filter(t => !t.completed_by?.includes(student.id));

    return (
        <div className={`relative flex flex-col p-4 justify-start items-center gap-2 bg-muted rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer border border-border hover:bg-primary-100 ${selected ? 'bg-primary-200 hover:bg-accent' : ''}`}
            onClick={onSelect}>
            <Avatar user={student} />
            <p className="text-sm font-medium text-foreground truncate">
                {student.first_name} {student.last_name}
            </p>
            {studentTasks.length > 0 && (
                <div className="absolute left-2 top-2 flex flex-wrap gap-1 justify-center">
                    {doneTasks.map(t => (
                        <div key={t.id} className="relative group/dot">
                            <div className="w-2 h-2 rounded-full bg-ghgreen" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap hidden group-hover/dot:block z-50 pointer-events-none">
                                {t.title}
                            </div>
                        </div>
                    ))}
                    {pendingTasks.map(t => (
                        <div key={t.id} className="relative group/dot">
                            <div className="w-2 h-2 rounded-full bg-ghpurple/80" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap hidden group-hover/dot:block z-50 pointer-events-none">
                                {t.title}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}