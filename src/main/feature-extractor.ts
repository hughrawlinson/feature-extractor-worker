import {
  MeydaAudioFeature,
  MeydaSignal,
  MeydaFeaturesObject,
  MeydaWindowingFunction,
  extract as meydaExtract,
  default as Meyda
} from "meyda";

// Meyda `extract` expects to be bound to an object, so it doesn't work super
// well with es6 modules. This is a hack and I'm sorry on many counts.
const extract = meydaExtract.bind(Meyda);

// https://scotch.io/courses/the-ultimate-guide-to-javascript-algorithms/array-chunking#toc-testing-performance-with-jsperf
function chunkArray(
  array: MeydaSignal,
  length: number,
  hopSize: number
): MeydaSignal[] {
  let result = [];
  for (let i = 0; i < array.length; i += length + hopSize) {
    let chunk = array.slice(i, i + length);
    result.push(chunk);
  }
  return result;
}

export type ExtractionParams = {
  bufferSize: number;
  hopSize?: number;
  zeroPadding?: number;
  channels?: number[];
  windowingFunction?: MeydaWindowingFunction;
};

export async function extractFeatures(
  buffers: Float32Array[],
  features: MeydaAudioFeature[],
  { bufferSize, hopSize, zeroPadding, windowingFunction }: ExtractionParams
): Promise<Partial<MeydaFeaturesObject | null>[][]> {
  return buffers.map((buffer: Float32Array) => {
    const chunkedBuffer = chunkArray(buffer, bufferSize, hopSize ?? 0);
    return chunkedBuffer.map((chunk, chunkIndex) => {
      if (chunkIndex === chunkedBuffer.length - 1) {
        let newFullLengthChunk = new Float32Array(bufferSize);
        newFullLengthChunk.set(chunk);
        return extract(features, newFullLengthChunk);
      }
      return extract(features, chunk as MeydaSignal);
    });
  });
}
