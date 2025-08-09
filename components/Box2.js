export default function Box2({ children, label, className}) {
    return (
        <div className={`bg-white flex flex-col gap-2 p-4 rounded-b-lg border border-stone-300 relative ${label ? 'pt-8' : ''} ${className}`}>
            {label && (
                <div className="text-sm text-stone-500 border-b border-l border-stone-300 absolute top-0 right-0 px-1 text-xs">
                    {label}
                </div>
            )}
            {children}
        </div>
    )
}