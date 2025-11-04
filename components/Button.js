import { tw } from "@/utils/tw"

const ButtonDiv = tw.button`
    inline-flex items-center justify-between gap-2 p-2 rounded-sm
    whitespace-nowrap text-xs font-medium 
    border border-stone-300 text-stone-700
    hover:bg-stone-200 hover:border-stone-400 hover:text-stone-800
    transition-all duration-200 group/button cursor-pointer
    disabled:pointer-events-none disabled:opacity-50 
    [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 
    outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 
    dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:border-input dark:hover:bg-input/50
    data-[role=edit]:text-indigo-800 data-[role=edit]:border-indigo-300 data-[role=edit]:hover:bg-indigo-100 data-[role=edit]:hover:border-indigo-400
    data-[role=delete]:text-rose-800 data-[role=delete]:border-rose-300 data-[role=delete]:hover:bg-rose-100 data-[role=delete]:hover:border-rose-400
    data-[role=save]:text-emerald-800 data-[role=save]:border-emerald-300 data-[role=save]:hover:bg-emerald-100 data-[role=save]:hover:border-emerald-400
    data-[role=cancel]:text-stone-800 data-[role=cancel]:border-stone-300 data-[role=cancel]:hover:bg-stone-100 data-[role=cancel]:hover:border-stone-400
    data-[role=close]:text-stone-800 data-[role=close]:border-stone-300 data-[role=close]:hover:bg-stone-100 data-[role=close]:hover:border-stone-400
    data-[role=new]:text-green-800 data-[role=new]:border-green-300 data-[role=new]:hover:bg-green-100 data-[role=new]:hover:border-green-400
    data-[role=main-new]:text-green-800 data-[role=main-new]:border-green-600 data-[role=main-new]:bg-green-100 data-[role=main-new]:hover:bg-green-200 data-[role=main-new]:hover:border-green-400
    data-[active=false]:grayscale-100 data-[active=false]:opacity-50 data-[active=false]:hover:opacity-30
    `

export default function Button({ children, ...props }) {
    return <ButtonDiv {...props}>{children}</ButtonDiv>
}

export function IconButton({small, ...props}) {
    return <div {...props} className={`${props.className} ${small ? 'p-1' : 'p-2'} hover:bg-stone-100 rounded-full cursor-pointer transition-colors ${props.className}`}>
        <props.icon className={`${props.small ? 'w-3 h-3' : 'w-4 h-4'} `} />
    </div>
}


export function ButtonGroup({ children, className}) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex gap-4 rounded-full p-1 bg-stone-100">
                {children}
            </div>
        </div>
    )
}

export function ButtonGroupItem({ children, ...props }) {
    return <div {...props} className={`${props.className} ${props.small ? 'text-xs' : 'text-sm'} p-1 rounded-full hover:bg-stone-400 cursor-pointer transition-colors ${props.active ? 'bg-stone-300 font-bold' : ''}`}>
        {children}
    </div>
}