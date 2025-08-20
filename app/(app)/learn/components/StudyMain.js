import { studyActions, useStudy } from "@/utils/store/useStudy"
import Image from "next/image"
import Link from "next/link"

export default function StudyMain() {
    const paths = useStudy(state => state.paths)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
                {paths.map(path => (
                    <Link key={path.id} className="bg-white border border-stone-200 p-4 rounded-md min-w-64 min-h-64 relative cursor-pointer hover:bg-stone-100 hover:border-stone-300 transition-all duration-300" href={`/learn?id=${path.id}`}>
                        <div className="w-full aspect-[3/2] relative">
                            <Image
                                src={path.image || '/studyPath.webp'}
                                alt={path.name}
                                fill
                                className="object-contain object-center rounded-md"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>
                        <div className="text-2xl font-bold mt-2">{path.name}</div>
                        <div className="text-sm text-stone-500 mt-2">{path.description}</div>
                    </Link>
                ))}
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md w-64 relative cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-300"
                onClick={() => studyActions.addNewPath()}
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