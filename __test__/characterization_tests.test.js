const { extractFeature, extractFeatureMainThread, availableFeatureExtractors } = require("../src/main/");
const { extractFeatures, extractFeaturesObservable } = require('../src/main/feature-extractor');

window.AudioContext = jest.fn().mockImplementation(() => ({
    decodeAudioData: jest.fn().mockImplementation(() => ({
      numberOfChannels: 3,
      // TODO: Test a length with a power of two
      getChannelData: jest.fn().mockImplementation(() => new Float32Array(19932))
    }))
}));

const mockAudioBlob = {
  arrayBuffer: jest.fn().mockImplementation(() => ({}))
};

describe('extractFeatures', () => {
  it('does something', async function() {
    const call = await extractFeature({
      audioBlob: mockAudioBlob,
      audioFeatures: ['amplitudeSpectrum'],
      extractionParams: { bufferSize: 20 }
    });
    expect(call).toMatchSnapshot();
  });

  it('does something on the main thread', async function() {
    expect(await extractFeatureMainThread({
      audioBlob: mockAudioBlob,
      audioFeatures: ['amplitudeSpectrum'],
      extractionParams: { bufferSize: 1024 }
    }))
  });

  it('makes certain features available', () => {
    expect(availableFeatureExtractors).toMatchSnapshot();
  });
});

describe('feature-extractor', () => {
  it('is callable', async function() {
    expect(await extractFeatures([new Float32Array(15)], ['zcr'], {
      bufferSize: 8,
      hopSize: 0,
      zeroPadding: 0,
      windowingFunction: 0,
    })).toMatchSnapshot();
  });
});

describe('feature-extractor-observable', () => {
  it('is callable', async function() {
    extractFeaturesObservable(
      [],
      ['zcr'],
      { bufferSize: 32 },
      { batchSize: 10 }
    ).subscribe(result => {
      console.log(result);
      return expect(result).toMatchInlineSnapshot();
    });
  });
});
