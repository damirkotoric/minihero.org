const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

var MissionSchema = new mongoose.Schema({
  missionId: Number,
  title: String,
  description: String,
  place: Object,
  date: Date,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

MissionSchema.plugin(AutoIncrement, {inc_field: 'missionId'})

var Mission = mongoose.model('Mission', MissionSchema)
module.exports = Mission
