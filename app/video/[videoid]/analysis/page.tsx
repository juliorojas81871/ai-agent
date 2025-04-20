"use client"
import ThumbnailGeneration from '@/components/ThumbnailGeneration'
import TitleGenerations from '@/components/TitleGenerations'
import Transcription from '@/components/Transcription'
import Usage from '@/components/Usage'
import YoutubeVideoDetails from '@/components/YoutubeVideoDetails'
import { FeatureFlag } from '@/features/flag'
import { useParams } from 'next/navigation'
import React from 'react'

function AnalysisPage() {
  const params = useParams<{ videoid: string }>();
  const { videoid: videoId  } = params;

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
          </div>

          {/* video details */}
          <YoutubeVideoDetails videoId={videoId} />

          {/* thumbnail */}
          <ThumbnailGeneration videoId={videoId} />


          {/* title */}
          <TitleGenerations videoId={videoId}/>

          {/* transcription */}
          <Transcription videoId={videoId}/>

        {/* right */}
      </div>
     
    </div>
  )
}

export default AnalysisPage