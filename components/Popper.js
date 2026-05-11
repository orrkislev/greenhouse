import { AnimatePresence, motion } from "motion/react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export default function usePopper(props = {onOpen: () => {}, onClose: () => {}}) {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState(null)
    const baseRef = useRef(null)

    const open = () => {
        setIsOpen(true)
        if (baseRef.current) {
            const { x, y } = baseRef.current.getBoundingClientRect()
            setPosition({ x, y })
        } else {
            setPosition(null)
        }
        props.onOpen?.()
    }
    const close = () => {
        setIsOpen(false)
        props.onClose?.()
    }

    const Popper = ({ children, className = '' }) => {
        const popperRef = useRef(null)
        const [offset, setOffset] = useState({ x: 0, y: 0 })

        // Runs after every render so the dialog stays on-screen when its content
        // changes size (e.g. expanding help columns). The prev-check prevents loops.
        useEffect(() => {
            if (!popperRef.current) return
            const bounds = popperRef.current.getBoundingClientRect()
            const margin = 50
            let x = 0, y = 0
            if (bounds.left < margin) x = -bounds.left + margin
            else if (bounds.right > window.innerWidth - margin) x = window.innerWidth - bounds.right - margin
            if (bounds.top < margin) y = -bounds.top + margin
            else if (bounds.bottom > window.innerHeight - margin) y = window.innerHeight - bounds.bottom - margin
            setOffset(prev => prev.x === x && prev.y === y ? prev : { x, y })
        })

        return createPortal(
            <AnimatePresence >
                {isOpen && (
                    <motion.div
                        className={`fixed top-0 left-0 w-full h-full z-[9999] bg-black/20 backdrop-blur-[2px] ${position ? '' : 'flex justify-center items-center'} ${className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <div className="fixed top-0 left-0 w-full h-full" onClick={close} />
                        <motion.div layout="size" className="fixed bg-white p-4 rounded-lg border border-stone-300 shadow-sm"
                            ref={popperRef}
                            initial={{ y: 20, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.98 }}
                            transition={{ duration: popperRef.current ? 0.2 : 0, ease: 'easeInOut' }}
                            style={position ? {
                                top: position?.y + 10 + offset.y,
                                left: position?.x + 10 + offset.x,
                            } : {}}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )
    }

    return { isOpen, open, close, Popper, baseRef }
}
