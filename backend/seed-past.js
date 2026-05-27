require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    let user = await User.findOne({ role: 'admin' }) || await User.findOne({});
    let creatorId;
    if (!user) {
      console.log("No user found. Using a mock ObjectId for creator.");
      creatorId = new mongoose.Types.ObjectId();
    } else {
      creatorId = user._id;
    }

    const pastEvents = [
      {
        title: "Introduction to Quantum Computing",
        description: "A foundational lecture on the principles of quantum mechanics applied to computing.",
        type: "lecture",
        department: "Computer Science",
        date: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
        time: "10:00",
        venue: "Science Hall B",
        speaker: "Dr. Richard Feynman",
        capacity: 100,
        status: "approved",
        createdBy: creatorId,
        color: "#6366f1"
      },
      {
        title: "Modern Web Frameworks Workshop",
        description: "Hands-on workshop building apps with React and Next.js.",
        type: "workshop",
        department: "Information Technology",
        date: new Date(new Date().setDate(new Date().getDate() - 12)), // 12 days ago
        time: "14:00",
        venue: "Lab 4",
        speaker: "Sarah Jenkins",
        capacity: 40,
        status: "approved",
        createdBy: creatorId,
        color: "#10b981"
      },
      {
        title: "Annual Science Conference 2026",
        description: "The biggest science conference of the year featuring keynote speakers from across the country.",
        type: "conference",
        department: "Science",
        date: new Date(new Date().setDate(new Date().getDate() - 20)), // 20 days ago
        time: "09:00",
        venue: "Main Auditorium",
        speaker: "Multiple Speakers",
        capacity: 500,
        status: "approved",
        createdBy: creatorId,
        color: "#8b5cf6"
      },
      {
        title: "AI in Healthcare Seminar",
        description: "Exploring the revolutionary impact of artificial intelligence in modern medical diagnostics.",
        type: "seminar",
        department: "Medicine",
        date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
        time: "11:30",
        venue: "Medical Wing, Room 302",
        speaker: "Dr. Jane Smith",
        capacity: 80,
        status: "approved",
        createdBy: creatorId,
        color: "#f59e0b"
      }
    ];

    await Event.insertMany(pastEvents);
    console.log(`Successfully added ${pastEvents.length} past events to the database!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
