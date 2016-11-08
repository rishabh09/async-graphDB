const uuid = require('node-uuid')
const db = require('./db')

const matchLabel = (type, label) => {
  if (label instanceof RegExp) {
    let inlabel = type.match(label)
    if (inlabel === null) {
      return false
    }
    return true
  }
  if (typeof label === 'string') {
    if (type === label) {
      return true
    }
    return false
  }
  return false
}

class Node {
  constructor (label, data, cb) {
    if (typeof label === 'string') {
      this.id = uuid.v4()
      this.type = label
      this.in = []
      this.out = []
      this.data = data
    } else {
      const obj = label === Object(label) ? label : null
      if (obj === null) {
        return null
      } Object.assign(this, obj)
    } db.create(this, cb)
  }

  objectify () {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      in: this.in,
      out: this.out
    }
  }

  addEdge (label, node, props) {
    if (typeof label !== 'string') { return null }
    this.out.push({ type: label, out: node.id, data: props })
    node.in.push({ type: label, in: this.id, data: props })
    db.update(this)
    db.update(node)
    return node
  }
}

class Query {
  constructor (id) {
    this.next = f => {
      const node = db.read(id)
      f(node)
      return this
    }
  }

  value (key) {
    const savenext = this.next
    this.next = f => savenext(node => f(node['data'][key]))
    return this
  }

  out (label) {
    const savenext = this.next
    this.next = f => {
      savenext(node => {
        const matches = node['out'].filter(elem => matchLabel(elem['type'], label))
                                   .map(elem => f(db.read(elem['out'])))
      })
    }
    return this
  }

  in (label) {
    const savenext = this.next
    this.next = f => {
      savenext(node => {
        const matches = node['in'].filter(elem => matchLabel(elem['type'], label))
                                  .map(elem => f(db.read(elem['in'])))
      })
    }
    return this
  }
}

module.exports = {
  Node: Node,
  Query: Query,
  find: db.find,
  save: db.save,
  load: db.load,
  dump: db.dump,
  matchLabel: matchLabel,
  read: db.read,
  update: db.update
}
