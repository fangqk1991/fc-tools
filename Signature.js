const crypto = require('crypto')

class Signature {
  constructor(secret, expiration = 600) {
    this._secret = secret
    this._expiration = expiration
  }

  encodeBody(data) {
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
      const content = data.map(item => this.encodeBody(item)).join(',')
      return `[${content}]`
    }
    const keys = Object.keys(data)
    keys.sort()
    const content = keys.map(key => `"${key}":${this.encodeBody(data[key])}`).join(',')
    return `{${content}}`
  }

  /**
   * @param method {string}
   * @param apiPath {string}
   * @param queryParams {Object}
   * @param body {Object}
   * @returns {string}
   */
  sign(method, apiPath, queryParams, body = '') {
    method = method.toUpperCase()

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

  /**
   * @returns {Number}
   */
  getExpires() {
    return Math.floor((+new Date()) / 1000) + this._expiration
  }

  /**
   * @param method {string}
   * @param apiPath {string}
   * @param queryParams {Object}
   * @param body {Object}
   * @returns {boolean}
   */
  checkSign(method, apiPath, queryParams, body = '') {
    const token = queryParams['_token']
    const token2 = this.sign(method, apiPath, queryParams, body)
    if (typeof body === 'object' && Object.keys(body).length > 0) {
      return token === token2
    }
    const token3 = this.sign(method, apiPath, queryParams, '')
    return token === token2 || token === token3
  }

  /**
   * @param queryParams {Object}
   * @returns {boolean}
   */
  checkExpires(queryParams) {
    const expires = queryParams['_expires']
    return expires >= Math.floor((+new Date()) / 1000)
  }
}

module.exports = Signature
