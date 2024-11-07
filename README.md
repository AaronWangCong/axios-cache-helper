# axios-cache-helper

重复请求优化-基于axios的缓存策略,处理重复请求

## 安装

```bash
pnpm install axios-cache-helper
```

## 使用

- **useOptimizationCache 是初始化配置方法，不调用、不传值时使用默认配置**
- **ignoreRequest 忽略的请求地址，不进行缓存处理，支持字符串或者正则例如/getOrder/**
- **throttlingTime 重复请求间隔时间，默认200ms**

导入方式1（在同一个文件时使用）

```ts
import { useOptimizationCache } from 'axios-cache-helper';

const {
  optimizationCacheErrorsRes,
  optimizationCacheReq,
  optimizationCacheSuccessRes,
} = useOptimizationCache();
// 或者
const {
  optimizationCacheErrorsRes,
  optimizationCacheReq,
  optimizationCacheSuccessRes,
} = useOptimizationCache({
  throttlingTime: 200,
  ignoreRequest: [/getOrder/, '/getorder/search'],
});
```

导入方式2（在不同文件时可分别直接从库中导入）

```ts
import {
  useOptimizationCache,
  optimizationCacheErrorsRes,
  optimizationCacheReq,
  optimizationCacheSuccessRes,
} from 'axios-cache-helper';

useOptimizationCache();
// 或者
useOptimizationCache({ throttlingTime: 200, ignoreRequest: [] });
```

调用

```ts
// 请求拦截器中 config axios请求配置
await optimizationCacheReq(config);

// 响应拦截器中 成功 response axios响应配置
optimizationCacheSuccessRes(response);
// 响应拦截器中 失败 response axios响应配置
optimizationCacheErrorsRes(error);
```
