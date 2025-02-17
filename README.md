# Axios-Cache-Helper

English | [简体中文](README.zh.md)

<p align="center">
  <a href="https://www.npmjs.org/package/axios-cache-helper">
    <img src="https://img.shields.io/npm/v/axios-cache-helper.svg" />
  </a>
  <a href="https://github.com/AaronWangCong/axios-cache-helper">
    <img src="https://img.shields.io/badge/node-%20%3E%3D%2018-47c219" />
  </a>
  <br>
</p>
Repeated request optimization Based on axios cache policy, duplicate requests are handled. In principle, the same concurrent request is cached. There will be only one request, and other requests will directly return the results, reducing server pressure, reducing unnecessary requests, and improving performance.

## Install

```bash
pnpm install axios-cache-helper
```

## Use

- **useOptimizationCache It is an initialization configuration method that uses default configuration when not calling or passing values**
- **ignoreRequest Ignore the request address, do not cache it, support strings or regularization such as `/getOrder`**
- **throttlingTime Repeat request interval time, default 200ms**

#### Import method 1 (used within the same file)

```ts
import { useOptimizationCache } from 'axios-cache-helper';

const {
  optimizationCacheErrorsRes,
  optimizationCacheReq,
  optimizationCacheSuccessRes,
} = useOptimizationCache();
// OR
const {
  optimizationCacheErrorsRes,
  optimizationCacheReq,
  optimizationCacheSuccessRes,
} = useOptimizationCache({
  throttlingTime: 200,
  ignoreRequest: [/getOrder/, '/getorder/search'],
});
```

#### Import method 2 (can be directly imported from the library for different files)

```ts
import {
  optimizationCacheErrorsRes,
  optimizationCacheReq,
  optimizationCacheSuccessRes,
  useOptimizationCache,
} from 'axios-cache-helper';

useOptimizationCache();
// OR
useOptimizationCache({ throttlingTime: 200, ignoreRequest: [] });
```

#### Call method

```ts
// Configure axios request configuration in the request interceptor
await optimizationCacheReq(config);

// Successful response axios configuration in response interceptor
optimizationCacheSuccessRes(response);
// Failed response axios configuration in response interceptor
optimizationCacheErrorsRes(error);
```
