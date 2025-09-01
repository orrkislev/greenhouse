import { IconButton } from "@/components/Button";
import { Monitor, Users } from "lucide-react";
import Link from "next/link";

export default function StaffGroup_Header({ group }) {
    return (
        <div className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">{group.name}</h3>
                    <Link href={`/screen/${group.id}`}>
                        <IconButton icon={Monitor} />
                    </Link>
                </div>
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