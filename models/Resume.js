const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  education: [
    {
      degree: String,
      institute: String,
      year: String,
    },
  ],
  experience: [
    {
      title: String,
      company: String,
      years: String,
    },
  ],
  skills: [String],
});

module.exports = mongoose.model('Resume', ResumeSchema);
