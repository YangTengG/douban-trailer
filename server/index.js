const Koa = require('koa');
const path = require('path');
const pug = require('pug');
const views = require('koa-views');
const mongoose = require('mongoose');

const { connect, initSchemas } = require('./database/init');

(async () => {
  await connect();

  initSchemas();

  // require('./tasks/movie');

  require('./tasks/api')
})();

const app = new Koa();

app.use(views(path.resolve(__dirname, './views'), {
  extension: 'pug'
}));

app.use(async (ctx, next) => {
  await ctx.render('index', {
    tmpName: 'pug'
  });
});

app.listen(3000, () => {
  console.log("Server running at 127.0.0.1:3000");
});
