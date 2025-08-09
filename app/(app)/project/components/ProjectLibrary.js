import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Masonry, usePositioner } from "masonic";
import { projectActions, useProject } from "@/utils/store/useProject";
import { Plus, Shapes, Trash } from "lucide-react";
import Microlink from '@microlink/react'
import { AutoSizeTextarea } from "@/components/SmartText";


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

    const content = (text) => {
        const words = text.split(" ");
        const urlWord = words.find(word => word.includes("http") || word.includes("www."));
        if (urlWord) return <Microlink url={urlWord} style={{
            '--microlink-max-width': (width - 52) + 'px'
        }} />
        return <AutoSizeTextarea value={data.text} className="border-none resize-none" name="text" onFinish={onBlur} />
    }


    return (
        <div className={`w-full h-full border border-stone-400 rounded-md p-2 flex justify-between gap-2 group ${index === 0 ? 'flex-col bg-sky-100' : 'bg-white'}`}>
            {index === 0 ? (
                <form onSubmit={onSubmit}>
                    <AutoSizeTextarea value={newItemText} className="w-full h-full border-none resize-none" name="text" onFinish={setNewItemText} />
                    <button type="submit" className="cursor-pointer hover:bg-sky-200 p-1 text-sm rounded flex w-full justify-center items-center">
                        <Plus className="w-4 h-4" />
                    </button>
                </form>
            ) : (
                <>
                    <div>
                        {content(data.text)}
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