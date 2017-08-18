const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

var MissionSchema = new mongoose.Schema({
  missionId: Number,
  title: String,
  description: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  date: Date,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: Array
})

MissionSchema.plugin(AutoIncrement, {inc_field: 'missionId'})

var Mission = mongoose.model('Mission', MissionSchema)
module.exports = Mission
