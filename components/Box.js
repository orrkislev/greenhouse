import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"

export default function Box(props) {
    return (
        <div className={cn(
            props.className,
            'border border-stone-300 p-2 group relative hover:z-30',
        )}>
            {props.label && (
                <div className="p-1 text-xs bg-white z-1 absolute -top-px right-px group-hover:translate-x-[100%] pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100  transition-all  delay-300 border-y border-r border-stone-300">
                    <span className="opacity-0 group-hover:opacity-100 delay-300"> {props.label} </span>
                </div>
            )}
            <div className="z-2">
                {props.children}
            </div>
            {props.onEdit && (
                <div className="z-3 absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity delay-300 cursor-pointer hover:bg-stone-200 rounded-full p-1"
                    onClick={props.onEdit}>
                    <Pencil className="w-4 h-4" />
                </div>
            )}
        </div>
    )
}