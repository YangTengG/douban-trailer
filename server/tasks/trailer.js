const cp = require('child_process');
const path = require('path');

(async () => {
  const script = path.resolve(__dirname, '../crawler/video');
  const child = cp.fork(script, []);

  let invoked = false;

  child.on('error', err => {
    if (invoked) return;

    invoked = true;
    console.log(err);
  });

  child.on('exit', code => {
    if (invoked) return;

    invoked = true;
    let err = code === 0 ? null : new Error('exit code:' + code);

    if (err) {
      console.log(err);
    }
  });

  child.on('message', data => {
    console.log(data);
  });
})();
