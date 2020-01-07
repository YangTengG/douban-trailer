const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;

const SALT_WORK_FACTOR = 10;  // 盐值等级
const MAX_LONGIN_ATTEMPTS = 5; // 最大尝试登录次数
const LOCK_TIME = 2 * 60 * 60 * 1000; // 锁定两个小时

const userSchema = new Schema({
  username: {
    unique: true,
    required: true,
    type: String
  },
  email: {
    unique: true,
    type: String
  },
  password: {
    unique: true,
    type: String
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number,

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

// 锁表(尝试登录失败次数过多)
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
});

// 对密码加密
userSchema.pre('save', function(next) {
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(error);

      this.password = hash;
      next();
    });
  });
});

userSchema.methods = {
  comparePassword: (_password, password) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, (err, isMatch) => {
        if (!err) resolve(isMatch);
        else reject(err);
      });
    });
  },
  incLoginAttempts: function(user) {  // 
    return new Promise(function(resolve, reject) {
      if (this.lockUntil && this.lockUntil < Date.now()) {
        this.update({
          $set: {
            loginAttempts: 1
          },
          $unset: {
            lockUntil: 1
          }
        }, err => {
          if (!err) resolve(true);
          else reject(err);
        })
      } else {
        let updates = {
          $inc: {
            loginAttempts: 1
          }
        };

        if (this.loginAttempts + 1 >= MAX_LONGIN_ATTEMPTS && !this.isLocked) {
          updates.$set = {
            lockUntil: Date.now() + LOCK_TIME
          };
        }

        this.update(updates, err => {
          if (!err) resolve(true);
          else reject(err);
        });
      }
    });
  }

}

mongoose.model('User', userSchema);
