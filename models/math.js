const mongoose = require('mongoose')

// indexes:
// {id: 1}

const math = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  data: String,
  created_at: Date,
})
math.pre('save', function (next) {
  if (this.created_at === undefined) {
    this.created_at = new Date()
  }
  this.updated_at = new Date()
  return next()
})

module.exports = mongoose.model('math', math)