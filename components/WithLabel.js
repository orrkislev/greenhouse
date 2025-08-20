export default function WithLabel({ label, children }) {
    return <div className="flex flex-col gap-1">
        <div className="text-xs text-stone-500">{label}</div>
        <div className="pr-2">{children}</div>
    </div>
}