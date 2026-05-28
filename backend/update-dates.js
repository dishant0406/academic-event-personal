const mongoose = require('mongoose');
require('dotenv').config();

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  venue: String,
  type: String,
  department: String,
  status: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  color: String
}, { strict: false });

const Event = mongoose.model('Event', EventSchema);

async function updateDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const events = await Event.find({});
    console.log(`Found ${events.length} events`);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Spread events randomly across the current month
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // Pick a random day between 1 and 28
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const newDate = new Date(year, month, randomDay);
      
      // Format as YYYY-MM-DD
      const dateStr = newDate.toISOString().split('T')[0];
      
      event.date = dateStr;
      await event.save();
    }

    console.log('Successfully updated all event dates to be spread across the current month!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDates();
