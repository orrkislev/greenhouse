import { tw } from "@/utils/tw";
import { useProject } from "@/utils/store/useProject";

const MasterSection = tw`flex-1 p-4 border border-gray-300
    ${props => props.$alert ? 'bg-red-400 flashing' : ''}`;

export default function ProjectMaster() {
    const master = useProject((state) => state.project?.master);

    return (
        <MasterSection $alert={!master}>
            {master ? (
                <h3 className="text-center text-gray-700 font-medium">המאסטר שלי - {master.firstName} {master.lastName}</h3>
            ) : (
                <h3 className="text-center text-gray-700 font-medium">אין מאסטר</h3>
            )}
        </MasterSection>
    )
}