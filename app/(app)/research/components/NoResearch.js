import Button from "@/components/Button";
import { researchActions } from "@/utils/store/useResearch";
import { useTime } from "@/utils/store/useTime";

export default function NoResearch() {
    const currTerm = useTime(state => state.currTerm)
    
    return (
        <div className="flex flex-col justify-center items-center h-full gap-2">
            <div className="text-2xl font-bold">אוי לא אין לך חקר בתקופת {currTerm.name}!</div>
            <Button onClick={researchActions.newResearch}>ליצור חקר חדש</Button>
        </div>
    )
}