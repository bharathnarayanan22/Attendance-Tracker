const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true
  },
  schedule: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Class', classSchema);
