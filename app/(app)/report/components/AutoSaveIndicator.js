'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Save, Clock } from 'lucide-react'

export default function AutoSaveIndicator({ isDirty, canEdit }) {
    const [justSaved, setJustSaved] = useState(false);
    const prevDirty = useRef(false);

    useEffect(() => {
        if (prevDirty.current && !isDirty) {
            setJustSaved(true);
            const t = setTimeout(() => setJustSaved(false), 2000);
            return () => clearTimeout(t);
        }
        prevDirty.current = isDirty;
    }, [isDirty]);

    if (!canEdit) return null;

    return (
        <AnimatePresence>
            {(isDirty || justSaved) && (
                <motion.div
                    key={isDirty ? 'dirty' : 'saved'}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="fixed top-2 right-2 z-[200] pointer-events-none"
                >
                    {isDirty ? (
                        <div className="relative w-7 h-7 text-amber-500">
                            <Save className="w-7 h-7" />
                            <Clock className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full text-amber-600" />
                        </div>
                    ) : (
                        <div className="text-green-600">
                            <Save className="w-7 h-7" />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
