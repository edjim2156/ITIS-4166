const RSVP = require('../models/rspv');
const Event = require('../models/eventMongo');
const { body } = require('express-validator');


exports.handleRsvp = async (req, res) => {
  const { response } = req.body;
  const eventId = req.params.eventId;
  const userId = req.session.user._id;

  try {
    const existing = await RSVP.findOne({ event: eventId, user: userId });

    if (existing) {
      existing.response = response;
      await existing.save();
    } else {

      await RSVP.create({ event: eventId, user: userId, response });
    }

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error("Error submitting RSVP:", err);
    res.status(500).send("Error submitting RSVP");
  }
};

exports.createRSVP = async (req, res) => {
  try {
    const { response } = req.body;
    const eventId = req.params.id;
    const userId = req.session.user._id;

    const existingRSVP = await RSVP.findOne({ event: eventId, user: userId });
    if (existingRSVP) {
      existingRSVP.response = response; 
      await existingRSVP.save();
    } else {
      const newRSVP = new RSVP({
        event: eventId,
        user: userId,
        response
      });
      await newRSVP.save();
    }

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting RSVP');
  }
};
