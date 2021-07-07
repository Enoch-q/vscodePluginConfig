const { FILENAMEREG } = require('./contants');

/**
 * Parse fileName
 * Return an object containing the name, version number, and author
 * @param {*} fileName 
 * @returns 
 */
const parseFileName = (fileName) => {
  let gruop = fileName.match(FILENAMEREG);
  console.log(gruop, FILENAMEREG, fileName)
  return {
    publisher: gruop[1],
    extensionName: gruop[2],
    version: gruop[3]
  }
}

/**
 * Return an download link
 * @param {*} publisher 
 * @param {*} extensionName 
 * @param {*} version 
 * @returns 
 */
const getDownloadUrl = (publisher, extensionName, version) => {
  return `https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${extensionName}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
}

module.exports = {
  parseFileName,
  getDownloadUrl
}