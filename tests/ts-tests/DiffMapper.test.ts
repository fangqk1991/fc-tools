import * as assert from 'assert'
import { DiffMapper, DiffType } from '../../src'

describe('Test DiffMapper', () => {
  it(`Normal Test`, async () => {
    const fromObj = {
      unchangedStr: '123',
      unchangedNumber: 123,
      changedStr: '123',
      oldNumber: 123,
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
      newNumber: 123,
      unchangedObj: {
        a: 1,
      },
      changedObj: {
        a: 2,
        c: 3,
        d: {},
        e: {
          ee: {
            eee: 1
          }
        }
      },
      arr: [1, 1, 2, 3],
    }

    {
      const mapper = new DiffMapper(fromObj, toObj)
      const result = mapper.buildCompareMap()
      assert.ok(result['unchangedStr'])
      assert.ok(result['unchangedStr']['type'] === DiffType.Unchanged)
      assert.ok(result['unchangedNumber'])
      assert.ok(result['unchangedNumber']['type'] === DiffType.Unchanged)
      assert.ok(result['changedStr'])
      assert.ok(result['changedStr']['type'] === DiffType.Updated)
      assert.ok(result['changedObj'])
      assert.ok(result['unchangedObj'])
      assert.ok(result['oldNumber'])
      assert.ok(result['oldNumber']['type'] === DiffType.Deleted)
      assert.ok(result['newNumber'])
      assert.ok(result['newNumber']['type'] === DiffType.Created)
    }

    {
      const mapper = new DiffMapper(fromObj, toObj)
      const result = mapper.buildDiffMap()
      assert.ok(!result['unchangedStr'])
      assert.ok(!result['unchangedNumber'])
      assert.ok(!result['unchangedNumber'])
      assert.ok(result['changedStr'])
      assert.ok(result['changedStr']['type'] === DiffType.Updated)
      assert.ok(result['changedObj'])
      assert.ok(!result['unchangedObj'])
      assert.ok(result['oldNumber'])
      assert.ok(result['oldNumber']['type'] === DiffType.Deleted)
      assert.ok(result['newNumber'])
      assert.ok(result['newNumber']['type'] === DiffType.Created)
    }

    {
      const mapper = new DiffMapper(fromObj, toObj)
      const compareItems = mapper.buildCompareItems()
      compareItems.forEach((item) => {
        let fromItem: any = fromObj
        let toItem: any = toObj
        item.keychain.forEach((key) => {
          fromItem = fromItem[key]
          toItem = toItem[key]
        })

        if (item.type === DiffType.Unchanged) {
          assert.equal(fromItem, toItem)
        } else {
          assert.notEqual(fromItem, toItem)
        }

        assert.equal(item.from, fromItem)
        assert.equal(item.to, toItem)
      })
    }

    {
      const mapper = new DiffMapper(fromObj, toObj)
      const diffItems = mapper.buildDiffItems()
      diffItems.forEach((item) => {
        assert.notEqual(item.type, DiffType.Unchanged)
      })
    }
  })
})
