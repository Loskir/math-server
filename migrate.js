const mongoose = require('mongoose')

const fs = require('fs')

const config = require('./config')

const Math = require('./models/math')

void (async () => {
  await mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const f = fs.readdirSync('./files')
  f.forEach((id) => {
    const data = fs.readFileSync(`./files/${id}`, 'utf8')
    return Math.create({id, data})
  })
})()
