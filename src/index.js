const { install } = require('./install');
const { writePluginConfig } = require('./writePlugin');

let main = {
  install,
  writePluginConfig
};

module.exports = main;