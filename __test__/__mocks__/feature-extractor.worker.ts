export default function MockFeatureExtractorWorker() {}

MockFeatureExtractorWorker.prototype.postMessage = function() {
  if (this.onmessage)
    setTimeout(
      this.onmessage({
        data: "MOCK_WORKER_POSTMESSAGE_DATA"
      }),
      0
    );
};
