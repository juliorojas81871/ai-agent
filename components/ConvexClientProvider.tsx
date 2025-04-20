"use client";
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import React, { ReactNode } from 'react'

export const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL!
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider afterSignOutUrl="/">
            <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
            {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}

export default ConvexClientProvider