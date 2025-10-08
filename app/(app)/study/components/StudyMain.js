import { studyActions, useStudy } from "@/utils/store/useStudy"
import Image from "next/image"
import Link from "next/link"

export default function StudyMain() {
    const paths = useStudy(state => state.paths)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
                {paths.map(path => (
                    <Link key={path.id} className="bg-white border border-stone-200 p-4 rounded-md min-w-64 relative cursor-pointer hover:bg-stone-100 hover:border-stone-300 transition-all duration-300" href={`/study?id=${path.id}`}>
                        <div className="w-full aspect-[3/2] relative" style={{ backgroundImage: path.metadata?.image ? `url(${path.metadata?.image})` : 'linear-gradient(to right, #f7797d, #FBD786, #C6FFDD)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-transparent group-hover/image:bg-stone-900/30 transition-all duration-200">
                                <h1 className="font-bold p-2 bg-white group-hover/image:text-stone-900 group-hover/image:scale-105 transition-all duration-200">{path.title}</h1>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md w-64 relative cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-300"
                onClick={() => studyActions.addPath()}
            >
                <div className="w-full aspect-[5/2] relative">
                    <Image
                        src="/studyPath.webp"
                        alt="studyPath"
                        fill
                        className="object-cover object-center rounded-md"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="text-2xl font-bold mt-2">מסלול למידה חדש</div>
            </div>
        </div>
    )
}