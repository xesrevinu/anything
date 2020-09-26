import and from 'crocks/logic/and'
import curry from 'crocks/helpers/curry'
import isNumber from 'crocks/predicates/isNumber'
import liftA2 from 'crocks/helpers/liftA2'
import safe from 'crocks/Maybe/safe'

// divide :: Number -> Number
const divide = (x) => (y) => x / y

// safeNumber :: a -> Maybe Number
const safeNumber = safe(isNumber)

// notZero :: a -> Maybe Number
const notZero = safe(and(isNumber, (x) => x !== 0))

// safeDivide:: a -> Maybe Number
const safeDivide = curry((x, y) => liftA2(divide, safeNumber(x), notZero(y)))

console.log(safeDivide(10)(20).toString())
