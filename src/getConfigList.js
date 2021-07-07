const fs = require("fs");
const path = require("path");
const { parseFileName, getDownloadUrl } = require('./utils');
const USER_HOME = process.env.HOME || process.env.USERPROFILE;

/**
 *
 * Get configList by readdir
 * @param {*} filePath
 * @returns
 */
function getConfigListByReaddir(filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, function (err, files) {
      if (err) {
        console.warn(err);
        reject(err)
        return
      }
      let allList = files.map(fileName => {
        return new Promise((res, rej) => {
          fs.stat(path.join(filePath, fileName), (err, data) => {
            if (err) {
              console.log(err);
              rej()
            } else {
              if (data.isDirectory()) {
                let { publisher, extensionName, version } = parseFileName(fileName);
                let url = getDownloadUrl(publisher, extensionName, version);
                res({
                  fileName: `${fileName}.vsix`,
                  publisher,
                  extensionName,
                  version,
                  url
                });
              }
              res()
            }
          })
        })
      });

      Promise.all(allList).then(data => {
        resolve(data.filter(i => i));
      }).catch(err => {
        console.log(err, 'err')
      });
    });
  });
}

/**
 *
 * Get configList contains fileName and downloadUrl
 * @param {*} extensionsPath
 * @returns
 */
async function getPluginConfigJson(extensionsPath) {
  let filePath = path.resolve(extensionsPath || `${USER_HOME}/.vscode/extensions`);
  return await getConfigListByReaddir(filePath);
}

module.exports = {
  getPluginConfigJson
}