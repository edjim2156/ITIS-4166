const Event = require('../models/eventMongo');
const { DateTime } = require('luxon');
const RSVP = require('../models/rspv');
const { validationResult } = require('express-validator');

// Show all events with optional category filter
exports.showEvents = async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    const query = categoryFilter ? { category: categoryFilter } : {};

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ start: 1 })
      .lean();

    const categories = await Event.distinct('category');

    events.forEach(event => {
      event.startISO = DateTime.fromJSDate(event.start).toFormat('ff');
      event.endISO = DateTime.fromJSDate(event.end).toFormat('ff');
      event.creatorName = event.createdBy
        ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
        : 'Unknown Creator';
    });

    res.render('pages/events', {
      events,
      categories,
      selectedCategory: categoryFilter || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/error', { message: 'Could not load events.' });
  }
};

exports.eventDetail = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy");

    if (!event) {
      return res.status(404).render("pages/error", { message: "Event not found" });
    }

    const rsvps = await RSVP.find({ event: event._id });

    const yesCount = rsvps.filter(r => r.response === "Yes").length;
    const noCount = rsvps.filter(r => r.response === "No").length;
    const maybeCount = rsvps.filter(r => r.response === "Maybe").length;

    res.render("pages/eventDetail", {
      event,
      counts: {
        Yes: yesCount,
        No: noCount,
        Maybe: maybeCount,
      },
      currentUser: req.session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("pages/error", { message: "Something went wrong." });
  }
};

exports.newEventForm = (req, res) => {
  res.render('pages/newEvent', {
    oldInput: {},
    flashError: req.flash('error') || []
  });
};

exports.createEvent = async (req, res) => {
  try {
    const user = req.session.user;

    const newEvent = new Event({
      title: req.body.title,
      location: req.body.location,
      category: req.body.category,
      start: new Date(req.body.start),
      end: new Date(req.body.end),
      details: req.body.details,
      image: req.file ? `/uploads/${req.file.filename}` : '/images/default.jpg',
      createdBy: user._id
    });

    await newEvent.save();

    req.flash('success', 'Event created successfully!');
    res.redirect('/events');
  } catch (err) {
    console.error('[createEvent] Error:', err);
    req.flash('error', 'Error creating event.');
    res.redirect('back');
  }
};


exports.editForm = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) return res.status(404).render('pages/error', { message: 'Event not found.' });

    if (event.createdBy?.toString() !== req.session.user._id) {
      return res.status(401).render('pages/error', { message: 'Unauthorized access to edit this event.' });
    }

    event.startISO = DateTime.fromJSDate(event.start).toISO({ suppressMilliseconds: true });
    event.endISO = DateTime.fromJSDate(event.end).toISO({ suppressMilliseconds: true });

    res.render('pages/edit', { event });
  } catch (err) {
    console.error(err);
    res.status(400).render('pages/error', { message: 'Invalid event ID.' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).render('pages/error', { message: 'Event not found.' });

    if (event.createdBy?.toString() !== req.session.user._id) {
      return res.status(401).render('pages/error', { message: 'Unauthorized to update this event.' });
    }

    event.title = req.body.title;
    event.category = req.body.category;
    event.start = new Date(req.body.start);
    event.end = new Date(req.body.end);
    event.details = req.body.details;

    if (req.file) {
      event.image = `/uploads/${req.file.filename}`;
    }

    await event.save();

    req.flash('success', 'Event updated successfully!');
    res.redirect(`/events/${event._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating event.');
    res.redirect('back');
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).render('pages/error', { message: 'Event not found.' });

    if (event.createdBy?.toString() !== req.session.user._id) {
      return res.status(401).render('pages/error', { message: 'Unauthorized to delete this event.' });
    }

    await event.deleteOne();

    req.flash('success', 'Event deleted successfully!');
    res.redirect('/events');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting event.');
    res.redirect('back');
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy');

    if (!event) {
      return res.status(404).send("Event not found.");
    }

    const rsvps = await RSVP.find({ eventId: event._id });

    const counts = { Yes: 0, No: 0, Maybe: 0 };
    rsvps.forEach(rsvp => {
      if (counts[rsvp.response] !== undefined) {
        counts[rsvp.response]++;
      }
    });

    res.render("pages/eventDetails", {
      event,
      counts,
      session: req.session
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};

exports.submitRsvp = async (req, res) => {
  const { response } = req.body;
  const eventId = req.params.id;
  const userId = req.session.user._id;

  try {
    const existing = await RSVP.findOne({ eventId, userId });

    if (existing) {
      existing.response = response;
      await existing.save();
    } else {
      await RSVP.create({ eventId, userId, response });
    }

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error("Error submitting RSVP:", err);
    res.status(500).send("Error submitting RSVP");
  }
};
