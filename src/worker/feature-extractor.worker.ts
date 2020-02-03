import { extractFeatures } from "../main/feature-extractor";

onmessage = async function({ data }) {
  const [buffers, features, extractionParameters] = data;

  postMessage(await extractFeatures(buffers, features, extractionParameters));
};

declare var self: DedicatedWorkerGlobalScope;
export {};
