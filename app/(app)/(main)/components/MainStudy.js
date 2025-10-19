import Box2 from "@/components/Box2";
import Button from "@/components/Button";
import { useStudyPaths } from "@/utils/store/useStudy";
import { BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MainStudy() {
    const paths = useStudyPaths();
    const [pathIndex, setPathIndex] = useState(0);

    useEffect(() => {
        if (paths.length > 0) {
            setPathIndex(0);
            const interval = setInterval(() => {
                setPathIndex(prev => (prev + 1) % (paths.length + 1));
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [paths]);

    const path = pathIndex != null ? paths[pathIndex] : null;
    const step = path ? path.steps.find(step => step.status == 'todo') : null;

    return (
        <Box2 label="למידה" className="col-span-2" LabelIcon={BookOpen}>
            <AnimatePresence>
                <motion.div key={pathIndex} className="absolute top-6 left-2 right-2 w-full flex gap-2 min-h-[200px]"
                    initial={{ opacity: 0, x: 40, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <div className="flex-1 p-4">
                        <div 
                            style={{backgroundImage:`url(${path ? (path.metadata?.image || '/images/study.png') : '/images/question.png'})`}} 
                            className={`h-full bg-cover bg-center rounded-md border border-stone-200 ${pathIndex % 2 == 0 ? 'rotate-2' : '-rotate-2'} transition-all duration-300`} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 justify-center">
                        <div className="text-lg font-bold">{path ? path.title : 'איזה תחום מענין אותי ללמוד?'}</div>
                        <div className="text-sm text-stone-500">{path ? path.description : 'מה בעצם אני רוצה ללמוד?'}</div>
                        <div className="text-sm text-stone-500">{step ? step.title : 'מה הדבר הראשון שאני אלמד?'}</div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <Link href="/study" className="absolute bottom-2 left-2 z-10 bg-white">
                <Button>
                    <BookOpen className="w-4 h-4" />
                    למידה
                </Button>
            </Link>
        </Box2>
    )
}