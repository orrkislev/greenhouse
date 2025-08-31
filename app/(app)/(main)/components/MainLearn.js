import Box2 from "@/components/Box2";
import { useStudyPaths } from "@/utils/store/useStudy";
import Link from "next/link";
import Image from "next/image";

export default function MainLearn() {
    const paths = useStudyPaths();
    return (
        <Box2 label="למידה" className="flex-1">
            <div className="flex flex-col gap-2">
                {paths.map((path) => (
                    <Link href={`/learn/?id=${path.id}`} key={path.id}>
                        <div className="group/path cursor-pointer">
                            <div className="w-full aspect-[7/3] relative">
                                <Image src={path.image} alt={path.name} fill className="object-cover" />
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-transparent group-hover/path:bg-stone-900/30 transition-all duration-200">
                                    <h1 className="font-bold p-2 bg-white group-hover/path:text-stone-900 group-hover/path:scale-105 transition-all duration-200">{path.name}</h1>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Box2>
    )
}