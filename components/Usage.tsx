"use client"

import { FeatureFlag } from '@/features/flag'
import React from 'react'
import {
    useSchematicEntitlement,
    useSchematicIsPending,
} from "@schematichq/schematic-react";

function Usage({
    featureFlag,
    title
} : {
    featureFlag: FeatureFlag
    title: string
}) {
    const isPending = useSchematicIsPending();
    const {
        featureAllocation,
        featureUsage,
        value: isFeatureEnabled,
    } = useSchematicEntitlement(featureFlag);

    const hasUsedAllTokens =  featureUsage && featureAllocation && featureUsage >= featureAllocation;

    if (isPending) {
        return <div className="text-gray-500 text-center py-4">Loading...</div>;
    }

    if (hasUsedAllTokens) {
        return (
        <div className=" • text-gray-500 text-center py-4">
            You have used all your tokens for this feature. 
            <div className="relative">
                //TODO: make progress bar
                <p className="text-sm text-red-600 mt-2">
                    You have used all available tokens. Please upgrade your plan to continue using this feature.
                </p>
            </div>
        </div>
        );
    }

    return (
        <div>Usage</div>
    )
}

export default Usage