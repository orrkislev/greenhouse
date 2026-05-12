import { AnimatePresence, motion } from "motion/react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"

// Module-level component so React never sees a new type on parent re-renders.
// If it were defined inside usePopper, every parent re-render would produce a new
// function identity → React unmounts+remounts the dialog → enter animation replays
// and AnimatePresence can't run exit animations.
function PopperPortal({ isOpen, position, closeRef, children, className = '' }) {
    const popperRef = useRef(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    const correctOffset = useCallback(() => {
        if (!popperRef.current) return
        const bounds = popperRef.current.getBoundingClientRect()
        const margin = 50
        let x = 0, y = 0
        if (bounds.left < margin) x = -bounds.left + margin
        else if (bounds.right > window.innerWidth - margin) x = window.innerWidth - bounds.right - margin
        if (bounds.top < margin) y = -bounds.top + margin
        else if (bounds.bottom > window.innerHeight - margin) y = window.innerHeight - bounds.bottom - margin
        setOffset(prev => prev.x === x && prev.y === y ? prev : { x, y })
    }, [])

    // Correct position once when dialog opens (not on every render — that caused
    // oscillation with the layout animation, which changes getBoundingClientRect()
    // on every frame and would trigger setOffset → re-render → repeat).
    useEffect(() => {
        if (isOpen) correctOffset()
    }, [isOpen, correctOffset])

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={`fixed top-0 left-0 w-full h-full z-[9999] bg-black/20 backdrop-blur-[2px] ${position ? '' : 'flex justify-center items-center'} ${className}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    <div className="fixed top-0 left-0 w-full h-full" onClick={() => closeRef.current()} />
                    <motion.div
                        layout="size"
                        className="fixed bg-white p-4 rounded-lg border border-stone-300 shadow-sm"
                        ref={popperRef}
                        initial={{ y: 20, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.98 }}
                        transition={{
                            layout: { duration: 0.2, ease: 'easeInOut' },
                            default: { duration: 0.2, ease: 'easeInOut' },
                        }}
                        style={position ? {
                            top: position.y + 10 + offset.y,
                            left: position.x + 10 + offset.x,
                        } : {}}
                        onLayoutAnimationComplete={correctOffset}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}

export default function usePopper(props = {}) {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState(null)
    const baseRef = useRef(null)

    // Keep latest callbacks in refs so stable open/close functions don't go stale.
    const onOpenRef = useRef(props.onOpen)
    const onCloseRef = useRef(props.onClose)
    onOpenRef.current = props.onOpen
    onCloseRef.current = props.onClose

    // Stable refs for the memoized Popper to read current state.
    const isOpenRef = useRef(isOpen)
    const positionRef = useRef(position)
    const closeRef = useRef(null)
    isOpenRef.current = isOpen
    positionRef.current = position

    const open = useCallback(() => {
        setIsOpen(true)
        if (baseRef.current) {
            const { x, y } = baseRef.current.getBoundingClientRect()
            setPosition({ x, y })
        } else {
            setPosition(null)
        }
        onOpenRef.current?.()
    }, [])

    const close = useCallback(() => {
        setIsOpen(false)
        onCloseRef.current?.()
    }, [])
    closeRef.current = close

    // useMemo with empty deps keeps Popper as the same function object across
    // parent re-renders. The component reads live values from the refs above.
    const Popper = useMemo(() => {
        return function Popper({ children, className = '' }) {
            return (
                <PopperPortal
                    isOpen={isOpenRef.current}
                    position={positionRef.current}
                    closeRef={closeRef}
                    className={className}
                >
                    {children}
                </PopperPortal>
            )
        }
    }, []) // intentionally empty — Popper reads from stable refs, never needs recreation

    return { isOpen, open, close, Popper, baseRef }
}
