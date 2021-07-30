const { checkIfYarn } = require('./check-if-using-yarn');

if (!checkIfYarn()) {
  console.warn('<------------------------------------>');
  console.warn('<------ detected `npm install`  ----->');
  console.warn('<---- use `yarn` to install deps ---->');
  console.warn('<------------------------------------>\n');
  process.exit(1);
}
