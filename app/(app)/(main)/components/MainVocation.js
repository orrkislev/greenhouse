import Box2 from "@/components/Box2";
import { Briefcase } from "lucide-react";
import Image from "next/image";
import { useVocation } from "@/utils/store/useVocation";
import Link from "next/link";
import Button from "@/components/Button";

export default function MainVocation() {
    const jobs = useVocation();

    const job = jobs.length > 0 ? jobs[jobs.length - 1] : null;

    return (
        <Box2 label="תעסוקה" LabelIcon={Briefcase} className="min-h-[100px] col-span-2">
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
            <Link href="/vocation" className="absolute bottom-2 left-2">
                <Button>
                    <Briefcase className="w-4 h-4" />
                    תעסוקה
                </Button>
            </Link>
        </Box2>
    )
}