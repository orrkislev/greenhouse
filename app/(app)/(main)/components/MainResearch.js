import Box2 from "@/components/Box2";
import { useResearch } from "@/utils/store/useResearch";
import { Brain } from "lucide-react";
import Link from "next/link";
import Button from "@/components/Button";

export default function MainResearch() {
    const research = useResearch()

    return (
        <Box2 label="חקר" LabelIcon={Brain} className="col-span-2 min-h-[100px]">
            {!research ? (
                <div className="text-stone-400 text-center text-sm ">
                    אין לי חקר כרגע
                </div>
            ) : (
                <div>
                    החקר שלי ב
                    <span className="font-bold">{research.title}</span>
                </div>
            )}
            <Link href="/research" className="absolute bottom-2 left-2">
                <Button>
                    <Brain className="w-4 h-4" />
                    חקר
                </Button>
            </Link>
        </Box2>
    )
}