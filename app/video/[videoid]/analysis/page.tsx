"use client"
import { createOrGetVideo } from '@/actions/createOrGetVideo'
import AiAgentChat from '@/components/AiAgentChat'
import ThumbnailGeneration from '@/components/ThumbnailGeneration'
import TitleGenerations from '@/components/TitleGenerations'
import Transcription from '@/components/Transcription'
import Usage from '@/components/Usage'
import YoutubeVideoDetails from '@/components/YoutubeVideoDetails'
import { Doc } from '@/convex/_generated/dataModel'
import { FeatureFlag } from '@/features/flags'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function AnalysisPage() {
  const params = useParams<{ videoid: string }>();
  const { videoid: videoId  } = params;
  const [video, setVideo] = useState<Doc<"videos"> | null | undefined>(
    undefined
  )
  const {user} = useUser();

  useEffect(()=>{
    if(!user?.id) return;

    const fetchVideo = async () =>{
      const response = await createOrGetVideo(videoId as string, user.id)
      if(!response.success){

      }else{
        setVideo(response.data!)
      }
    }
    fetchVideo();
  },[videoId,user])

  return (
    <div className='xl:container mx-auto px-4 md:px-0'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
         {/* left */}
          <div className='order-2 lg:order-1 flex flex-col gap-4 bg-white lg:border-r border-gray-200 p-6'>
            {/* analysis */}
                <div className='flex flex-col gap-4 p-4 border border-gray-200'>
                  <Usage featureFlag={FeatureFlag.ANALYSE_VIDEO} title='Analyse Video'/>
                </div>
            {/* video transcription */}

            {/* video details */}
            <YoutubeVideoDetails videoId={videoId} />

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