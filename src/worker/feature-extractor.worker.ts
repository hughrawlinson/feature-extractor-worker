import {
  extractFeatures,
  extractFeaturesObservable
} from "../main/feature-extractor";

self.onmessage = async function({ data }) {
  const [buffers, features, extractionParameters, internalParameters] = data;

  const batchSize = internalParameters.batchSize || buffers.length;

  for (
    let batchStartIndex = 0;
    batchStartIndex < Math.ceil(buffers.length / batchSize);
    batchStartIndex++
  ) {
    const batchBuffers = new Array(batchSize)
      .fill(0)
      .map((_, i) => buffers[i + batchStartIndex] || undefined)
      .filter(v => !!v);

    self.postMessage(await extractFeatures(buffers, features, extractionParameters));
  }
};

declare var self: DedicatedWorkerGlobalScope;
export {};
