"use client";
import { useUser } from "@clerk/nextjs";
import { useSchematicEvents } from "@schematichq/schematic-react";
import { useEffect } from "react";

const SchematicWrapped = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { identify } = useSchematicEvents();


    useEffect(() => {
    const userName =
        user?.id ??
        user?.username ??
        user?.fullName ??
        user?.emailAddresses[0]?.emailAddress;

    if (user?.id) {
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
    }
    }, [user, identify]);

    return children;
}

export default SchematicWrapped