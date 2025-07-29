export function ResizeHandle({ visible, onMouseDown }) {
    if (!visible) return null;

    return (
        <div 
            className="absolute bottom-0 right-0 w-full p-1 px-2 cursor-row-resize z-10"
            onMouseDown={onMouseDown}
        >
            <div className="w-full h-[3px] rounded-full bg-white bg-white/50" />
        </div>
    );
}