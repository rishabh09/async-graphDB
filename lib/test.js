const graph = require('./index')
global.graphDataPath = __dirname

graph.load()

let q = new graph.Query('d45ae4df-7fa3-48a2-bdf4-5a4ee9cca31a')
.out('battled')
.value('name')
.next(v => console.log(v))
