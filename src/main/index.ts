import { MeydaAudioFeature, MeydaFeaturesObject } from "meyda";

import { ExtractionParams } from "./feature-extractor";

export type ExtractFeatureCoreFunctionArgs = {
  audioBlob: Blob;
  audioFeatures: MeydaAudioFeature[];
  extractionParams: ExtractionParams;
};

import FeatureExtractorWorker from "worker-loader?fallback=true&inline!../worker/feature-extractor.worker.ts";
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
): Promise<Partial<MeydaFeaturesObject | null>[][]> {
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

    worker.onmessage = ({ data }: MessageEvent) => {
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
    extractionParams: ExtractionParams
  ) => Promise<Partial<MeydaFeaturesObject | null>[][]>
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

/**
 * Extract specified features from given `Blob` containing audio information in a worker.
 * @param options - A single object wrapping all options
 * @param audioBlob - a `Blob` that contains an arrayBuffer containing audio decodeable by `AudioContext.decodeAudioData`
 * @param audioFeatures - a list of {@link https://meyda.js.org/audio-features|Meyda Audio Features} for extraction
 * @param extractionParams - a collection of params used in the feature extraction. See {@typedef ExtractionParams}
 */
export function extractFeature(options: ExtractFeatureCoreFunctionArgs) {
  return extractFeatureFunctionFactory(askWorkerToExtractFeatures).call(
    null,
    options
  );
}

/**
 * Extract specified features from given `Blob` containing audio information on the main thread.
 * @param options - A single object wrapping all options
 * @param audioBlob - a `Blob` that contains an arrayBuffer containing audio decodeable by `AudioContext.decodeAudioData`
 * @param audioFeatures - a list of {@link https://meyda.js.org/audio-features|Meyda Audio Features} for extraction
 * @param extractionParams - a collection of params used in the feature extraction. See {@typedef ExtractionParams}
 */
export function extractFeatureMainThread(
  options: ExtractFeatureCoreFunctionArgs
) {
  return extractFeatureFunctionFactory(extractFeatureMainThreadInternal).call(
    null,
    options
  );
}
