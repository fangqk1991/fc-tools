export enum DiffType {
  Created = 'Created',
  Updated = 'Updated',
  Deleted = 'Deleted',
  Unchanged = 'Unchanged',
}

export interface DiffEntity {
  type: DiffType
  from: any
  to: any
}

const isFunction = function (x: any) {
  return Object.prototype.toString.call(x) === '[object Function]'
}

const isArray = function (x: any) {
  return Object.prototype.toString.call(x) === '[object Array]'
}

const isDate = function (x: any) {
  return Object.prototype.toString.call(x) === '[object Date]'
}

const isObject = function (x: any) {
  return Object.prototype.toString.call(x) === '[object Object]'
}

const isValue = function (x: any) {
  return !isObject(x) && !isArray(x)
}

const compareValues = function(value1: any, value2: any) {
  if (value1 === value2) {
    return DiffType.Unchanged
  }
  if (isDate(value1) && isDate(value2) && value1.getTime() === value2.getTime()) {
    return DiffType.Unchanged
  }
  if (value1 === undefined) {
    return DiffType.Created
  }
  if (value2 === undefined) {
    return DiffType.Deleted
  }
  return DiffType.Updated
}

export class DiffMapper {
  private readonly fromObj: {}
  private readonly toObj: {}

  public constructor(fromObj: {}, toObj: {}) {
    this.fromObj = fromObj
    this.toObj = toObj
  }

  private _compare(obj1: any, obj2: any) {
    if (isFunction(obj1) || isFunction(obj2)) {
      throw 'Invalid argument. Function given, object expected.';
    }
    if (isValue(obj1) || isValue(obj2)) {
      return {
        type: compareValues(obj1, obj2),
        from: obj1,
        to: obj2,
      } as DiffEntity
    }

    let diff: any = {};
    for (let key in obj1) {
      if (isFunction(obj1[key])) {
        continue;
      }

      let value2 = undefined;
      if (obj2[key] !== undefined) {
        value2 = obj2[key];
      }

      diff[key] = this._compare(obj1[key], value2);
    }
    for (let key in obj2) {
      if (isFunction(obj2[key]) || diff[key] !== undefined) {
        continue
      }

      diff[key] = this._compare(undefined, obj2[key])
    }

    return diff
  }

  public buildDiffMap() {
    const result = this.buildFullResult()

    const trimNodes = (node: any) => {
      if (Object.keys(node).length === 3 && 'type' in node && 'from' in node && 'to' in node) {
        return node['type'] !== DiffType.Unchanged
      }
      for (const key in node) {
        if (!trimNodes(node[key])) {
          delete node[key]
        }
      }
      return Object.keys(node).length > 0
    }

    trimNodes(result)
    return result
  }

  public buildFullResult() {
    return this._compare(this.fromObj, this.toObj)
  }

  public static compare(fromObj: {}, toObj: {}) {
    return new this(fromObj, toObj).buildFullResult()
  }

  public static diff(fromObj: {}, toObj: {}) {
    return new this(fromObj, toObj).buildDiffMap()
  }
}
