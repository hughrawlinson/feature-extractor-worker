import { extractFeatures } from "./feature-extractor";

onmessage = function({ data }) {
  const [buffers, features, extractionParameters] = data;

  postMessage(extractFeatures(buffers, features, extractionParameters));
};
