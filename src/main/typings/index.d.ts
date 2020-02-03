// The File API that specifies the arrayBuffer method on the Blob type is so poorly supported that
// Typescript doesn't include the type. Should consider using the FileReader API instead, which
// is more widely supported.
interface Blob {
  arrayBuffer(): Promise<ArrayBuffer>;
}

// This is necessary to make Typescript play nice with worker-loader
declare module "worker-loader*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}

declare module "meyda/src/featureExtractors" {}
