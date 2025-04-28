"use client";
import { useUser } from "@clerk/nextjs";
import { useSchematicEvents } from "@schematichq/schematic-react";
import { useEffect, useRef } from "react";

const SchematicWrapped = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { identify } = useSchematicEvents();
    const lastIdentifiedUserId = useRef<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        // Only identify if the user ID has changed
        if (lastIdentifiedUserId.current === user.id) return;

        const userName =
            user?.id ??
            user?.username ??
            user?.fullName ??
            user?.emailAddresses[0]?.emailAddress;

        identify({
            // company level key
            company: {
                keys: {
                    id: user.id,
                },
                name: userName,
            },
            // user level key
            keys: {
                id: user.id,
            },
            name: userName,
        });

        lastIdentifiedUserId.current = user.id;
    }, [user?.id, identify]); // Only depend on user.id instead of the entire user object

    return children;
}

export default SchematicWrapped