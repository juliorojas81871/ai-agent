"use client"
import { getVideoDetails } from '@/actions/getVideoDetails';
import { VideoDetails } from '@/types/types';
import { Calendar, Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react'

function YoutubeVideoDetails({ videoId } : { videoId: string}) {
    const [video, setVideo] = useState<VideoDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const fetchVideoDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const video = await getVideoDetails(videoId);
            if (!video) {
                setError("Failed to load video details. Please try again later.");
            } else {
                setVideo(video);
            }
        } catch (err) {
            setError("An error occurred while loading the video details.");
            console.error("Error fetching video details:", err);
        } finally {
            setIsLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        setIsMounted(true);
        fetchVideoDetails();
    }, [fetchVideoDetails]);

    // Debug state changes
    useEffect(() => {
        if (isMounted) {
            console.log('State changed:', { isLoading, error: !!error, video: !!video });
        }
    }, [isLoading, error, video, isMounted]);

    if (!isMounted || isLoading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div 
                    className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full"
                    style={{
                        animation: 'spin 1s linear infinite',
                        WebkitAnimation: 'spin 1s linear infinite'
                    }}
                />
                <style jsx>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @-webkit-keyframes spin {
                        from { -webkit-transform: rotate(0deg); }
                        to { -webkit-transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="text-red-500 text-center">
                    <p className="font-medium">{error}</p>
                    <p className="text-sm mt-1">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="text-gray-500 text-center">
                    <p className="font-medium">No video details available</p>
                </div>
            </div>
        );
    }

    // Memoize the video details JSX to prevent unnecessary re-renders
    const videoDetailsJSX = (
        <div className="@container bg-white rounded-xl">
            <div className="flex flex-col gap-8">
                {/* thumbnail */}
                <div className="flex-shrink-0">
                    <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={500}
                        height={500}
                        className="w-full rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                        priority
                        loading="eager"
                    />
                </div>

                {/* video details */}
                <div className="flex-grow space-y-4">
                    <h1 className="text-2xl @lg:text-3xl font-bold text-gray-900 leading-tight line-clamp-2">
                        {video.title}
                    </h1>

                    {/* channel info */}
                    <div className="flex items-center gap-4">
                        <Image
                            src={video.channel.thumbnail}
                            alt={video.channel.title}
                            width={48}
                            height={48}
                            className="w-10 h-10 @md:w-12 @md:h-12 rounded-full border-2 border-gray-100"
                            priority
                            loading="eager"
                        />

                        <div>
                            <p className="text-base @md:text-lg font-semibold text-gray-900">
                                {video.channel.title}
                            </p>
                            <p className="text-sm @md:text-base text-gray-600">
                                {video.channel.subscribers} subscribers
                            </p>
                        </div>
                    </div>

                    {/* video stats */}
                    <div className="grid grid-cols-2 @lg:grid-cols-4 gap-4 pt-4">
                        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">Published</p>
                            </div>
                            <p className="font-medium text-gray-900">
                                {new Date(video.publishedAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">Views</p>
                            </div>
                            <p className="font-medium text-gray-900">{video.views}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <ThumbsUp className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">Likes</p>
                            </div>
                            <p className="font-medium text-gray-900">{video.likes}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">Comments</p>
                            </div>
                            <p className="font-medium text-gray-900">{video.comments}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return videoDetailsJSX;
}

export default React.memo(YoutubeVideoDetails);