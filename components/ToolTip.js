import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Tooltip component:
// used to show a tooltip on hover
// use it like this:
// <wrapperRef>
// <Tooltip side="right">this is a tooltip</Tooltip>
// </wrapperRef>
// hovering the parent would show the tooltip
// props:
// side: "right" | "left" | "top" | "bottom"
// attachToMouse: boolean (default: false - tooltip will be attached to the mouse position, while hovering the parent)
// className: string (default: "")
// children: ReactNode

export default function Tooltip({ side = 'top', attachToMouse = false, className = '', children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef(null);
    const parentRef = useRef(null);

    useEffect(() => {
        const parent = tooltipRef.current?.parentElement;
        if (!parent) return;

        parentRef.current = parent;

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        const handleMouseMove = (e) => {
            if (attachToMouse && isVisible) {
                const offsets = {
                    'left': [-20, 0],
                    'right': [20, 0],
                    'top': [0, -20],
                    'bottom': [0, 20]
                };
                setPosition({ x: e.clientX + offsets[side][0], y: e.clientY + offsets[side][1] });
            }
        };

        parent.addEventListener('mouseenter', handleMouseEnter);
        parent.addEventListener('mouseleave', handleMouseLeave);

        if (attachToMouse) {
            parent.addEventListener('mousemove', handleMouseMove);
        }


        return () => {
            parent.removeEventListener('mouseenter', handleMouseEnter);
            parent.removeEventListener('mouseleave', handleMouseLeave);
            if (attachToMouse) {
                parent.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [attachToMouse, isVisible]);

    useEffect(() => {
        if (isVisible && !attachToMouse && parentRef.current && tooltipRef.current) {
            const parentRect = parentRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let x = 0;
            let y = 0;

            switch (side) {
                case 'top':
                    x = parentRect.left + parentRect.width / 2 - tooltipRect.width / 2;
                    y = parentRect.top - tooltipRect.height - 8;
                    break;
                case 'bottom':
                    x = parentRect.left + parentRect.width / 2 - tooltipRect.width / 2;
                    y = parentRect.bottom + 8;
                    break;
                case 'left':
                    x = parentRect.left - tooltipRect.width - 8;
                    y = parentRect.top + parentRect.height / 2;
                    break;
                case 'right':
                    x = parentRect.right + 8;
                    y = parentRect.top + parentRect.height / 4;
                    break;
            }

            setPosition({ x, y });
        }
    }, [isVisible, side, attachToMouse]);

    const getArrowClasses = () => {
        const base = 'absolute w-2 h-2 bg-white border border-gray-300 border-t-0 border-l-0';
        const positions = {
            top: '-bottom-1 left-1/2 -translate-x-1/2',
            bottom: '-top-1 left-1/2 -translate-x-1/2',
            left: '-right-1 top-1/2 -translate-y-1/2',
            right: '-left-1 top-1/2 -translate-y-1/2 rotate-135'
        };
        return `${base} ${positions[side]}`;
    };

    const tooltipContent = (
        <div
            className={`fixed z-[9999] pointer-events-none transition-opacity duration-200 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
        >
            <div className="relative bg-white border border-gray-300 rounded px-2 py-1 text-xs leading-tight text-gray-700 whitespace-nowrap">
                {children}
                <div className={getArrowClasses()} />
            </div>
        </div>
    );

    return (
        <>
            <div ref={tooltipRef} className="hidden" />
            {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
        </>
    );
}
