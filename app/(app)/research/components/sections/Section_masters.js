import Box2 from "@/components/Box2";
import { IconButton } from "@/components/Button";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { Plus, Trash2, ChevronUp, ChevronDown, Users2, User2 } from "lucide-react";
import { useState } from "react";

export default function Section_masters() {
    const research = useResearchData(state => state.research)
    const masters = research?.sections?.masters || [];

    const addMaster = () => {
        const newMasters = [...masters, { name: 'מומחה חדש' }];
        researchActions.updateSections({ masters: newMasters });
    }

    return (
        <Box2 label="מומחים" LabelIcon={Users2} className="row-span-2">
            <div className="flex flex-col justify-between h-full mb-8 overflow-y-auto">
                {masters.map((master, index) => (
                    <Master key={index} master={master} index={index} />
                ))}
                <div className="group/new-master p-2 cursor-pointer" onClick={addMaster}>
                    <Plus className="w-4 h-4 group-hover/new-master:rotate-90 group-hover/new-master:text-emerald-600 group-hover/new-master:scale-110 group-hover/new-master:bg-emerald-100 rounded-full transition-transform duration-200" />
                </div>
            </div>
        </Box2>
    )
}

function Master({ master, index }) {
    const research = useResearchData(state => state.research)
    const [isOpen, setIsOpen] = useState(false);

    const updateMaster = (key, value) => {
        const newMasters = [...(research?.sections?.masters || [])];
        newMasters[index][key] = value;
        researchActions.updateSections({ masters: newMasters });
    }

    return (
        <>
            <div className="flex justify-between group/source transition-all h-[fit-content] border-b border-stone-300 items-center">
                {isOpen ? (
                    <div>
                        <div contentEditable={true} suppressContentEditableWarning onBlur={(e) => updateMaster('name', e.target.innerText)} className="w-full outline-none p-1 hover:bg-stone-100 rounded-md w-full text-sm">
                            {master.name}
                        </div>
                        <div contentEditable={true} suppressContentEditableWarning onBlur={(e) => updateMaster('title', e.target.innerText)} className="w-full outline-none p-1 hover:bg-stone-100 rounded-md w-full text-xs text-stone-500">
                            {master.title || 'כותרת'}
                        </div>
                        <div contentEditable={true} suppressContentEditableWarning onBlur={(e) => updateMaster('contact', e.target.innerText)} className="w-full outline-none p-1 hover:bg-stone-100 rounded-md w-full text-sky-800 text-xs">
                            {master.contact || 'פרטי קשר'}
                        </div>
                    </div>
                ) : (
                    <div className="w-full outline-none p-1 flex items-center gap-1">
                        <User2 className="w-4 h-4" />
                        {master.name}
                    </div>
                )}
                <div className="flex">
                    {isOpen ? <IconButton icon={Trash2} onClick={() => removeSource(index)} className="p-2 hover:bg-stone-100 rounded-full opacity-0 group-hover/source:opacity-100 transition-opacity" /> : null}
                    <IconButton icon={isOpen ? ChevronUp : ChevronDown} onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-stone-100 rounded-full opacity-0 group-hover/source:opacity-100 transition-opacity" />
                </div>
            </div>
        </>
    )
}