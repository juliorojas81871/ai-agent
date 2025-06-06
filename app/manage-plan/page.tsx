import React from 'react'
import SchematicComponent from "@/components/schematic/SchematicComponent";

function ManagePlan() {
    const componentId = process.env.NEXT_PUBLIC_SCHEMATIC_COMPONENT || "";
    return (
        <div className="container mx-auto p-4 md:p-0">
            <h1 className="text-2xl font-bold mb-4 my-8">Manage Your Plan</h1>
            <p className="text-gray-600 mb-8">
                Manage your subscription and billing details here.
            </p>

            <SchematicComponent componentId={componentId} />
        </div>
    );
}

export default ManagePlan;