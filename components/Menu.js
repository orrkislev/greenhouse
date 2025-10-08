'use client'

import usePopper from "./Popper"
import { IconButton } from "./Button"
import { Ellipsis } from "lucide-react"

export default function Menu({ children, className, icon }) {
    const { Popper, baseRef, open } = usePopper()
    return (
        <>
            <IconButton icon={icon || Ellipsis} onClick={open} ref={baseRef} className={className} />
            <Popper>
                {children}
            </Popper>
        </>
    )
}


export function MenuTitle({ children, className }) {
    return (
        <div className={`text-sm font-bold ${className}`}>{children}</div>
    )
}
export function MenuList({ children, className  }) {
    return (
        <div className={`rounded-md flex flex-col gap-2 text-xs ${className}`}>
            {children}
        </div>
    )
}
export function MenuItem(props) {
    return (
        <div className={`flex gap-2 pl-4 items-center text-stone-500 cursor-pointer hover:text-stone-500 hover:bg-stone-200 rounded-md p-1 transition-all truncate ${props.className}`} onClick={props.onClick}>    
            {props.icon && <props.icon className='w-3 h-3' />}
            {props.title && <div className='text-xs'>{props.title}</div>}
        </div>
    )
}
export function MenuSeparator() {
    return (
        <div className='h-px w-full bg-stone-200'></div>
    )
}