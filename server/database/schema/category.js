const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    unique: true,
    type: String
  },
  movies: [{
    type: Schema.Types.ObjectId,
    ref: 'Movie'
  }],

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


categorySchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
});

mongoose.model('Category', categorySchema);
