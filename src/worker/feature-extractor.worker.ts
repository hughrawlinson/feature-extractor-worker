import { extractFeatures } from "../main/feature-extractor";

self.onmessage = async function({ data }) {
  const [buffers, features, extractionParameters] = data;

  self.postMessage(
    await extractFeatures(buffers, features, extractionParameters)
  );
};

declare var self: DedicatedWorkerGlobalScope;
export {};
