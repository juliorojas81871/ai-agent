import React from 'react'
type AgentPulseProps = {
    size?: "small" | "medium" | "large";
    color?: "blue" | "green" | "purple";
}

function AgentPulse({ size = "medium", color = "blue"}: AgentPulseProps) {
    const sizeClasses = {
        small: "w-4 h-4",
        medium: "w-12 h-12",
        larger: "w-16 h-16"
    }

    const colorClassses = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        purple: "bg-purple-500",
    }

    return (
        <div>AgentPulse</div>
    )
}

export default AgentPulse