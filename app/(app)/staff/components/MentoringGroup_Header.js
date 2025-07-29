import { Users } from "lucide-react";

export default function MentoringGroup_Header({ group, styles }) {
    return (
        <div className={`${styles.header} p-4 border-b`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{group.name}</h3>
                {group.students && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{group.students.length}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}