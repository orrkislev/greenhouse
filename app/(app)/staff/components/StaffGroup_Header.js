import { IconButton } from "@/components/Button";
import SmartText from "@/components/SmartText";
import { groupsActions } from "@/utils/store/useGroups";
import { Monitor, Users } from "lucide-react";
import Link from "next/link";

export default function StaffGroup_Header({ group }) {
    return (
        <div className="p-2 md:p-4">
            <div className="flex items-center justify-between">
                <div>
                    {group.type == 'club' ? (
                        <SmartText text={group.name} onEdit={(val) => groupsActions.updateGroup(group, { name: val })} className="text-lg md:text-2xl font-bold border-none text-center font-semibold" />
                    ) : (
                        <h3 className="text-lg md:text-xl font-bold">
                            {group.name}
                        </h3>
                    )}
                    {/* <Link href={`/screen/${group.id}`}>
                        <IconButton icon={Monitor} />
                    </Link> */}
                </div>
                {group.students && (
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center gap-1 md:gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{group.students.length}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}