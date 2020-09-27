import { Equal, Expect } from '@type-challenges/utils'

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

// const c: typeof tuple[number] = 'teslas'

type TupleToObject<T extends readonly any[]> = {
  [k in T[number]]: k
}

type cases = [
  Expect<
    Equal<
      TupleToObject<typeof tuple>,
      { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X'; 'model Y': 'model Y' }
    >
  >
]

type case1 = TupleToObject<typeof tuple>
