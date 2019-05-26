const assert = require('assert')
const Signature = require('../Signature')

describe('Test MySignature', () => {
  it(`Normal Test`, async () => {
    const secret = '123456'
    const signature = new Signature(secret, 600)
    const expires = signature.getExpires()
    const queryParams = {
      x: 123,
      y: 456,
      _expires: expires,
    }
    const method = 'GET'
    const apiPath = '/api/xxx/'
    const body = {
      xxx: 1,
      abc: 'abc',
    }
    queryParams['_token'] = signature.sign(method, apiPath, queryParams, body)
    assert.ok(signature.checkExpires(queryParams))
    assert.ok(signature.checkSign(method, apiPath, queryParams, body))
  })
})
