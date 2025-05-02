"use client";
import React, { useCallback } from 'react'
import Form from "next/form";
import AnalyseButton from './AnalyseButton';
import { analyseYoutubeVideo } from "@/actions/analyseYoutubeVideo";
import { useSchematicEntitlement } from '@schematichq/schematic-react';
import { FeatureFlag } from '@/features/flags';
import { Button } from './ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

const MANAGE_PLAN_PATH = "/manage-plan";

interface UpgradeButtonProps {
    className?: string;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ className }) => (
    <Link href={MANAGE_PLAN_PATH}>
        <Button
            variant="outline"
            className={`bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text ${className || ''}`}
        >
            Upgrade Plan
        </Button>
    </Link>
);

const VideoInput: React.FC<{ onSubmit: (formData: FormData) => void }> = ({ onSubmit }) => (
    <Form
        className="flex flex-col sm:flex-row gap-2 items-center"
        action={onSubmit}
    >
        <input
            placeholder='Enter Youtube Url'
            className="flex-1 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            name="url"
            type="text"
            aria-label="YouTube URL"
        />
        <AnalyseButton />
    </Form>
);

function YoutubeVideoForm() {
    const { isSignedIn } = useUser();
    const { featureUsageExceeded: isAnalysisDisabled } = useSchematicEntitlement(
        FeatureFlag.ANALYSE_VIDEO
    );
    const { featureUsageExceeded: isTranscriptionDisabled } = useSchematicEntitlement(
        FeatureFlag.TRANSCRIPTION
    );

    const handleSubmit = useCallback(async (formData: FormData) => {
        if (!isSignedIn) {
            toast.error("Please sign in to analyze videos", {
                duration: 5000,
                position: "top-center",
                style: {
                    background: "#FEE2E2",
                    color: "#DC2626",
                    border: "1px solid #DC2626",
                    fontSize: "1.1rem",
                    padding: "1rem",
                }
            });
            return;
        }

        const url = formData.get("url")?.toString();
        
        if (!url) {
            toast.error("Please enter a YouTube URL");
            return;
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            toast.error("Please enter a valid YouTube URL");
            return;
        }

        try {
            await analyseYoutubeVideo(formData);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to analyze video. Please try again.");
            }
        }
    }, [isSignedIn]);

    if (!isSignedIn) {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <VideoInput onSubmit={handleSubmit} />
            </div>
        );
    }

    if (isAnalysisDisabled || isTranscriptionDisabled) {
        return (
            <div className="text-center space-y-4">
                <p className="text-gray-600">
                    Video analysis is not available in your current plan. Upgrade to analyze videos and get AI-powered insights.
                </p>
                <UpgradeButton />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <VideoInput onSubmit={handleSubmit} />
        </div>
    );
}

export default YoutubeVideoForm;