import { tw } from "@/utils/tw";
import { useProject } from "@/utils/store/useProject";
import Avatar from "@/components/Avatar";

const MasterSection = tw`flex-1 p-4 border border-stone-300
    ${props => props.$alert ? 'bg-red-400 flashing' : ''}`;

export default function ProjectMaster() {
    const master = useProject((state) => state.project?.master);

    return (
        <MasterSection $alert={!master}>
            {master ? (
                <div className="flex items-center gap-2 justify-center" >
                    <Avatar userId={master.id}  />
                    <h3 className="text-center text-stone-700 font-medium">המאסטר שלי - {master.firstName} {master.lastName}</h3>
                </div>
            ) : (
                <h3 className="text-center text-stone-700 font-medium">אין מאסטר</h3>
            )}
        </MasterSection>
    )
}