const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const { ObjectId, Mixed } = Schema.Types;

const movieSchema = new Schema({
  doubanId: {
    unique: true,
    type: String
  },
  title: String,
  rate: Number,
  summary: String,
  video: String,
  poster: String,
  cover: String,
  category: [{
    type: ObjectId,
    ref: 'Category'
  }],
  tags: [String],
  year: Number,

  rawTitle: String,
  movieTypes: [String],
  pubdate: Mixed,

  meta: {
    updateAt: {
      type: Date,
      default: Date.now()
    },
    createAt: {
      type: Date,
      default: Date.now()
    }
  }
});

movieSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
});

mongoose.model('Movie', movieSchema);
