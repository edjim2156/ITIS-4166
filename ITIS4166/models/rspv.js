const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  response: {
    type: String,
    enum: ['Yes', 'No', 'Maybe'],
    required: true
  }
});

module.exports = mongoose.model('RSVP', rsvpSchema);
