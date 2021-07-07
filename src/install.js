let fs = require("fs");
let path = require("path");
let exec = require("child_process").exec;
var request = require("request");
const cmdStr = 'cd ./file';
const cmdStr2 = `code --install-extension `;

/**
 * 
 * Get configData by vscodePluginConfig.json
 * @param {*} url
 * @returns
 */
function getConfigData(url) {
  var file = path.join(__dirname, url); //文件路径，__dirname为当前运行js文件的目录
  //var file = 'f:\\nodejs\\data\\test.json'; //也可以用这种方式指定路径
  console.log(file, 'file')
  //读取json文件
  return new Promise((res, rej) => {
    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) {
        rej('文件读取失败');
      } else {
        res(JSON.parse(data));
      }
    });
  })
}

/**
 *
 * Cycle download
 * @param {*} configList
 * @param {*} dirPath
 */
function downloadVsix(configList, dirPath) {
  let finishedList = [];
  let unfinishedList = [];
  configList.forEach(i => {
    let stream = fs.createWriteStream(path.join(dirPath, i.fileName));
    request(i.url).pipe(stream).on('close', function (err) {
      if (err) {
        console.warn(err);
        unfinishedList.push(i);
        checkfinishedstatus(finishedList, unfinishedList, configList);
        return
      } else {
        console.log(`${i.extensionName}下载完毕`);
        finishedList.push(i);
        checkfinishedstatus(finishedList, unfinishedList, configList);
      }
      stream.end();
    });
  });
}

/**
 *
 * Print download status. Start Install
 * @param {*} finishedList
 * @param {*} unfinishedList
 * @param {*} configList
 * @returns
 */
function checkfinishedstatus(finishedList, unfinishedList, configList) {
  if (finishedList.length + unfinishedList.length !== configList.length) {
    return;
  }
  console.log(`全部文件下载完毕，成功下载${finishedList.length}个，失败${unfinishedList.length}个，总共${configList.length}个`)
  unfinishedList.forEach(i => {
    console.log(`${i.fileName}下载失败`)
  })
  installPlugin(finishedList);
}

function installPlugin(finishedList) {
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      console.log(err);
    } else {
      finishedList.forEach(i => {
        exec(cmdStr2 + i.fileName, function (err, stdout, stderr) {
          if (err) {
            console.log(`${i.fileName}安装失败,失败原因:${err}`);
          } else {
            console.log(`${i.fileName}安装完成`);
          }
        });
      })
    }
  });
}

/**
 *
 * Install
 * @param {*} jsonPath
 */
async function install(jsonPath) {
  let configList = await getConfigData(jsonPath || './vscodePluginConfig.json')
  let dirPath = path.join(__dirname, "file");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    downloadVsix(configList, dirPath);
  } else {
    exec('rm file/*', function (err, stdout, stderr) {
      downloadVsix(configList, dirPath);
    });
  }
}

module.exports = {
  install
}