import R from 'ramda'

const tap = (fn) => (x) => {
  fn(x)

  return x
}

const log = (label) => (...x) => console.log(label + ': ', ...x)

const BinaryTree = (value, parent, left, right) => ({ value, parent, left, right })

var banana = BinaryTree('banana')
var apple = (banana.left = BinaryTree('apple', banana))
var cherry = (banana.right = BinaryTree('cherry', banana))
var apricot = (apple.right = BinaryTree('apricot', apple))
var avocado = (apricot.right = BinaryTree('avocado', apricot))
var cantelope = (cherry.left = BinaryTree('cantelope', cherry))
var cucumber = (cherry.right = BinaryTree('cucumber', cherry))
var grape = (cucumber.right = BinaryTree('grape', cucumber))

BinaryTree.forEach = function ForEach(visitFn, node) {
  if (node) {
    if (node.left) {
      BinaryTree.forEach(visitFn, node.left)
    }

    visitFn(node)

    if (node.right) {
      BinaryTree.forEach(visitFn, node.right)
    }
  }
}

BinaryTree.map = function Map(mapperFn, node) {
  if (node) {
    const newNode = mapperFn(node)

    newNode.parent = node.parent
    newNode.left = node.left ? BinaryTree.map(mapperFn, node.left) : undefined
    newNode.right = node.right ? BinaryTree.map(mapperFn, node.right) : undefined

    if (newNode.left) {
      newNode.left.parent = newNode
    }

    if (newNode.right) {
      newNode.right.parent = newNode
    }

    return newNode
  }
}

const logBinaryTreeValue = R.compose(tap(log('node value')), R.prop('value'))

// BinaryTree.forEach(logBinaryTreeValue, banana)

const BANANA = BinaryTree.map((node) => {
  return BinaryTree(node.value.toUpperCase())
}, banana)

BinaryTree.forEach(logBinaryTreeValue, BANANA)
