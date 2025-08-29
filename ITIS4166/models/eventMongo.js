const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  category: { type: String, enum: ['On Campus', 'Off Campus', 'Other'], required: true },
  details: { type: String },
  image: { type: String },
});

module.exports = mongoose.model('Event', eventSchema);
