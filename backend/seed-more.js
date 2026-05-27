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

    // Helper to get a date offset from today
    const getDate = (offsetDays) => {
      const d = new Date();
      d.setDate(d.getDate() + offsetDays);
      return d;
    };

    const moreEvents = [
      {
        title: "Future of Clean Energy",
        description: "A deep dive into renewable energy sources and the engineering challenges of the next decade.",
        type: "seminar",
        department: "Engineering",
        date: getDate(5), // 5 days from now
        time: "14:00",
        venue: "Engineering Block, Room 101",
        speaker: "Dr. Emily Chen",
        capacity: 150,
        status: "approved",
        createdBy: creatorId,
        color: "#10b981",
        tags: ["Energy", "Sustainability"]
      },
      {
        title: "Advanced Data Structures Bootcamp",
        description: "Intensive 3-hour bootcamp covering graphs, trees, and dynamic programming.",
        type: "training",
        department: "Computer Science",
        date: getDate(2), // 2 days from now
        time: "09:00",
        venue: "CS Lab 1",
        speaker: "Prof. Alan Turing",
        capacity: 30,
        status: "approved",
        createdBy: creatorId,
        color: "#6366f1",
        tags: ["Programming", "Algorithms"]
      },
      {
        title: "Literature in the Digital Age",
        description: "Exploring how digital media is reshaping narrative structures and publishing.",
        type: "lecture",
        department: "Arts & Humanities",
        date: getDate(10), // 10 days from now
        time: "16:30",
        venue: "Arts Faculty Library",
        speaker: "Dr. Robert Langdon",
        capacity: 80,
        status: "approved",
        createdBy: creatorId,
        color: "#f43f5e",
        tags: ["Literature", "Digital Media"]
      },
      {
        title: "Global Economics Summit",
        description: "Annual summit discussing macroeconomic trends and emerging markets.",
        type: "conference",
        department: "Business & Management",
        date: getDate(15), // 15 days from now
        time: "10:00",
        venue: "Main Auditorium",
        speaker: "Multiple Speakers",
        capacity: 400,
        status: "approved",
        createdBy: creatorId,
        color: "#eab308",
        tags: ["Economics", "Business"]
      },
      {
        title: "Robotics and Automation Workshop",
        description: "Build and program your own basic robotic arm. Materials provided.",
        type: "workshop",
        department: "Engineering",
        date: getDate(20), // 20 days from now
        time: "11:00",
        venue: "Mechatronics Lab",
        speaker: "Dr. Sarah Connor",
        capacity: 25,
        status: "approved",
        createdBy: creatorId,
        color: "#3b82f6",
        tags: ["Robotics", "Automation"]
      },
      {
        title: "Psychology of Learning",
        description: "Understanding cognitive processes and how students absorb information.",
        type: "seminar",
        department: "Psychology",
        date: getDate(8), 
        time: "13:00",
        venue: "Psychology Wing, Room A",
        speaker: "Dr. Sigmund Freud",
        capacity: 100,
        status: "approved",
        createdBy: creatorId,
        color: "#8b5cf6",
        tags: ["Psychology", "Education"]
      },
      {
        title: "Astrophysics Guest Lecture: Black Holes",
        description: "A fascinating journey into the physics of black holes and recent discoveries.",
        type: "lecture",
        department: "Physics",
        date: getDate(3),
        time: "15:00",
        venue: "Observatory",
        speaker: "Dr. Neil deGrasse Tyson",
        capacity: 200,
        status: "approved",
        createdBy: creatorId,
        color: "#0f172a",
        tags: ["Physics", "Astronomy"]
      },
      {
        title: "Introduction to Bioinformatics",
        description: "Bridging biology and computer science to analyze complex biological data.",
        type: "workshop",
        department: "Biology",
        date: getDate(12),
        time: "10:00",
        venue: "Bio Lab 2",
        speaker: "Dr. Rosalind Franklin",
        capacity: 40,
        status: "approved",
        createdBy: creatorId,
        color: "#14b8a6",
        tags: ["Biology", "Data Science"]
      },
      {
        title: "Law and Ethics in AI",
        description: "Debating the legal implications and ethical considerations of artificial intelligence.",
        type: "seminar",
        department: "Law",
        date: getDate(18),
        time: "17:00",
        venue: "Law Faculty Moot Court",
        speaker: "Prof. Harvey Specter",
        capacity: 120,
        status: "approved",
        createdBy: creatorId,
        color: "#94a3b8",
        tags: ["Law", "AI", "Ethics"]
      },
      {
        title: "Startup Pitch Competition",
        description: "Students pitch their innovative business ideas to a panel of venture capitalists.",
        type: "conference",
        department: "Business & Management",
        date: getDate(25),
        time: "18:00",
        venue: "Innovation Hub",
        speaker: "Various Students",
        capacity: 300,
        status: "approved",
        createdBy: creatorId,
        color: "#ec4899",
        tags: ["Startups", "Entrepreneurship"]
      }
    ];

    await Event.insertMany(moreEvents);
    console.log(`Successfully added ${moreEvents.length} new upcoming events to the database!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
