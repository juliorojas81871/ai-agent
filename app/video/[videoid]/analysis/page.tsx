"use client"
import { createOrGetVideo } from '@/actions/createOrGetVideo'
import AiAgentChat from '@/components/AiAgentChat'
import ThumbnailGeneration from '@/components/ThumbnailGeneration'
import TitleGenerations from '@/components/TitleGenerations'
import Transcription from '@/components/Transcription'
import Usage from '@/components/Usage'
// import YoutubeVideoDetails from '@/components/YoutubeVideoDetails'
import { Doc } from '@/convex/_generated/dataModel'
import { FeatureFlag } from '@/features/flags'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'

function AnalysisPage() {
  const params = useParams<{ videoid: string }>();
  const { videoid: videoId } = params;
  const [video, setVideo] = useState<Doc<"videos"> | null | undefined>(undefined);
  const { user } = useUser();
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use refs to track previous values and prevent unnecessary effects
  const prevVideoIdRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);
  const fetchInProgressRef = useRef(false);

  // Effect to fetch video data
  useEffect(() => {
    // Skip if no user or already fetched
    if (!user?.id || hasFetched || isLoading || fetchInProgressRef.current) return;

    // Skip if videoId or userId hasn't changed
    if (prevVideoIdRef.current === videoId && prevUserIdRef.current === user.id) return;

    // Update refs
    prevVideoIdRef.current = videoId;
    prevUserIdRef.current = user.id;

    // Set loading state
    setIsLoading(true);
    fetchInProgressRef.current = true;

    // Fetch video data
    const fetchVideo = async () => {
      try {
        const response = await createOrGetVideo(videoId as string, user.id);
        if (response.success) {
          setVideo(response.data!);
          setHasFetched(true);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    };

    fetchVideo();
  }, [videoId, user?.id, hasFetched, isLoading]);

  // Memoize the status component to prevent unnecessary rerenders
  const VideoTranscriptionStatus = React.useMemo(() => {
    if (video === undefined) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-700">Loading...</span>
        </div>
      );
    }

    if (!video) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <p className="text-sm text-amber-700">
            This is your first time analyzing this video. <br />
            <span className="font-semibold">
              (1 Analysis token is being used!)
            </span>
          </p>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <p className="text-sm text-green-700">
          Analysis exists for this video - no additional tokens needed in future
          calls! <br />
        </p>
      </div>
    );
  }, [video]);

  if (!videoId) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="text-red-500 text-center">
          <p className="font-medium">Invalid video ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className='xl:container mx-auto px-4 md:px-0'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
         {/* left */}
          <div className='order-2 lg:order-1 flex flex-col gap-4 bg-white lg:border-r border-gray-200 p-6'>
            {/* analysis */}
                <div className='flex flex-col gap-4 p-4 border border-gray-200'>
                  <Usage featureFlag={FeatureFlag.ANALYSE_VIDEO} title='Analyse Video'/>
                  {VideoTranscriptionStatus}
                </div>

            {/* video details */}
            <div className="border border-gray-200 rounded-xl">
              {/* <YoutubeVideoDetails videoId={videoId} /> */}
            </div>

            {/* thumbnail */}
            <ThumbnailGeneration videoId={videoId} />

            {/* title */}
            <TitleGenerations videoId={videoId}/>

            {/* transcription */}
            <Transcription videoId={videoId}/>
          </div>

          {/* right */}
          <div className='order-1 lg:order-2 lg:sticky lg:top-20 h-[500px] md:h-[calc(100vh-6rem)]'>
            <AiAgentChat videoId={videoId} />
          </div>
      </div>
    </div>
  )
}

export default AnalysisPage