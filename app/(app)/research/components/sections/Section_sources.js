import Box2 from "@/components/Box2";
import Button, { IconButton } from "@/components/Button";
import WithLabel from "@/components/WithLabel";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { BookOpen, Plus, Trash2, Cog, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TextInput from "./TextInput";

export default function Section_sources() {
    const research = useResearchData(state => state.research)
    const sources = research?.sections?.sources || [];

    const addSource = () => {
        const newSources = [...sources, { title: 'גוגל', url: 'google.com' }];
        researchActions.updateSections({ sources: newSources });
    }

    const updateSource = (index, key, value) => {
        const newSources = [...sources];
        newSources[index][key] = value;
        researchActions.updateSections({ sources: newSources });
    }

    const removeSource = (index) => {
        const newSources = [...sources];
        newSources.splice(index, 1);
        researchActions.updateSections({ sources: newSources });
    }

    return (
        <Box2 label="מקורות" LabelIcon={BookOpen} className="row-span-2">
            <div className="flex flex-col justify-between h-full mb-8 overflow-y-auto">
                {sources.map((source, index) => (
                    <Source key={index} source={source} index={index} updateSource={updateSource} removeSource={removeSource} />
                    ))}
                <div className="group/new-source p-2 cursor-pointer" onClick={addSource}>
                    <Plus className="w-4 h-4 group-hover/new-source:rotate-90 group-hover/new-source:text-emerald-600 group-hover/new-source:scale-110 group-hover/new-source:bg-emerald-100 rounded-full transition-transform duration-200" />
                </div>
            </div>
        </Box2>
    )
}

function Source({ source, index, updateSource, removeSource }) {
    const [isOpen, setIsOpen] = useState(false);

    const updateTitle = (value) => updateSource(index, 'title', value);
    const updateUrl = (value) => updateSource(index, 'url', value);

    const url = source.url ? source.url.startsWith('http') ? source.url : `https://${source.url}` : null;

    return (
        <>
            <div className="flex justify-between group/source transition-all h-[fit-content] border-b border-stone-300 items-center rtl">
                {isOpen ? (
                    <div>
                        <TextInput onChange={(value) => updateTitle(value)} value={source.title} className="w-full p-1 hover:bg-stone-100 rounded-md w-full" />
                        <TextInput onChange={(value) => updateUrl(value)} value={url} className="w-full p-1 hover:bg-stone-100 rounded-md w-full font-mono text-xs text-stone-500 mx-2 -mt-2" />
                    </div>
                ) : (
                    <>
                        {url ? (
                            <Link href={url} target="_blank">
                                <div className="flex items-center gap-1 w-full outline-none p-1 underline cursor-pointer hover:text-blue-500 transition-all duration-200"> 
                                    <ExternalLink className="w-4 h-4" />
                                    {source.title} 
                                </div>
                            </Link>
                        ) : (
                            <div className="w-full outline-none p-1"> {source.title} </div>
                        )}
                    </>
                )}
                <div className="flex">
                    {isOpen ? <IconButton icon={Trash2} onClick={() => removeSource(index)} className="p-2 hover:bg-stone-100 rounded-full opacity-0 group-hover/source:opacity-100 transition-opacity" /> : null}
                    <IconButton icon={isOpen ? ChevronUp : ChevronDown} onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-stone-100 rounded-full opacity-0 group-hover/source:opacity-100 transition-opacity" />
                </div>
            </div>
        </>
    )
}