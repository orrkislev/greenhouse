import { X } from "lucide-react";

export default function WithLabel({ label, Icon, children, className, onClose }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="flex justify-between items-center">
                <div className="text-xs text-stone-500 flex items-center gap-1">
                    {Icon && <Icon className="w-4 h-4" />}  
                    {label}
                </div>
                {onClose && (
                    <div className="p-2 hover:bg-stone-100 rounded-full cursor-pointer transition-colors" onClick={onClose}>
                        <X className="w-4 h-4 text-stone-500" />
                    </div>
                )}
            </div>
            <div className="pr-2">{children}</div>
        </div>
    )
}