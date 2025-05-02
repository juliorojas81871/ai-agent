"use client"
import { useUser } from '@clerk/nextjs';
import React, { useCallback, useMemo } from 'react'
import Usage from './Usage';
import { FeatureFlag } from '@/features/flags';
import { useSchematicEntitlement } from '@schematichq/schematic-react';
import { Copy } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from "@/convex/_generated/api";
import { toast } from 'sonner';
import { Id } from "@/convex/_generated/dataModel";

// Types
interface Title {
    _id: Id<"titles">;
    _creationTime: number;
    videoId: string;
    title: string;
    userId: string;
}

// Constants
const TOAST_STYLES = {
    duration: 3000,
    position: "top-center" as const,
    style: {
        background: "#ECFDF5",
        color: "#065F46",
        border: "1px solid #059669",
        fontSize: "1.1rem",
        padding: "1rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }
};

// Components
const TitleItem = React.memo(({ title, onCopy }: { title: Title; onCopy: (text: string) => void }) => (
    <div
        className="group relative p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-blue-100 hover:bg-blue-50 transition-all duration-200"
    >
        <div className="flex items-start justify-between gap-4">
            <p 
                className="text-sm text-gray-900 leading-relaxed"
                id={`title-${title._id}`}
            >
                {title.title}
            </p>

            <button
                onClick={() => onCopy(title.title)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-blue-100 rounded-md focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Copy to clipboard"
                aria-label={`Copy title: ${title.title}`}
                aria-describedby={`title-${title._id}`}
            >
                <Copy className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </button>
        </div>
    </div>
));

TitleItem.displayName = 'TitleItem';

const EmptyState = React.memo(() => (
    <div 
        className="text-center py-8 px-4 rounded-lg mt-4 border-2 border-dashed border-gray-200"
        role="status"
        aria-live="polite"
    >
        <p className="text-gray-500">No titles have been generated yet</p>
        <p className="text-sm text-gray-400 mt-1">
            Generate titles to see them appear here
        </p>
    </div>
));

EmptyState.displayName = 'EmptyState';

function TitleGenerations({ videoId }: { videoId: string }) {
    const { user } = useUser();
    const titles = useQuery(api.titles.list, { 
        videoId, 
        userId: user?.id ?? "" 
    });

    const { value: isTitleGenerationEnabled } = useSchematicEntitlement(
        FeatureFlag.TITLE_GENERATIONS
    );

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard", TOAST_STYLES);
    }, []);

    const showEmptyState = useMemo(() => 
        !titles?.length && isTitleGenerationEnabled
    , [titles?.length, isTitleGenerationEnabled]);

    return (
        <section 
            className='p-4 border border-gray-200 rounded-xl bg-white shadow-sm'
            aria-labelledby="titles-heading"
        >
            <div>
                <Usage featureFlag={FeatureFlag.TITLE_GENERATIONS} title="Titles" />
            </div>

            <div 
                className="space-y-3 mt-4 max-h-[280px] overflow-y-auto"
                role="list"
                aria-label="Generated titles"
            >
                {titles?.map((title) => (
                    <div key={title._id} role="listitem">
                        <TitleItem 
                            title={title} 
                            onCopy={copyToClipboard} 
                        />
                    </div>
                ))}
            </div>

            {showEmptyState && <EmptyState />}
        </section>
    )
}

export default TitleGenerations