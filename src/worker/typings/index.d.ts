declare module "Meyda" {
  interface Global {
    AudioContext: any;
    AudioNode: any;
    ScriptProcessorNode: any;
  }
}

declare type AudioContext = any;
declare type AudioNode = any;
declare type ScriptProcessorNode = AudioNode;
