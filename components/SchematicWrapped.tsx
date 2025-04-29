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

        // Identify user with Schematic
        const identifyUser = async () => {
            try {
                await identify({
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
            } catch (error) {
                console.error('Error identifying user with Schematic:', error);
            }
        };

        identifyUser();
    }, [user?.id, identify]);

    return children;
}

export default SchematicWrapped