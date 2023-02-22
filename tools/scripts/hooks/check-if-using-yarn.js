const { basename } = require('path');

exports.checkIfYarn = () => {
  return (
    process.env.FORCE_YARN_CHECK === 'true' ||
    process.env.NX_CLI_SET === 'true' ||
    basename(process.env.npm_execpath || '').startsWith('yarn')
  );
};
