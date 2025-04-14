'use client';
import { SchematicEmbed as SchematicEmbedComponent} from "@schematichq/schematic-components";

const SchematicEmbed = ({
        token, componentId
    } : {
        token: string;
        componentId: string;
    }) => {

    return (
        <SchematicEmbedComponent accessToken={token} id={componentId} />
    );
}

export default SchematicEmbed