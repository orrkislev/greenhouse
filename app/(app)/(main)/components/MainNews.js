// display (embed) the latest video from the playlist
// https://www.youtube.com/playlist?list=PLI3m1SRZZEsTir2h6zhn_0595afnTXHwm

import { useEffect, useState } from "react";
import { getLatestVideoFromPlaylist } from "@/utils/actions/google actions";
import { useUserGroups } from "@/utils/store/useGroups";

export default function MainNews() {
    const groups = useUserGroups();
    const [embedUrl, setEmbedUrl] = useState(null);

    useEffect(() => {
        const playlistId = 'PLI3m1SRZZEsTir2h6zhn_0595afnTXHwm';
        getLatestVideoFromPlaylist(playlistId).then(videoId => {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            setEmbedUrl(embedUrl);
        });
    }, []);

    return (
        // <Box2 label="חדשות החממה" LabelIcon={Tv} className={`row-span-${groups.length} grayscale-100 hover:grayscale-0 transition-all duration-300`}>
        <div className={`row-span-2 grayscale-100 hover:grayscale-0 transition-all duration-300`}>
            <div className="w-full h-full relative rounded-xl overflow-hidden aspect-[16/9] border border-stone-400">
                {embedUrl && (
                <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                )}
            </div>
        </div>
        // </Box2>
    )
}