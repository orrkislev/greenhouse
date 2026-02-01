'use client'

import { useToasts } from "@/utils/store/useToasts";
import { toastsActions } from "@/utils/store/useToasts";
import { X } from "lucide-react";
import { useState } from "react";   

export default function Toasts() {
    const toasts = useToasts((state) => state.toasts);
    return (
        <div className="fixed top-2 left-2 flex flex-col gap-1 z-999">
            {toasts.map((toast, index) => (
                <Toast key={toast.id + index} toast={toast} />
            ))}
            <style jsx>{`
                @keyframes toast-in {
                    from {
                        opacity: 0;
                        transform: translateY(-100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .toast {
                    animation: toast-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

function Toast({ toast }) {
    const [expanded, setExpanded] = useState(false);
    const message = expanded ? toast.message : toast.message.length > 30 ? toast.message.substring(0, 30) + '...' : toast.message;

    const bgColor = {
        success: 'bg-green-400',
        error: 'bg-red-400',
        alert: 'bg-blue-400',
    }[toast.type] || 'bg-gray-400';

    console.log(toast)

    return (
        <div className={`p-2 rounded-md text-xs ${bgColor} text-neutral-900 cursor-pointer toast flex justify-between gap-4 items-center text-left max-w-xs`}
            onClick={() => setExpanded(!expanded)}
        > 
            {toast.context && <div className="text-xs text-neutral-900">{toast.context}</div>}
            {message}
            <X className="w-3 h-3" onClick={(e) => {
                e.stopPropagation();    
                toastsActions.removeToast(toast);
            }} />
        </div>
    );
}