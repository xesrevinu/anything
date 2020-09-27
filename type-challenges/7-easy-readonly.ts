/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Equal, Expect } from '@type-challenges/utils'

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

interface Todo1 {
  title: string
  description: string
  completed: boolean
}

type cases = [Expect<Equal<MyReadonly<Todo1>, Readonly<Todo1>>>]

const a: MyReadonly<Todo1> = {
  completed: false,
  description: 'asd',
  title: 'asd',
}
// @ts-expect-error
a.completed = false
