import { AnimatePresence, motion } from "motion/react"
import { useState, useRef, useEffect } from "react"

export default function usePopper(props = {}) {
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
    }
    const close = () => setIsOpen(false)

    const Popper = ({ children, className = '' }) => {
        const popperRef = useRef(null)
        const [offset, setOffset] = useState({ x: 0, y: 0 })

        useEffect(() => {
            // make sure its fully on the screen, with some margin
            if (popperRef.current) {
                const bounds = popperRef.current.getBoundingClientRect()
                const margin = 50
                if (bounds.left < margin) {
                    setOffset({ x: -bounds.left + margin, y: 0 })
                }
                if (bounds.right > window.innerWidth - margin) {
                    setOffset({ x: window.innerWidth - bounds.right - margin, y: 0 })
                }
                if (bounds.top < margin) {
                    setOffset({ x: 0, y: -bounds.top + margin })
                }
                if (bounds.bottom > window.innerHeight - margin) {
                    setOffset({ x: 0, y: window.innerHeight - bounds.bottom - margin })
                }
            }
        }, [popperRef])

        return ( 
            <AnimatePresence >
                {isOpen && (
                    <motion.div
                        className={`fixed top-0 left-0 w-full h-full z-[9999] backdrop-blur-[2px] ${position ? '' : 'flex justify-center items-center'} ${className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <div className="fixed top-0 left-0 w-full h-full" onClick={close} />
                        <motion.div className="fixed bg-white p-4 rounded-lg border border-stone-300 shadow-sm"
                            ref={popperRef}
                            initial={{ y: 20, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.98 }}
                            transition={{ duration: .2, ease: 'easeInOut' }}
                            style={position ? {
                                top: position?.y + 10 + offset.y,
                                left: position?.x + 10 + offset.x,
                            } : {}}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        )
    }

    return { isOpen, open, close, Popper, baseRef }
}