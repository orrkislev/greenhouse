import Button from "@/components/Button";
import { researchActions } from "@/utils/store/useResearch";

export default function NoResearch() {
    
    return (
        <div className="flex flex-col justify-center items-center h-full gap-2">
            <div className="text-2xl font-bold">אוי לא אין לך חקר!</div>
            <Button onClick={researchActions.newResearch}>ליצור חקר חדש</Button>
        </div>
    )
}