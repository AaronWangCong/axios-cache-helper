import type { AxiosRequestConfig, AxiosResponse } from 'axios'

type RequestConfig = {
  /** 请求key */
  pendKey?: string
  /** 不否使用缓存 */
  isNoCache?: boolean
} & AxiosRequestConfig

type ICbFn = (res: any) => void

interface IOptions {
  /** 节流时间-时间毫秒内连续的相同请求会取缓存的数据返回给业务侧 */
  throttlingTime: number
  /** 忽略的请求地址 */
  ignoreRequest: (string | RegExp)[]
}

/** 发布订阅 */
class EventEmitter {
  /** 订阅事件 */
  event: { [key: string]: ICbFn[][] }
  /** 节流时间-时间毫秒内连续的相同请求会取缓存的数据返回给业务侧 */
  throttlingTime: IOptions['throttlingTime']
  /** 忽略的请求地址 */
  ignoreRequest: IOptions['ignoreRequest']
  constructor() {
    this.event = {}
    this.throttlingTime = 200
    this.ignoreRequest = []
  }

  /** 订阅事件 */
  on(key: string, resolve: ICbFn, reject: ICbFn) {
    if (!this.event[key])
      this.event[key] = [[resolve, reject]]
    else this.event[key].push([resolve, reject])
  }

  /** 发布事件 */
  emit(key: string, res: any, cbType: 'resolve' | 'reject') {
    if (this.event[key]) {
      this.event[key].forEach((cbArr) => {
        if (cbType === 'resolve')
          cbArr[0](res)
        else cbArr[1](res)
      })
    }
  }

  /** 初始化参数 */
  init({ throttlingTime = 200, ignoreRequest = [] }: IOptions) {
    this.throttlingTime = throttlingTime
    this.ignoreRequest = ignoreRequest
  }
}

/** 存储已发送但未响应的请求 */
const pendingRequest = new Set()
/** 发布订阅容器 */
const eventBox = new EventEmitter()

/** 根据请求生成对应的key */
function generateReqKey(config: RequestConfig, pathname: string) {
  const { method, url, params, data } = config
  return [
    method,
    url,
    JSON.stringify(params),
    JSON.stringify(data),
    pathname,
  ].join('&')
}

/** 接口请求缓存-阻止重复请求 */
export async function optimizationCacheReq(config: RequestConfig) {
  if (config.isNoCache || isIgnoreHttp(config.url))
    return

  // 获取hash
  const pathname = location.pathname
  // 生成请求Key
  const reqKey = generateReqKey(config, pathname)
  if (pendingRequest.has(reqKey)) {
    let res = null
    try {
      res = await new Promise((resolve, reject) => {
        eventBox.on(reqKey, resolve, reject)
      })
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        type: 'Success',
        val: res,
      })
    }
    catch (err) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        type: 'Error',
        val: err,
      })
    }
  }
  else {
    // 将请求的key保存在config
    config.pendKey = reqKey
    pendingRequest.add(reqKey)
  }

  return config
}

/** 接口响应成功 */
export function optimizationCacheSuccessRes(
  response: AxiosResponse<any, any> & { config: RequestConfig },
) {
  const reqKey = response.config.pendKey || ''
  if (pendingRequest.has(reqKey)) {
    let res: any = null
    try {
      res = JSON.parse(JSON.stringify(response))
    }
    catch (e) {
      console.log(e)
      res = response
    }

    setTimeout(() => {
      eventBox.emit(reqKey, res, 'resolve')
      pendingRequest.delete(reqKey)
      delete eventBox.event[reqKey]
    }, eventBox.throttlingTime)
  }
}

/** 接口响应失败 */
export function optimizationCacheErrorsRes(error: {
  config: RequestConfig
  type: 'Success' | 'Error'
  val: any
}) {
  if (error.type && error.type === 'Success') {
    return Promise.resolve(error.val)
  }
  else if (error.type && error.type === 'Error') {
    return Promise.reject(error.val)
  }
  else {
    const reqKey = error.config.pendKey || ''
    if (pendingRequest.has(reqKey)) {
      let res: any = null
      try {
        res = JSON.parse(JSON.stringify(error))
      }
      catch (e) {
        console.log(e)
        res = error
      }

      setTimeout(() => {
        pendingRequest.delete(reqKey)
        eventBox.emit(reqKey, res, 'reject')
        delete eventBox.event[reqKey]
      }, eventBox.throttlingTime)
    }
  }
  return Promise.reject(error)
}

export function isRegExp(v: any) {
  return Object.prototype.toString.call(v) === `[object RegExp]`
}

/** 判断请求地址是否为需要拦截的 */
function isIgnoreHttp(url?: string): boolean {
  if (!eventBox.ignoreRequest.length || !url)
    return false
  return eventBox.ignoreRequest.some((item) => {
    if (isRegExp(item))
      return (item as RegExp).test(url)
    else return url === item
  })
}

/** 初始化方法 */
export function useOptimizationCache(options?: IOptions) {
  options && eventBox.init(options)

  return {
    optimizationCacheReq,
    optimizationCacheSuccessRes,
    optimizationCacheErrorsRes,
  }
}
