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

  cb('mock response')
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
