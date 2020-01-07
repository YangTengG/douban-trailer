const mongoose  = require('mongoose');
const glob = require('glob');
const path = require('path');

const db = 'mongodb://localhost/douban-trailer';

mongoose.Promise = global.Promise;

exports.connect = () => {
  let maxConnectTimes = 0;

  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }

    mongoose.connect(db);

    mongoose.connection.on('disconnected', () => {
      maxConnectTimes++;
      if (maxConnectTimes < 5) {
        mongoose.connect(db);
      } else {
        throw new Error('MongoDB disconnected');
      }
    });

    mongoose.connection.on('error', err => {
      maxConnectTimes++;
      if (maxConnectTimes < 5) {
        mongoose.connect(db);
      } else {
        throw new Error('MongoDB Error');
      }
    });

    mongoose.connection.once('open', () => {
      /* TEST
      const Dog = mongoose.model('Dog', {
        name: String
      });
      const dog = new Dog({ name: 'Alpha' });
      dog.save().then(() => {
        console.log('wwwww');
      });*/

      resolve();
      console.log('MongoDB Connected successfully');
    });
  });
};

exports.initSchemas = () => {
  glob.sync(path.resolve(__dirname, './schema', '**/*.js')).forEach(require);
};
