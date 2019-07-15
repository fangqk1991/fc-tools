import * as assert from 'assert'
import { Signature } from '../../src'

describe('Test MySignature', () => {
  it(`Normal Test`, async () => {
    const appid = 'abcdefg'
    const secret = '123456'
    const signature = new Signature(secret, 600)
    const expires = signature.getExpires()
    const queryParams: any = {
      x: 123,
      y: 456,
    }
    queryParams['_appid'] = appid
    queryParams['_expires'] = expires

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
