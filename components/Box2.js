
export default function Box2({ children, label, className, description, LabelIcon }) {
    return (
        <div className={`bg-white relative rounded-xl border border-stone-300 group/box transition-all hover:border-stone-400 ${className}`}>
            {label && (
                <div className="w-[80%] flex gap-2">
                    <div className="flex gap-1 items-center text-sm text-stone-500 border-b border-l border-stone-300 px-1 text-xs group-hover/box:text-stone-800 transition-all duration-300">
                        {LabelIcon && <LabelIcon className='w-0 group-hover/box:w-3 h-3 transition-all duration-300' />}                        
                        {label}
                    </div>
                    {description && (
                        <div className="text-xs text-stone-500 px-1 text-xs">
                            {description}
                        </div>
                    )}
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    )
}

export function Card({ children, className }) {
    return (
        <div className={`bg-white rounded-xl p-4 border border-stone-300 ${className}`}>
            {children}
        </div>
    )
}