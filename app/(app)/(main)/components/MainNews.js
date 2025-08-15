// display (embed) the latest video from the playlist
// https://www.youtube.com/playlist?list=PLI3m1SRZZEsTir2h6zhn_0595afnTXHwm

import { useEffect, useState } from "react";
import { getLatestVideoFromPlaylist } from "@/utils/actions/google actions";
import Box2 from "@/components/Box2";

export default function MainNews() {
    const [embedUrl, setEmbedUrl] = useState(null);

    useEffect(() => {
        const playlistId = 'PLI3m1SRZZEsTir2h6zhn_0595afnTXHwm';
        getLatestVideoFromPlaylist(playlistId).then(videoId => {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            setEmbedUrl(embedUrl);
        });
    }, []);

    if (!embedUrl) return null;

    return (
        <Box2 label="חדשות החממה" className="w-full">
            <div className="w-full h-0 pb-[56.25%] relative ">
                <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </Box2>
    )
}