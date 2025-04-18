import { VideoDetails } from '@/types/typs';
import React, { useEffect, useState } from 'react'

function YoutubeVideoDetails({ videoId } : { videoId: string}) {
    const[video, setVideo] = useState<VideoDetails | null> (null);

    useEffect(() => {
        const fetchVideoDetails = async () => {
            // TODO: complete getVideDetails
        //   const video = await getVideoDetails(videoId);
          setVideo(video);
        };
    
        fetchVideoDetails();
    }, [videoId]);

    return (
        <div>YoutubeVideoDetails: {videoId}</div>
    )
}

export default YoutubeVideoDetails