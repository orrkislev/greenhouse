export default function Box2({ children, label, className}) {
    return (
        <div className={`${className} flex flex-col gap-2 p-4 border border-gray-300 relative ${label ? 'pt-8' : ''}`}>
            {label && (
                <div className="text-sm text-gray-500 border-b border-l border-gray-300 absolute top-0 right-0 px-1 text-xs">
                    {label}
                </div>
            )}
            {children}
        </div>
    )
}