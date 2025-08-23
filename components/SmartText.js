import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";


export default function SmartText({ text, className, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [lastValue, setLastValue] = useState(text);

    if (!onEdit) return <SmartLabel text={text} className={className} />

    const startEditing = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setLastValue(text);
    }

    const onFinish = (value) => {
        if (value !== lastValue) {
            onEdit(value);
            setLastValue(value)
        }
        setIsEditing(false);
    }

    if (isEditing) {
        return <AutoSizeTextarea value={text} onFinish={onFinish} autoFocus={true} className={className} />
    }

    return (
        <div className="flex gap-4 group items-center">
            <SmartLabel text={text} className={className} onClick={startEditing} />
            <Pencil className="w-4 h-4 cursor-pointer opacity-0 group-hover:opacity-50 hover:opacity-100 transition-all"
                onClick={startEditing}
            />
        </div>
    )
}


function SmartLabel({ text, className, onClick }) {
    className += ' cursor-text hover:underline'
    const isLink = text.includes("http") || text.includes("www.");
    if (isLink) return <LinkText text={text} className={className} />
    return <span className={className} onClick={onClick}>{text}</span>
}


function LinkText({ text, className }) {
    const words = text.split(" ");
    return <div className={`flex gap-1 ${className}`}>
        {words.map((word, index) => <LinkWords key={index} word={word} className={className} />)}
    </div>
}
function LinkWords({ word, className }) {
    const [title, setTitle] = useState("");
    useEffect(() => {
        if (word.includes("http") || word.includes("www.")) {
            const fetchTitle = async () => {
                const title = await getPageTitleOrOEmbed(word);
                setTitle(title);
            }
            fetchTitle();
        }
    }, [word]);

    if (title) {
        const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${word}`;
        const formattedUrl = word.startsWith('http') ? word : `https://${word}`;
        return <a href={formattedUrl} target="_blank" className={`flex gap-1 items-center ${className} border-b border-stone-600 hover:text-blue-500 hover:border-blue-500`}>
            <Image src={favicon} alt="favicon" width={16} height={16} />
            <span className="truncate">{title.length > 20 ? title.slice(0, 20) + "..." : title}</span>
        </a>
    }

    return <span className={className} >{word}</span>
}



export async function getPageTitleOrOEmbed(url) {
    // 1. Check predefined oEmbed providers
    for (const provider of OEMBED_PROVIDERS) {
        if (provider.match(url)) {
            try {
                const res = await fetch(provider.endpoint(url));
                if (res.ok) {
                    const data = await res.json();
                    const title = provider.extract(data);
                    if (title) return title;
                }
            } catch (e) {
                // Continue to next step if oEmbed fails
            }
        }
    }

    // 2. Try to fetch the page and extract <title>
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const title = doc.querySelector('title');
        if (title && title.textContent.trim()) {
            return title.textContent.trim();
        }

        // 3. Check for oEmbed discovery link
        const oembedLink = doc.querySelector('link[type="application/json+oembed"]');
        if (oembedLink && oembedLink.href) {
            const oembedRes = await fetch(oembedLink.href);
            if (oembedRes.ok) {
                const oembedData = await oembedRes.json();
                if (oembedData.title) return oembedData.title;
            }
        }
    } catch (e) {
        // Ignore and continue to fallback
    }

    // 4. Fallback: return the original URL
    return url;
}


const OEMBED_PROVIDERS = [
    {
        name: 'YouTube',
        match: url => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url),
        endpoint: url => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        extract: data => data.title
    },
    {
        name: 'Vimeo',
        match: url => /^(https?:\/\/)?(www\.)?vimeo\.com\//.test(url),
        endpoint: url => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
        extract: data => data.title
    },
    {
        name: 'SoundCloud',
        match: url => /^(https?:\/\/)?(www\.)?soundcloud\.com\//.test(url),
        endpoint: url => `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
        extract: data => data.title
    },
    {
        name: 'TikTok',
        match: url => /^(https?:\/\/)?(www\.)?tiktok\.com\//.test(url),
        endpoint: url => `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
        extract: data => data.title
    },
    {
        name: 'Twitter',
        match: url => /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//.test(url),
        endpoint: url => `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
        extract: data => data.title
    }
];









export function AutoSizeTextarea({ value, onFinish, autoFocus, className }) {
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }, [value]);

    const onChange = (e) => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }

    return (
        <textarea ref={ref}
            rows={1}
            defaultValue={value}
            autoFocus={autoFocus}
            onBlur={(e) => onFinish(e.target.value)}
            className={`resize-none whitespace-pre-wrap ${className} w-full`}
            onChange={onChange}
        />
    )
}