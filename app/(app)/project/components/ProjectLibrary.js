import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Masonry, usePositioner } from "masonic";
import { projectActions, useProject } from "@/utils/store/useProject";
import { Plus, Shapes, Trash } from "lucide-react";
import Microlink from '@microlink/react'
import { AutoSizeTextarea } from "@/components/SmartText";
import Image from "next/image";


export default function ProjectLibrary() {
    const library = useProject((state) => state.library);

    useEffect(() => {
        projectActions.loadProjectLibrary();
    }, [])

    let items = ['new item', ...library];
    items = items.map((item, index) => ({ id: index, ...item }));

    return (
        <div className="w-full h-full">
            <div className="flex gap-2">
                <Shapes className="w-4 h-4 text-stone-500" />
                <p className="text-sm text-stone-500">חומרים</p>
            </div>
            <Masonry
                key={library.length}
                items={items}
                render={MasonryCard}
                columnGutter={16}
                rowGutter={16}
                style={{ direction: "rtl" }}
            />
        </div>
    )
}

function MasonryCard({ index, data, width }) {
    const [newItemText, setNewItemText] = useState("משהו חדש");
    const onSubmit = (e) => {
        e.preventDefault();
        projectActions.addLibraryItem({ text: newItemText });
    }
    const onBlur = (text) => {
        projectActions.updateLibraryItem(index - 1, { text });
    }

    const content = (data) => {
        if (data.text) {
            const words = data.text.split(" ");
            const urlWord = words.find(word => word.includes("http") || word.includes("www."));
            if (urlWord) return <Microlink url={urlWord} style={{
                '--microlink-max-width': (width - 52) + 'px'
            }} />
            return <AutoSizeTextarea value={data.text} className="border-none resize-none text-sm" name="text" onFinish={onBlur} />
        }
        if (data.url) {
            return <Image src={data.url} alt="library item" width={width - 52} height={width - 52} />
        }
    }


    return (
        <div className={`w-full h-full border border-stone-400 rounded-md p-2 flex justify-between gap-2 group ${index === 0 ? 'flex-col bg-sky-100' : 'bg-white'}`}>
            {index === 0 ? (
                <LibraryInput />
                // <form onSubmit={onSubmit}>
                //     <AutoSizeTextarea value={newItemText} className="w-full h-full border-none resize-none" name="text" onFinish={setNewItemText} />
                //     <button type="submit" className="cursor-pointer hover:bg-sky-200 p-1 text-sm rounded flex w-full justify-center items-center">
                //         <Plus className="w-4 h-4" />
                //     </button>
                // </form>
            ) : (
                <>
                    <div>
                        {content(data)}
                    </div>
                    <div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-stone-200 cursor-pointer"
                            onClick={() => projectActions.deleteLibraryItem(index - 1)}
                        >
                            <Trash className="w-4 h-4" />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}









function LibraryInput() {
    const editableRef = useRef(null);
    const [content, setContent] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pendingImage, setPendingImage] = useState(null); // Store the file and preview URL
    const [imageHovered, setImageHovered] = useState(false);

    // -------------------------------------------------
    // ----------------- PASTE -----------------
    // Handle paste event
    const handlePaste = async (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                e.preventDefault();
                // Clean up previous image if exists
                if (pendingImage) {
                    URL.revokeObjectURL(pendingImage.previewUrl);
                }
                const file = item.getAsFile();
                const previewUrl = URL.createObjectURL(file);
                setPendingImage({ file, previewUrl });
                // Clear text content when image is pasted
                editableRef.current.innerText = "";
                setContent("");
                return;
            }
        }
    };

    // -------------------------------------------------
    // ----------------- DRAG AND DROP -----------------
    // Handle drag over
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    // Handle drag leave
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    // Handle drop
    const handleDrop = async (e) => {
        e.preventDefault();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0]; // Take only the first file for preview
            if (file.type.indexOf("image") !== -1) {
                // Clean up previous image if exists
                if (pendingImage) {
                    URL.revokeObjectURL(pendingImage.previewUrl);
                }
                const previewUrl = URL.createObjectURL(file);
                setPendingImage({ file, previewUrl });
                // Clear text content when image is dropped
                editableRef.current.innerText = "";
                setContent("");
            } else {
                // For non-image files, upload immediately (keep original behavior)
                setUploading(true);
                for (let i = 0; i < files.length; i++) {
                    await projectActions.uploadLibraryItem(files[i]);
                }
                setUploading(false);
            }
        }
    };

    // -------------------------------------------------
    // ----------------- NORMAL INPUT -----------------
    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        
        try {
            if (pendingImage) {
                // Upload the pending image
                await projectActions.uploadLibraryItem(pendingImage.file);
                // Clean up the object URL
                URL.revokeObjectURL(pendingImage.previewUrl);
                setPendingImage(null);
            } else if (content.trim()) {
                // Upload text content
                projectActions.addLibraryItem({ text: content });
                editableRef.current.innerText = "";
                setContent("");
            }
        } finally {
            setUploading(false);
        }
    };

    // Sync contenteditable with state
    const handleInput = (e) => {
        setContent(e.target.innerText);
        // If user starts typing and there's a pending image, remove it
        if (pendingImage && e.target.innerText.trim()) {
            URL.revokeObjectURL(pendingImage.previewUrl);
            setPendingImage(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
        // Allow user to remove image with Delete/Backspace when no text content
        if ((e.key === "Delete" || e.key === "Backspace") && pendingImage && !content.trim()) {
            e.preventDefault();
            URL.revokeObjectURL(pendingImage.previewUrl);
            setPendingImage(null);
        }
    };

    // Clean up object URL on unmount or when image changes
    useEffect(() => {
        return () => {
            if (pendingImage) {
                URL.revokeObjectURL(pendingImage.previewUrl);
            }
        };
    }, [pendingImage]);

    // Handle removing pending image
    const removePendingImage = () => {
        if (pendingImage) {
            URL.revokeObjectURL(pendingImage.previewUrl);
            setPendingImage(null);
            // Re-enable editing and focus
            setTimeout(() => {
                if (editableRef.current) {
                    editableRef.current.focus();
                }
            }, 0);
        }
    };

    // Check if content contains URL for microlink
    const getUrlFromContent = (text) => {
        const words = text.split(" ");
        return words.find(word => word.includes("http") || word.includes("www."));
    };

    const hasContent = content.trim() || pendingImage;
    return (
        <form onSubmit={handleSubmit}>
            <div
                ref={editableRef}
                contentEditable={!pendingImage} // Disable editing when image is shown
                style={{
                    minHeight: "40px",
                    border: dragActive ? "2px dashed #007bff" : "1px solid #ccc",
                    padding: "4px",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    background: "#fff",
                    outline: dragActive ? "2px solid #007bff" : "none",
                    position: "relative",
                }}
                className="text-sm"
                onPaste={handlePaste}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                placeholder={pendingImage ? "" : "Paste or drag images/files here..."}
                suppressContentEditableWarning
            >
                {pendingImage && (
                    <div className="w-full h-full group relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => removePendingImage()}>
                            ביטול
                        </div>
                        <img
                            src={pendingImage.previewUrl}
                            alt="Preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "200px",
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto",
                            }}
                        />
                    </div>
                )}
            </div>
            <button 
                type="submit" 
                disabled={uploading || !hasContent} 
                className="text-sm text-center cursor-pointer hover:bg-sky-200 p-1 rounded flex w-full justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? "טוען..." : pendingImage ? "העלאת תמונה" : "שמירה"}
            </button>
        </form>
    );
}