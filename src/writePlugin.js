let fs = require("fs");
const { getPluginConfigJson } = require('./getConfigList');

/**
 *
 * Write to json file
 * @param {*} extensionsPath
 */
async function writePluginConfig(extensionsPath) {
  let configList = await getPluginConfigJson(extensionsPath)
  let str = JSON.stringify(configList, "", "\t");
  fs.writeFile('vscodePluginConfig.json', str, function (err) {
    if (err) {
      console.warn(err);
    }
  })
}

module.exports = {
  writePluginConfig
}