import {
  ExtractFeatureCoreFunctionArgs,
  ExtractionParams
} from "feature-extractor-worker";
import { MeydaAudioFeature } from "meyda";

import FeatureExtractorWorker from "worker-loader!./feature-extractor.worker.ts";
import { extractFeatures as extractFeatureMainThreadInternal } from "./feature-extractor";

async function askWorkerToExtractFeatures(
  buffers: Float32Array[],
  audioFeatures: MeydaAudioFeature[],
  {
    bufferSize,
    hopSize,
    zeroPadding,
    windowingFunction
  }: Partial<ExtractionParams>
): Promise<DataObj> {
  return new Promise((resolve, reject) => {
    const worker = new FeatureExtractorWorker();

    worker.postMessage([
      buffers,
      audioFeatures,
      {
        bufferSize,
        hopSize,
        zeroPadding,
        windowingFunction
      }
    ]);

    worker.onerror = reject;

    worker.onmessage = ({ data }: DataObj) => {
      resolve(data);
    };
  });
}

async function getAudioBufferFromBlob(audioBlob: Blob): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
}

async function getAudioChannelDataFromBlob(
  audioBlob: Blob,
  selectedChannels?: number[]
): Promise<Float32Array[]> {
  const audioBuffer = await getAudioBufferFromBlob(audioBlob);
  const defaultChannels = Array.from(
    { length: audioBuffer.numberOfChannels },
    (_, i) => i
  );
  return (selectedChannels || defaultChannels).map(channelIndex =>
    audioBuffer.getChannelData(channelIndex)
  );
}

function extractFeatureFunctionFactory(
  extractFeatureCoreFunction: (
    buffers: Float32Array[],
    audioFeatures: MeydaAudioFeature[],
    extractionParams: Partial<ExtractionParams>
  ) => Promise<any>
) {
  return async function extractFeature({
    audioBlob,
    audioFeatures,
    extractionParams
  }: ExtractFeatureCoreFunctionArgs) {
    const bufferSize = extractionParams?.bufferSize || 4096;
    const hopSize = extractionParams?.hopSize || 0;
    const zeroPadding = extractionParams?.zeroPadding || 0;
    const windowingFunction = extractionParams?.windowingFunction || "hamming";

    const buffers = await getAudioChannelDataFromBlob(
      audioBlob,
      extractionParams?.channels
    );

    return extractFeatureCoreFunction(buffers, audioFeatures, {
      bufferSize,
      hopSize,
      zeroPadding,
      windowingFunction
    });
  };
}

export let extractFeature = extractFeatureFunctionFactory(
  askWorkerToExtractFeatures
);
export let extractFeatureMainThread = extractFeatureFunctionFactory(
  extractFeatureMainThreadInternal
);
