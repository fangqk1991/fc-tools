import * as crypto from 'crypto'
import * as urlHelper from 'url'

export class Signature {
  private readonly _secret: string
  private readonly _expiration: number

  public constructor(secret: string, expiration = 600) {
    this._secret = secret
    this._expiration = expiration
  }

  public encodeBody(data: any): string {
    if (data === null) {
      return 'null'
    }
    if (typeof data === 'string') {
      return `"${data}"`
    }
    if (typeof data === 'number') {
      return `${data}`
    }
    if (Array.isArray(data)) {
      const content = data.map((item: any) => this.encodeBody(item)).join(',')
      return `[${content}]`
    }
    const keys = Object.keys(data)
    keys.sort()
    const content = keys.map((key: string) => `"${key}":${this.encodeBody(data[key])}`).join(',')
    return `{${content}}`
  }

  public sign(method: string, apiPath: string, queryParams: any, body: any = '') {
    method = method.toUpperCase()

    // @ts-ignore
    queryParams = Object.assign({}, queryParams)
    delete queryParams['_token']
    const sortedKeys = Object.keys(queryParams).sort()
    const query = sortedKeys.map(key => {
      return `${key}=${queryParams[key]}`
    }).join('&')
    const bodyContent = body ? this.encodeBody(body) : ''
    const items = []
    items.push(method)
    items.push(query)
    items.push(bodyContent)
    items.push(this._secret)
    return crypto.createHash('md5').update(items.join(',')).digest('hex')
  }

  public generateSignedUrl(method: string, url: string, extrasQueryParams: {} = {}, body: any = '') {
    extrasQueryParams = Object.assign({}, extrasQueryParams, {
      _expires: this.getExpires(),
    })
    const tmpUrl = injectUrlQueryParams(url, extrasQueryParams)
    const urlObj = urlHelper.parse(tmpUrl, true)
    const token = this.sign(method, urlObj.pathname as string, urlObj.query, body)
    return injectUrlQueryParams(urlHelper.format(urlObj), {
      _token: token,
    })
  }

  public getExpires() {
    return Math.floor((+new Date()) / 1000) + this._expiration
  }

  public checkSign(method: string, apiPath: string, queryParams: any, body: any = '') {
    const token = queryParams['_token']
    const token2 = this.sign(method, apiPath, queryParams, body)
    if (typeof body === 'object' && Object.keys(body).length > 0) {
      return token === token2
    }
    const token3 = this.sign(method, apiPath, queryParams, '')
    return token === token2 || token === token3
  }

  public checkExpires(queryParams: any) {
    const expires = queryParams['_expires']
    return expires >= Math.floor((+new Date()) / 1000)
  }
}

export function injectUrlQueryParams(urlStr: string, queryParams: {} = {}) {
  if (Object.keys(queryParams).length === 0) {
    return urlStr
  }

  const urlObj = urlHelper.parse(urlStr, true)
  urlObj.query = Object.assign({}, urlObj.query || {}, queryParams)
  urlObj.search = undefined
  return urlHelper.format(urlObj)
}
