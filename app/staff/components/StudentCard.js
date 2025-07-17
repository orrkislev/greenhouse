export function StudentCard({ student, mode, styles, onSelect}) {
    return (
        <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
            onClick={onSelect}>
            <div className="text-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                        {student.firstName?.charAt(0) || '?'}
                    </span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">
                    {student.firstName} {student.lastName}
                </p>
                {mode === "schedule" && <StudentSchedule student={student} />}
                {mode === "project" && (
                    <p className={`text-xs ${styles.accent} mt-1`}>
                        פרויקט
                    </p>
                )}
            </div>
        </div>
    );
}

function StudentSchedule({ student }) {

    if (!student.events || student.events.length === 0) {
        return (
            <div className="text-xs text-gray-500">
                אין אירועים
            </div>
        );
    }

    return (
        <div className="text-xs">
            {student.events.map(event => (
                <div key={event.id} className="flex justify-between py-1 border-b border-gray-200">
                    <span>{event.title}</span>
                    <span className="text-gray-500">{event.start}</span>
                </div>
            ))}
        </div>
    );
}