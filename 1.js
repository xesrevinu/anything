const R = require('ramda')

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

const add1 = curry2(add)(10)(20)

const result = add1(10)

result

const unary = (fn) => (args) => {
  return fn(args)
}

function uncurry(fn) {
  return function uncurried(...args) {
    let ret = fn

    for (let index = 0; index < args.length; index++) {
      ret = ret(args[index])
    }

    return ret
  }
}

const addCurry = curry(add)

const a1 = addCurry(1)(2)(3)

a1

const a2 = uncurry(addCurry)(1, 2, 3)

a2

const a3 = [1, 2, 3].map(R.unary(parseInt))

a3

const when = (predicate, fn) => {
  return (...args) => {
    if (predicate(...args)) {
      fn(...args)
    }
  }
}

const not = (predicate) => {
  return (...args) => {
    return !predicate(...args)
  }
}

const isGt10 = (x) => x > 10

const isLt10 = not(isGt10)

const output = console.log

const x = (b) => (a, c) => when(a, b)(c)

const cd0 = x(output)

const cd1 = cd0(isGt10, 20)
const ce2 = cd0(isLt10, 1)
