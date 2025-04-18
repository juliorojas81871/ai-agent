export enum FeatureFlag {
    TRANSCRIPTION = "transcription",
    IMAGE_GENERATION = "image-generation",
    ANALYSE_VIDEO = "analysis-video",
    TITLE_GENERATIONS = "title-generations",
    SCRIPT_GENERATION = "script-generation",
}

export const featureFlagEvents: Record<FeatureFlag, { event: string }> = {
    [FeatureFlag.TRANSCRIPTION]: {
        event: "transcribe",
    },
    [FeatureFlag.IMAGE_GENERATION]: {
        event: "generate-image",
    },
    [FeatureFlag.ANALYSE_VIDEO]: {
        event: "analysis-video",
    },
    [FeatureFlag.TITLE_GENERATIONS]: {
        event: "generate-title",
    },
    [FeatureFlag.SCRIPT_GENERATION]: {
        event: "",
    },
};