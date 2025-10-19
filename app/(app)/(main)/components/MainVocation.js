import Box2 from "@/components/Box2";
import { Briefcase } from "lucide-react";
import Image from "next/image";
import { useVocation } from "@/utils/store/useVocation";

export default function MainVocation() {
    const jobs = useVocation();

    const job = jobs.length > 0 ? jobs[jobs.length - 1] : null;

    return (
        <Box2 label="תעסוקה" LabelIcon={Briefcase} className="min-h-[100px]">
            {job ? (
                <div className="text-center text-sm">
                    התעסוקה שלי ב
                    <span className="font-bold">{job.place_of_work}</span>
                </div>
            ) : (
                <div className="text-stone-400 text-center text-sm ">
                    אין לי תעסוקה פעילה
                </div>
            )}
        </Box2>
    )
}