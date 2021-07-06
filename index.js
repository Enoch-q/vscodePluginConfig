let fs = require("fs");
let path = require("path"); //解析需要遍历的文件夹
let url = require("url");
let http = require("http");
let exec = require("child_process").exec;
let spawn = require("child_process").spawn;
var request = require("request");
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const cmdStr = 'cd ./file';
const cmdStr2 = `code --install-extension `;

//文件遍历方法
function getConfigListByReaddir(filePath) {
  //根据文件路径读取文件，返回文件列表
  return new Promise((resolve, reject) => {
    let configList = [];
    fs.readdir(filePath, function (err, files) {
      if (err) {
        console.warn(err);
        return
      }
      //遍历读取到的文件列表
      let allList = files.map(fileName => {
        return new Promise((res, rej) => {
          fs.stat(path.join(filePath, fileName), (err, data) => {
            if (err) {
              console.log(err);
            } else {
              if (data.isDirectory()) {
                console.log(fileName)
                let versionSplit = fileName.split("-");
                let version = versionSplit[versionSplit.length - 1];
                let publisher = versionSplit[0].split(".")[0];
                let extensionName = fileName
                  .replace(`${publisher}.`, "")
                  .replace(`-${version}`, "");
                let url = `https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${extensionName}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
                // configList.push({
                //   fileName: `${fileName}.vsix`,
                //   publisher,
                //   extensionName,
                //   version,
                //   url
                // });
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
        console.log(data, 'data')
        resolve(data);
      }).catch(err => {
        console.log(err, 'err')
      });
    });
  });
}

function writePluginConfigJson(data) {
  let str = JSON.stringify(data, "", "\t");
  fs.writeFile('vscodePluginConfig.json', str, function (err) {
    if (err) {
      console.warn(err);
    }
  })
}

async function getPluginConfigJson(extensionsPath, download = false) {
  // get configList contains fileName and downloadUrl
  let filePath = path.resolve(extensionsPath || `${USER_HOME}/.vscode/extensions`);
  console.log(filePath)
  let configList = await getConfigListByReaddir(filePath);
  if (download) {
    return configList;
  }
  writePluginConfigJson(configList);
}

// download();

async function download() {
  let configList = await getPluginConfigJson(null, true)
  configList = configList.filter(i => i);
  //创建文件夹目录
  let dirPath = path.join(__dirname, "file");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log("文件夹创建成功");
  } else {
    console.log("文件夹已存在");
    exec('rm file/*', function (err, stdout, stderr) {
      downloadVsix(configList, dirPath);
    });
    return
  }
  downloadVsix(configList, dirPath);
}

function downloadVsix(configList, dirPath) {
  let finishedList = [];
  let unfinishedList = [];
  configList.forEach((i, index) => {
    let stream = fs.createWriteStream(path.join(dirPath, i.fileName));
    console.log(stream, 'stream');
    request(i.url).pipe(stream).on('close', function (err) {
      if (err) {
        console.warn(err);
        unfinishedList.push(i);
        checkfinishedstatus(finishedList, unfinishedList, configList);
        return
      }
      console.log(`${i.extensionName}下载完毕`);
      finishedList.push(i);
      checkfinishedstatus(finishedList, unfinishedList, configList);
      stream.end();
    });
  });
}

function checkfinishedstatus(finishedList, unfinishedList, configList) {
  console.log(finishedList.length + unfinishedList.length, configList.length);
  if (finishedList.length + unfinishedList.length !== configList.length) {
    return;
  }
  console.log(`全部文件下载完毕，成功下载${finishedList.length}个，失败${unfinishedList.length}个，总共${configList.length}个`)
  unfinishedList.forEach(i => {
    console.log(`${i.fileName}下载失败`)
  })
  // installPlugin(finishedList);
}

function installPlugin(finishedList) {
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      console.log(err);
    } else {
      finishedList.forEach(i => {
        exec(cmdStr2 + i.fileName, function (err, stdout, stderr) {
          if (err) {
            console.log(err);
          } else {
            console.log(i.fileName + '安装成功');
          }
        });
      })
    }
  });
}

function request(url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.onreadystatechange = function () {
    //4:请求已完成，且响应已就绪
    if (xhr.readyState == 4) {
      //200:成功
      if (xhr.status == 200) {
        //处理结果
        console.log(xhr.responseText);
      } else {
        console.log('请求错误');
      }
    }

  }
  //将请求发送到服务器
  xhr.send();
}

request('vscodePluginConfig.json');