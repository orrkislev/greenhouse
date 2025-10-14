import Box2 from "@/components/Box2";
import CoverZoomCard from "@/components/CoverZoomCard";
import { useStudyPaths } from "@/utils/store/useStudy";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function MainStudy() {
    const paths = useStudyPaths();

    return (
        <Box2 label="למידה" className="flex-1" LabelIcon={BookOpen}>
            <div className="flex flex-col gap-2">
                {paths.map((path) => (
                    // Fixed: cover background with smooth zoom on hover, keeps inner overlay/content working
                    <CoverZoomCard href={`/study/?id=${path.id}`} imageUrl={path.metadata?.image} label={path.title} key={path.id} />
                    // <Link href={`/study/?id=${path.id}`} key={path.id}>
                    //     <div className="group/path cursor-pointer">
                    //         <div className="w-full aspect-[7/3] relative overflow-hidden">
                    //             {/* Background layer (cover + zoom on hover) */}
                    //             <div
                    //                 className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out will-change-transform group-hover/path:scale-[1.12]"
                    //                 style={{
                    //                     backgroundImage: path.metadata?.image
                    //                         ? `url(${path.metadata.image})`
                    //                         : 'linear-gradient(to right, #f7797d, #FBD786, #C6FFDD)',
                    //                     transformOrigin: 'center',
                    //                 }}
                    //             />

                    //             {/* Overlay content on top */}
                    //             <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-colors duration-200 group-hover/path:bg-stone-900/30">
                    //                 <h1 className="font-bold p-2 bg-white transition-transform transition-colors duration-200 group-hover/path:text-stone-900 group-hover/path:scale-105">
                    //                     {path.title}
                    //                 </h1>
                    //             </div>
                    //         </div>
                    //     </div>
                    // </Link>

                ))}
            </div>
        </Box2>
    )
}