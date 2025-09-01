export default function Box2({ children, label, className, description }) {
    return (
        <div className={`bg-white rounded-b-lg border border-stone-300 ${className}`}>
            {label && (
                <div className="w-[80%] flex gap-2">
                    <div className="text-sm text-stone-500 border-b border-l border-stone-300 px-1 text-xs">
                        {label}
                    </div>
                    {description && (
                        <div className="text-xs text-stone-500 px-1 text-xs">
                            {description}
                        </div>
                    )}
                </div>
            )}
            <div className="p-4 flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}