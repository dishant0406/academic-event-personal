const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Event = require("./models/Event");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create users
    const users = await User.create([
      {
        fullName: "ASHISH KUMAR PANIGRAHI", email: "ashish@iitbhu.ac.in", password: "password123",
        role: "student", department: "Computer Science & Engineering",
        rollNumber: "21CS1045", year: "3rd Year", phone: "+91 7848998206", isVerified: true,
      },
      {
        fullName: "Dr. Priya Sharma", email: "priya@iitbhu.ac.in", password: "password123",
        role: "faculty", department: "Computer Science & Engineering",
        designation: "Associate Professor", facultyId: "FAC-CS-2018-042", isVerified: true,
      },
      {
        fullName: "Ankit Verma", email: "ankit@iitbhu.ac.in", password: "password123",
        role: "scholar", department: "Physics",
        researchDomain: "Quantum Information Theory", supervisor: "Prof. Arun Kumar", isVerified: true,
      },
      {
        fullName: "Admin User", email: "admin@iitbhu.ac.in", password: "admin123",
        role: "admin", department: "Central Administration",
        adminCode: "CAMPUSBUZZ-ADMIN-2025", isVerified: true,
      },
    ]);

    console.log(`👥 Created ${users.length} users`);

    const faculty = users[1]; // Dr. Priya
    const admin = users[3]; // Admin

    // Create events
    const events = await Event.create([
      {
        title: "International Conference on Quantum Computing & Information Theory",
        description: "A two-day international conference featuring keynote speakers from MIT, IISc, and CERN. Topics include quantum error correction, quantum algorithms, and quantum cryptography.",
        type: "conference", department: "Dept. of Physics", faculty: "Institute of Science",
        date: "2025-06-15", endDate: "2025-06-16", time: "09:00 AM - 06:00 PM",
        venue: "Swatantrata Bhawan", speaker: "Prof. Arun Kumar, Dr. Sarah Chen (MIT)",
        capacity: 500, registrations: 342, tags: ["quantum computing", "physics", "research"],
        color: "#f43f5e", featured: true, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Workshop on Deep Learning for Natural Language Processing",
        description: "Hands-on workshop covering transformer architectures, BERT, GPT models, and their applications in Indian language processing.",
        type: "workshop", department: "Dept. of Computer Science", faculty: "Institute of Technology",
        date: "2025-06-18", endDate: "2025-06-20", time: "10:00 AM - 05:00 PM",
        venue: "IT-BHU Computer Center", speaker: "Dr. Priya Sharma",
        capacity: 100, registrations: 89, tags: ["deep learning", "NLP", "AI", "workshop"],
        color: "#f59e0b", featured: true, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Guest Lecture: Climate Change and Sustainable Agriculture",
        description: "Distinguished lecture by IARI Director on the impact of climate change on agricultural patterns in the Indian subcontinent.",
        type: "lecture", department: "Dept. of Agricultural Sciences", faculty: "Institute of Agricultural Sciences",
        date: "2025-06-20", time: "03:00 PM - 05:00 PM",
        venue: "Malviya Bhawan Auditorium", speaker: "Dr. Trilochan Mohapatra (Director, IARI)",
        capacity: 300, registrations: 156, tags: ["climate change", "agriculture", "sustainability"],
        color: "#10b981", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "Seminar on Ancient Indian Mathematical Traditions",
        description: "Exploring the contributions of Aryabhata, Brahmagupta, and the Kerala School to modern mathematics. Includes panel discussion with historians.",
        type: "seminar", department: "Dept. of Mathematics", faculty: "Faculty of Science",
        date: "2025-06-22", time: "11:00 AM - 01:00 PM",
        venue: "Mathematics Department Seminar Hall", speaker: "Prof. Rajesh Verma",
        capacity: 150, registrations: 78, tags: ["mathematics", "history", "Indian science"],
        color: "#6366f1", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "Training Program: Research Methodology & Scientific Writing",
        description: "Comprehensive training for research scholars on academic writing, plagiarism awareness, LaTeX, and publishing in peer-reviewed journals.",
        type: "training", department: "Central Library", faculty: "Central Facilities",
        date: "2025-06-25", endDate: "2025-06-29", time: "10:00 AM - 04:00 PM",
        venue: "Central Library Conference Room", speaker: "Dr. Meena Sinha",
        capacity: 80, registrations: 67, tags: ["research", "writing", "LaTeX", "publishing"],
        color: "#8b5cf6", featured: true, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Workshop on IoT and Smart Campus Solutions",
        description: "Design and prototype IoT-based solutions for campus security, energy management, and student services.",
        type: "workshop", department: "Dept. of Electrical Engineering", faculty: "Institute of Technology",
        date: "2025-07-02", endDate: "2025-07-03", time: "09:30 AM - 05:30 PM",
        venue: "EE Department Lab", speaker: "Prof. Vinay Kumar",
        capacity: 60, registrations: 45, tags: ["IoT", "smart campus", "electronics"],
        color: "#06b6d4", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "National Conference on Ayurvedic Medicine in Modern Healthcare",
        description: "Bridging traditional Ayurvedic practices with modern evidence-based medicine. Features practitioners from across India.",
        type: "conference", department: "Faculty of Ayurveda", faculty: "Institute of Medical Sciences",
        date: "2025-07-05", endDate: "2025-07-06", time: "09:00 AM - 06:00 PM",
        venue: "Sir Sunderlal Hospital Auditorium", speaker: "Dr. Ramesh Chandra",
        capacity: 400, registrations: 289, tags: ["ayurveda", "healthcare", "traditional medicine"],
        color: "#f43f5e", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "Seminar: Sanskrit Computational Linguistics",
        description: "Application of computational methods to Sanskrit grammar, including Paninian grammar formalization and machine translation.",
        type: "seminar", department: "Dept. of Sanskrit", faculty: "Faculty of Arts",
        date: "2025-07-08", time: "02:00 PM - 04:30 PM",
        venue: "Arts Faculty Hall", speaker: "Prof. Amba Kulkarni",
        capacity: 100, registrations: 56, tags: ["Sanskrit", "NLP", "computational linguistics"],
        color: "#6366f1", featured: false, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Hackathon: Smart Campus Solutions",
        description: "36-hour hackathon to build innovative solutions for BHU campus — from AI chatbots to waste management apps.",
        type: "workshop", department: "Coding Club, IIT-BHU", faculty: "Institute of Technology",
        date: "2025-07-12", endDate: "2025-07-13", time: "06:00 PM (Start)",
        venue: "ASN Bose Hall, IIT-BHU", speaker: "Student-led, mentored by industry professionals",
        capacity: 300, registrations: 256, tags: ["hackathon", "coding", "innovation", "AI"],
        color: "#f59e0b", featured: true, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Guest Lecture: Drone Technology in Agriculture",
        description: "Exploring the use of UAVs for precision agriculture, crop monitoring, and pesticide spraying in Indian farming.",
        type: "lecture", department: "Dept. of Mechanical Engineering", faculty: "Institute of Technology",
        date: "2025-07-15", time: "11:00 AM - 01:00 PM",
        venue: "Mechanical Engineering Seminar Room", speaker: "Dr. Anurag Jain (IIT Delhi)",
        capacity: 120, registrations: 88, tags: ["drones", "agriculture", "technology"],
        color: "#10b981", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "Seminar: Women in STEM — Breaking Barriers",
        description: "Panel discussion featuring leading women scientists and engineers from IITs and ISRO.",
        type: "seminar", department: "Women's Studies Center", faculty: "Faculty of Social Sciences",
        date: "2025-07-18", time: "03:00 PM - 05:30 PM",
        venue: "Mahila Mahavidyalaya Auditorium", speaker: "Dr. Ritu Karidhal (ISRO)",
        capacity: 250, registrations: 198, tags: ["women in STEM", "diversity", "inspiration"],
        color: "#8b5cf6", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "Training: LaTeX & Academic Publishing Tools",
        description: "Hands-on training for writing research papers, theses, and presentations using LaTeX, Overleaf, and reference management tools.",
        type: "training", department: "Dept. of Computer Science", faculty: "Institute of Technology",
        date: "2025-07-20", time: "10:00 AM - 04:00 PM",
        venue: "IT-BHU Computer Lab", speaker: "Dr. Amit Singh",
        capacity: 50, registrations: 48, tags: ["LaTeX", "publishing", "tools", "research"],
        color: "#06b6d4", featured: false, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Guest Lecture: Advances in Organic Synthesis",
        description: "Lecture on the recent developments in organic synthesis and catalytic methods.",
        type: "lecture", department: "Dept. of Chemistry", faculty: "Faculty of Science",
        date: "2025-08-10", time: "02:00 PM - 04:00 PM",
        venue: "Chemistry Dept Seminar Hall", speaker: "Dr. Arvind Ramesh",
        capacity: 100, registrations: 65, tags: ["chemistry", "organic synthesis", "science"],
        color: "#f59e0b", featured: true, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Conference on South Asian History",
        description: "An academic conference exploring the social, cultural, and political history of South Asia.",
        type: "conference", department: "Dept. of History", faculty: "Faculty of Social Sciences",
        date: "2025-08-15", endDate: "2025-08-17", time: "10:00 AM - 05:00 PM",
        venue: "Social Sciences Auditorium", speaker: "Various Scholars",
        capacity: 250, registrations: 120, tags: ["history", "south asia", "culture"],
        color: "#6366f1", featured: false, status: "approved", createdBy: admin._id,
      },
      {
        title: "Workshop on VLSI Design and Embedded Systems",
        description: "Comprehensive workshop on VLSI circuit design, layout, and simulation for modern electronics.",
        type: "workshop", department: "Dept. of Electrical and Electronics Engineering", faculty: "Institute of Technology",
        date: "2025-09-10", endDate: "2025-09-12", time: "09:00 AM - 05:00 PM",
        venue: "EEE Department Computer Lab", speaker: "Dr. Sandeep Kumar",
        capacity: 60, registrations: 45, tags: ["VLSI", "embedded systems", "electronics"],
        color: "#10b981", featured: true, status: "approved", createdBy: faculty._id,
      },
      {
        title: "Seminar: Next-Generation Smart Grids",
        description: "Exploring the future of power systems, renewable energy integration, and smart grid technologies.",
        type: "seminar", department: "Dept. of Electrical and Electronics Engineering", faculty: "Institute of Technology",
        date: "2025-09-20", time: "02:00 PM - 04:00 PM",
        venue: "EEE Department Seminar Hall", speaker: "Prof. Rajeev Sharma",
        capacity: 120, registrations: 85, tags: ["smart grid", "power systems", "renewable energy"],
        color: "#06b6d4", featured: false, status: "approved", createdBy: admin._id,
      },
    ]);

    console.log(`📅 Created ${events.length} events`);
    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("   Student:  ashish@iitbhu.ac.in / password123");
    console.log("   Faculty:  priya@iitbhu.ac.in / password123");
    console.log("   Scholar:  ankit@iitbhu.ac.in / password123");
    console.log("   Admin:    admin@iitbhu.ac.in / admin123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedDB();
