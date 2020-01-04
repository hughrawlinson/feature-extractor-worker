import * as Meyda from "meyda/dist/node/main.js";
import { ExtractionParams } from "feature-extractor-worker";
import { MeydaAudioFeature } from "meyda";

interface SliceableArrayLike<T> extends ArrayLike<T> {
  slice(start: number, end: number): SliceableArrayLike<T>;
}

// https://scotch.io/courses/the-ultimate-guide-to-javascript-algorithms/array-chunking#toc-testing-performance-with-jsperf
function chunkArray(
  array: SliceableArrayLike<number>,
  length: number,
  hopSize: number
): SliceableArrayLike<number>[] {
  let result = [];
  for (let i = 0; i < array.length; i += length + hopSize) {
    let chunk = array.slice(i, i + length);
    result.push(chunk);
  }
  return result;
}

export async function extractFeatures(
  buffers: Float32Array[],
  features: MeydaAudioFeature[],
  {
    bufferSize,
    hopSize,
    zeroPadding,
    windowingFunction
  }: Partial<ExtractionParams>
): Promise<any> {
  return buffers.map((buffer: Float32Array) => {
    const chunkedBuffer = chunkArray(buffer, bufferSize, hopSize);
    return chunkedBuffer.map((chunk, chunkIndex) => {
      if (chunkIndex === chunkedBuffer.length - 1) {
        let newFullLengthChunk = new Float32Array(bufferSize);
        newFullLengthChunk.set(chunk);
        return Meyda.extract(features, newFullLengthChunk);
      }
      return Meyda.extract(features, chunk);
    });
  });
}
