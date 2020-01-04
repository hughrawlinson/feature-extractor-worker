import FeatureExtractorWorker from './feature-extractor.worker.js';
import { extractFeatures as extractFeatureMainThreadInternal } from './feature-extractor';

async function askWorkerToExtractFeatures(buffers, audioFeatures, {bufferSize, hopSize, zeroPadding, windowingFunction}) {
  return new Promise((resolve, reject) => {
    const worker = new FeatureExtractorWorker();

    worker.postMessage([buffers, audioFeatures, {
      bufferSize,
      hopSize,
      zeroPadding,
      windowingFunction
    }]);

    worker.onerror = reject;

    worker.onmessage = ({data}) => {
      resolve(data);
    };
  });
}

async function getAudioBufferFromBlob(audioBlob) {
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
}

async function getAudioChannelDataFromBlob(audioBlob, selectedChannels) {
  const audioBuffer = await getAudioBufferFromBlob(audioBlob);
  const defaultChannels = [...Array(audioBuffer.numberOfChannels).keys()];
  return (selectedChannels || defaultChannels).map(channelIndex => audioBuffer.getChannelData(channelIndex));
}

function extractFeatureFunctionFactory(extractFeatureCoreFunction) {
  return async function extractFeature({
    audioBlob,
    audioFeatures,
    extractionParams
  }) {
    const bufferSize = extractionParams?.bufferSize || 4096;
    const hopSize = extractionParams?.hopSize || 0;
    const zeroPadding = extractionParams?.zeroPadding || 0;
    const windowingFunction = extractionParams?.windowingFunction || 'hamming';

    const buffers = await getAudioChannelDataFromBlob(audioBlob, extractionParams.channels)

    return extractFeatureCoreFunction(buffers, audioFeatures, { bufferSize, hopSize, zeroPadding, windowingFunction });
  }
}

export let extractFeature = extractFeatureFunctionFactory(askWorkerToExtractFeatures);
export let extractFeatureMainThread = extractFeatureFunctionFactory(extractFeatureMainThreadInternal);
