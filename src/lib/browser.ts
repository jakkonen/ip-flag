const browserApi =
  (globalThis as typeof globalThis & { browser?: any; chrome?: any }).browser ??
  (globalThis as typeof globalThis & { browser?: any; chrome?: any }).chrome;

if (!browserApi) {
  throw new Error('WebExtensions API is not available');
}

export default browserApi;
