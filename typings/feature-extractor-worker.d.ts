declare module "feature-extractor-worker" {
  type ExtractionParams = {
    bufferSize: number;
    hopSize: number;
    zeroPadding: number;
    channels: number[];
    windowingFunction: MeydaWindowingFunction;
  };

  type ExtractFeatureCoreFunctionArgs = {
    audioBlob: Blob;
    audioFeatures: MeydaAudioFeature[];
    extractionParams?: ExtractionParams;
  };
}
