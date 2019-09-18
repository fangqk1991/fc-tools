import * as assert from 'assert'
import { DiffMapper, DiffType } from '../../src'

describe('Test DiffMapper', () => {
  it(`Normal Test`, async () => {
    const fromObj = {
      unchangedStr: '123',
      unchangedNumber: 123,
      changedStr: '123',
      oldObj: 123,
      unchangedObj: {
        a: 1,
      },
      changedObj: {
        a: 1,
        b: 2,
        d: {},
      },
      arr: [1, 2, 3],
    }
    const toObj = {
      unchangedStr: '123',
      unchangedNumber: 123,
      changedStr: '456',
      newObj: 123,
      unchangedObj: {
        a: 1,
      },
      changedObj: {
        a: 2,
        c: 3,
        d: {},
      },
      arr: [1, 1, 2, 3],
    }

    {
      const result = DiffMapper.compare(fromObj, toObj)
      console.log(result)
      assert.ok(result['unchangedStr'])
      assert.ok(result['unchangedStr']['type'] === DiffType.Unchanged)
      assert.ok(result['unchangedNumber'])
      assert.ok(result['unchangedNumber']['type'] === DiffType.Unchanged)
      assert.ok(result['changedStr'])
      assert.ok(result['changedStr']['type'] === DiffType.Updated)
      assert.ok(result['changedObj'])
      assert.ok(result['unchangedObj'])
      assert.ok(result['oldObj'])
      assert.ok(result['oldObj']['type'] === DiffType.Deleted)
      assert.ok(result['newObj'])
      assert.ok(result['newObj']['type'] === DiffType.Created)
    }

    {
      const result = DiffMapper.diff(fromObj, toObj)
      console.log(result)
      assert.ok(!result['unchangedStr'])
      assert.ok(!result['unchangedNumber'])
      assert.ok(!result['unchangedNumber'])
      assert.ok(result['changedStr'])
      assert.ok(result['changedStr']['type'] === DiffType.Updated)
      assert.ok(result['changedObj'])
      assert.ok(!result['unchangedObj'])
      assert.ok(result['oldObj'])
      assert.ok(result['oldObj']['type'] === DiffType.Deleted)
      assert.ok(result['newObj'])
      assert.ok(result['newObj']['type'] === DiffType.Created)
    }
  })
})
