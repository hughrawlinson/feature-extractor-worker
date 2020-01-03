import Meyda from '../node_modules/meyda/dist/node/main.js';

// https://scotch.io/courses/the-ultimate-guide-to-javascript-algorithms/array-chunking#toc-testing-performance-with-jsperf
function chunkArray(array, length, hopSize) {
    let result = []
    for (let i = 0; i < array.length; i += length + hopSize) {
        let chunk = array.slice(i, i + length)
        result.push(chunk)
    }
    return result
}

export function extractFeatures(buffers, features, {
  bufferSize, hopSize, zeroPadding, windowingFunction
}) {

  return buffers.map(buffer => {
    const chunkedBuffer = chunkArray(buffer, bufferSize, hopSize)
    return chunkedBuffer.map((chunk, chunkIndex) => {
      if (chunkIndex === chunkedBuffer.length-1) {
        let newFullLengthChunk = new Float32Array(bufferSize);
        newFullLengthChunk.set(chunk);
        return Meyda.extract(features, newFullLengthChunk);
      }
      return Meyda.extract(features, chunk);
    });
  });
}
