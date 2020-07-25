/* eslint-disable standard/no-callback-literal */
import R from 'ramda'

const tap = (fn) => (x) => {
  fn(x)

  return x
}

const log = (label) => (...x) => console.log(label + ': ', ...x)

const identity = (x) => x

const partial = (fn, ...presetArgs) => (...laterArgs) => fn(...presetArgs, ...laterArgs)

function curry(fn, arity = fn.length) {
  return (function nextCurried(prevArgs) {
    return function curried(nextArg) {
      const args = prevArgs.concat([nextArg])

      if (args.length >= arity) {
        return fn(...args)
      } else {
        return nextCurried(args)
      }
    }
  })([])
}

const curry2 = (fn, arity = fn.length) => {
  const nextCurried = (prevArgs) => (...nextArgs) => {
    const args = prevArgs.concat(nextArgs)

    if (args.length >= arity) {
      return fn(...args)
    } else {
      return nextCurried(args)
    }
  }

  return nextCurried([])
}

const add = (a, b, c) => a + b + c

// partial
const add1 = partial(add, 10)

// 传递的参数符合 partial 后的数量
log('add1')(add1(2, 3))

const add2 = curry2(add)(10)(20)

log('add2')(add2(10))

function reverseArgs(fn) {
  return function argsReversed(...args) {
    return fn(...args.reverse())
  }
}

// const reverseArgs2 = (fn) => (...args) => fn(args.reverse())

const fakeRequest = (url, data, cb) => {
  log('fake request')(url, data)

  cb({
    message: 'response ok',
    data,
  })
}

// [callback, data, url]
const rq1 = partial(reverseArgs(fakeRequest), tap(log('fake request callback')))

rq1({ name: 'hello' }, 'http://example.com')

// [url, data]
const rq2 = reverseArgs(rq1)

rq2('http://example.com', { name: 'hello' })

// ? bindCallback
const bindLast = (fn) => (cb) => (...args) => {
  return fn(...args, cb)
}

const rq3 = bindLast(fakeRequest)(tap(log('last callback')))

rq3('http://example.com', { name: 'hello world ' })

/**
 * fn args
 * reverseArgs(fn)  ...args.reverse() | fn(url, data, callback) => fn(callback, data, url)    [callback]
 * reverseArgs(fn) | partial(fn, callback)(url, data)
 */
function partialRight(fn, ...presetArgs) {
  return reverseArgs(partial(reverseArgs(fn), ...presetArgs.reverse()))
}

const rq4 = partialRight(fakeRequest, tap(log('partialRight callback')))

rq4('http://example.com', { name: 'hello partialRight' })

// 确保只传递一个参数
const unary = (fn) => (args) => {
  return fn(args)
}

// unary(((a, b) => a + b)(10))(20) == 30

log('unary')(unary(((a) => (b) => a + b)(10))(20))

function uncurry(fn) {
  return function uncurried(...args) {
    let ret = fn

    for (let index = 0; index < args.length; index++) {
      ret = ret(args[index])
    }

    return ret
  }
}

// curry

const addCurry = curry(add)

const a1 = addCurry(1)(2)(3)

log('a1')(a1)

const a2 = uncurry(addCurry)(1, 2, 3)

log('a2')(a2)

const a3 = [1, 2, 3].map(R.unary(parseInt))

log('a3')(a3)

// eq R.always
const constant = (v) => () => v

Promise.resolve(1)
  .then(constant(Promise.resolve(2)))
  .then(tap(log('constant promise value')))

const when = (predicate, fn) => {
  return (...args) => {
    if (predicate(...args)) {
      return fn(...args)
    }

    return identity(...args)
  }
}

const not = (predicate) => {
  return (...args) => {
    return !predicate(...args)
  }
}

const isGt10 = (x) => x > 10

const isLt10 = not(isGt10)

const output = tap(log('output log'))

const x = (b) => (a, c) => when(a, b)(c)

const cd0 = x(output)

const a4 = cd0(isGt10, 20)
const a5 = cd0(isLt10, 11)

log('a4')(a4)
log('a5')(a5)

// compsoe

function compose2(fn2, fn1) {
  return function composed(args) {
    console.log(fn1, fn2)
    return fn2(fn1(args))
  }
}

const add3 = compose2(tap(log('add 3 result')), (x) => x + 10)

log('add3', add3(10))

function compose(...fns) {
  return function composed(result) {
    // copy
    var list = fns.slice()

    while (list.length > 0) {
      result = list.pop()(result)
    }

    return result
  }
}

const pipe2 = reverseArgs(compose)

pipe2((x) => x + 10, tap(log('pipe2 add value')))(20)

// partial like Function.prototype.bind
const rq5 = partial(partialRight(fakeRequest, tap(log('rq5 callback'))), 'http://example.com')

pipe2((x) => x + 10, rq5)(11)

const composeReducerImp1 = (...fns) => (result) => fns.reverse().reduce((result, fn) => fn(result), result)

composeReducerImp1(tap(log('composeReducer1 imp')), (a) => a + 10)(20, 20)

const composeReducerImp2 = (...fns) => fns.reverse().reduce((fn1, fn2) => (...args) => fn2(fn1(...args)))

composeReducerImp2(tap(log('composeReducer2 imp')), (a) => a + 10)(20, 20)

// 这样的话就不支持多个参数传入
composeReducerImp1(tap(log('composeReducer1 imp 2')), (a, b, c) => a + b + c)(12, 2, 3)

// ok
composeReducerImp2(tap(log('composeReducer2 imp 2')), (a, b, c) => a + b + c)(12, 2, 3)

// 还有一个差异在于 implementation 2 是 lazy 执行的

// 递归实现 compose
// lazy 最终被调用时每个 composeFn 被执行
function compose3(...fns) {
  const [fn1, fn2, ...rest] = fns.reverse()

  const composeFn = (...args) => fn2(fn1(...args))

  if (rest.length === 0) {
    return composeFn
  }

  return compose3(...rest.reverse(), composeFn)
}

compose3(tap(log('compose3 imp')), (a, b, c) => a + b + c)(12, 2, 3)

// don't repeat yourself

// R.compose(
//   R.objOf('id'),
//   R.prop('a', x)
// )

// function makeObjProp(name, value) {
//   return setProp(name, {}, value)
// }

// reassignment

function tractEvent(evt, keypresses = () => []) {
  return function newKeypresses() {
    return [...keypresses(), evt]
  }
}

const event1 = { type: '1' }
const event2 = { type: '2' }

const keypresses = tractEvent(event1)
const keypresses2 = tractEvent(event2, keypresses)

// function list(...args) {
//   return () => {
//     return [...args]
//   }
// }

// function obj (...args) {
//   let a = {};

//   return () => {

//   }
// }

// obj({
//   a: 1,
//   b: 20,
//   c: 30
// })

function uppercaseLetter(c) {
  var code = c.charCodeAt(0)
  // 小写字母?
  if (code >= 97 && code <= 122) {
    // 转换为大写!
    code = code - 32
  }
  return String.fromCharCode(code)
}

function stringMap(mapperFn, str) {
  return [...str].map(mapperFn).join('')
}

// HELLO WORLD!
tap(log('uppercase')(stringMap(uppercaseLetter, 'Hello World!')))

// flatten

const flatten1 = (list) => list.reduce((acc, l) => acc.concat(Array.isArray(l) ? flatten1(l) : l), [])

flatten1([1, 2, 3, 4, [1, 2, 3, [2]], [2]])

const flatten2 = (list, depth = Infinity) =>
  list.reduce(
    (acc, l) => acc.concat(depth > 0 ? (depth > 1 && Array.isArray(l) ? flatten2(l, depth - 1) : l) : [l]),
    []
  )

flatten2([1, 2, [2, 3, [3, 4, [5, 6]]]])

const flatMap = (f, list) => list.reduce((acc, elem) => acc.concat(f(elem)), [])

flatMap((x) => [x, x], [1, 2, 3])

const filter2 = (arr, fn) => arr.filter(fn)
const filter3 = partialRight(filter2, (x) => x % 2 === 0)

compose(tap(log('filter result')), filter3)([1, 2, 3, 4])

// const guard = (fn) => (args) => (args !== null ? fn(args) : args)

// guard((x) => x.name)()
