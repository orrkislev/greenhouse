import { useUser } from "@/utils/store/useUser"
import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { studyActions, useStudySideContext } from "@/utils/store/useStudy";
import Link from "next/link";

export default function StudyContext() {
    const user = useUser(state => state.user);
    const sideContext = useStudySideContext();
    const [data, setData] = useState(sideContext);
    const [editMode, setEditMode] = useState(false);

    useEffect(()=>{
        setData(sideContext)
    }, [sideContext])

    const canEdit = user.roles.includes('admin');

    const newLink = () => setData(prev => [...prev, { url: '', name: '', text: '' }])
    const removeLink = (index) => setData(prev => prev.filter((_, i) => i !== index))
    const updateLink = (index, key, value) => setData(prev => prev.map((link, i) => i === index ? { ...link, [key]: value } : link))

    const clickEditSave = () => {
        if (editMode) {
            studyActions.saveSideContext(data)
            setEditMode(false)
        } else {
            setEditMode(true)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">קישורים </h3>
                {canEdit && (
                    <button className="text-sm text-gray-500 text-xs flex items-center gap-1 rounded-full p-1 cursor-pointer hover:bg-gray-200" onClick={clickEditSave}>
                        {editMode ? <Save className="w-6 h-6 text-green-800" /> : <Pencil className="w-4 h-4" />}
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {data.map((link, index) => (
                    <div key={index} className="p-4 rounded-md border border-stone-300 text-sm text-stone-600 group/link relative hover:bg-stone-100 transition-colors duration-300">
                        { editMode ? (
                            <>
                                <input name="name" type="text" value={link.name} onChange={(e) => updateLink(index, 'name', e.target.value)} className="font-semibold" placeholder="שם"/>
                                <input name="url" type="text" value={link.url} onChange={(e) => updateLink(index, 'url', e.target.value)} className="text-sm text-gray-500" placeholder="כתובת"/>
                                <input name="text" type="text" value={link.text} onChange={(e) => updateLink(index, 'text', e.target.value)} className="text-sm text-gray-500" placeholder="תיאור"/>
                                <button className="text-gray-500 p-1 rounded-full cursor-pointer hover:bg-gray-200 flex justify-center items-center" onClick={() => removeLink(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <Link href={link.url} target="_blank" rel="noopener noreferrer" >
                                <div className="text-sm text-gray-500 font-semibold">{link.name}</div>
                                <div className="text-sm text-gray-500 pr-2">{link.text}</div>
                                <div className="absolute top-2 left-2 bg-stone-100 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 flex justify-center items-center">
                                    <ExternalLink className="w-4 h-4 text-stone-600 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
                                </div>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            {editMode && (
                <button className="text-gray-500 p-1 rounded-full cursor-pointer hover:bg-gray-200 flex justify-center items-center" onClick={newLink}>
                    <Plus className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}