'use client'

import { useToasts } from "@/utils/store/useToasts";
import { toastsActions } from "@/utils/store/useToasts";
import { X } from "lucide-react";
import { useState } from "react";   

export default function Toasts() {
    const toasts = useToasts((state) => state.toasts);
    return (
        <div className="fixed top-2 left-2 p-4 flex flex-col gap-1 z-999">
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
    return (
        <div className='p-2 rounded-md text-xs bg-red-300 text-neutral-900 cursor-pointer toast flex justify-between gap-4 items-center text-left max-w-xs'
            onClick={() => setExpanded(!expanded)}
        >
            {message}
            <X className="w-3 h-3" onClick={(e) => {
                e.stopPropagation();
                toastsActions.removeToast(toast);
            }} />
        </div>
    );
}