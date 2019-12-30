import FeatureExtractorWorker from './feature-extractor.worker.js';

export async function extractFeature({
  audioBlob,
  audioFeatures,
  extractionParams
}) {
  const bufferSize = extractionParams?.bufferSize || 4096;
  const hopSize = extractionParams?.hopSize || 0;
  const zeroPadding = extractionParams?.zeroPadding || 0;
  const windowingFunction = extractionParams?.windowingFunction || 'hamming';

  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());

  const channels = extractionParams?.channels || [...Array(audioBuffer.numberOfChannels).keys()];

  const buffers = channels
    .map(channelIndex => audioBuffer.getChannelData(channelIndex));

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
