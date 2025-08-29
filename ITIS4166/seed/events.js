require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/eventMongo');
const User = require('../models/user');

const sampleEvents = [
  {
    title: "Electric Vehicle Showcase",
    host: "UNCC Sustainability Club",
    image: "/images/electricCar.png",
    details: "Check out student and manufacturer EVs on campus.",
    start: new Date("2025-08-10T10:00:00"),
    end: new Date("2025-08-10T14:00:00"),
    category: "On Campus"
  },
  {
    title: "Auto Engineering Seminar",
    host: "UNCC Engineering Department",
    image: "/images/WSLCOE.jpg",
    details: "Guest speaker from Ford Performance discusses modern car tech.",
    start: new Date("2025-08-14T13:00:00"),
    end: new Date("2025-08-14T15:00:00"),
    category: "On Campus"
  },
  {
    title: "FSAE Car Demo Day",
    host: "UNCC Formula SAE Team",
    image: "/images/fsae.jpg",
    details: "See the student-built race car live in action.",
    start: new Date("2025-08-18T12:00:00"),
    end: new Date("2025-08-18T16:00:00"),
    category: "On Campus"
  },
  {
    title: "Cars & Coffee Charlotte",
    host: "Charlotte Car Culture",
    image: "/images/carsAndCoffee.jpg",
    details: "Monthly car enthusiast meet at the Speedway.",
    start: new Date("2025-08-03T08:00:00"),
    end: new Date("2025-08-03T11:00:00"),
    category: "Off Campus"
  },
  {
    title: "Track Day at CMP",
    host: "Grassroots Motorsports Club",
    image: "/images/CMPTrack.jpg",
    details: "Bring your car for a full day of lapping at Carolina Motorsports Park.",
    start: new Date("2025-08-11T09:00:00"),
    end: new Date("2025-08-11T17:00:00"),
    category: "Off Campus"
  },
  {
    title: "JDM Car Meet",
    host: "Charlotte Import Alliance",
    image: "/images/CarMeet.jpg",
    details: "JDM-only car meet and showcase at Concord Mills.",
    start: new Date("2025-08-20T18:00:00"),
    end: new Date("2025-08-20T21:00:00"),
    category: "Off Campus"
  },
  {
    title: "Virtual Car Tuning Workshop",
    host: "HP Tuners Online",
    image: "/images/VR.png",
    details: "Live demo of ECU tuning basics for performance cars.",
    start: new Date("2025-08-07T19:00:00"),
    end: new Date("2025-08-07T20:30:00"),
    category: "Other"
  },
  {
    title: "Online Detailing Class",
    host: "Chemical Guys Virtual Garage",
    image: "/images/ChemicalGuys.png",
    details: "Learn interior and exterior detailing techniques from home.",
    start: new Date("2025-08-13T17:00:00"),
    end: new Date("2025-08-13T18:30:00"),
    category: "Other"
  },
  {
    title: "Discord Sim Racing Night",
    host: "UNCC Motorsports Club",
    image: "/images/simRacing.png",
    details: "Join our Forza/Assetto Corsa sim racing session online.",
    start: new Date("2025-08-25T20:00:00"),
    end: new Date("2025-08-25T22:00:00"),
    category: "Other"
  }
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Event.deleteMany({});
    //await User.deleteMany({}); 

    const uniqueHosts = [...new Set(sampleEvents.map(e => e.host))];

    const hostUsers = {};
    for (const host of uniqueHosts) {
      const username = host.toLowerCase().replace(/\s+/g, '');
      const email = `${username}@example.com`;

      const newUser = new User({
        username,
        email,
        firstName: host.split(' ')[0] || host,
        lastName: host.split(' ').slice(1).join(' ') || '',
        password: '123',
        role: 'user'
      });

      const savedUser = await newUser.save();
      hostUsers[host] = savedUser._id;
    }

    const eventsToInsert = sampleEvents.map(event => ({
      ...event,
      createdBy: hostUsers[event.host]
    }));

    await Event.insertMany(eventsToInsert);

    console.log("Seeded users and events with correct createdBy assignments.");
    process.exit(0);
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
};

seedEvents();
