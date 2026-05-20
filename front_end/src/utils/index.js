export function buildTree(items, parentId = null) {
  return items
    .filter(item => {
      if (parentId === null) return !item.pid
      return item.pid === parentId
    })
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }))
}

export function flattenTree(tree, result = []) {
  for (const node of tree) {
    result.push(node)
    if (node.children?.length) {
      flattenTree(node.children, result)
    }
  }
  return result
}

export function findNodeById(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function getTreeIds(tree) {
  const ids = []
  const walk = (nodes) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children?.length) walk(node.children)
    })
  }
  walk(tree)
  return ids
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}`
}
