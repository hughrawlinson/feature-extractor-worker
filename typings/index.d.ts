interface DataObj {
  data?: any;
}

// The File API that specifies the arrayBuffer method on the Blob type is so poorly supported that
// Typescript doesn't include the type. Should consider using the FileReader API instead, which
// is more widely supported.
interface Blob {
  arrayBuffer(): Promise<ArrayBuffer>;
}

declare module "worker-loader!./feature-extractor.worker.ts" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}
