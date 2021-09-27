const { basename } = require('path');

exports.checkIfYarn = () => {
  return basename(process.env.npm_execpath || '').startsWith('yarn');
};
