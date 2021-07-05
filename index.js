let fs = require("fs");
let path = require("path"); //解析需要遍历的文件夹
let url = require("url");
let http = require("http");
let exec = require("child_process").exec;
let spawn = require("child_process").spawn;
var request = require("request");
const USER_HOME = process.env.HOME || process.env.USERPROFILE;

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
      files.forEach(fileName => {
        let versionSplit = fileName.split("-");
        let version = versionSplit[versionSplit.length - 1];
        let publisher = versionSplit[0].split(".")[0];
        let extensionName = fileName
          .replace(`${publisher}.`, "")
          .replace(`-${version}`, "");
        let url = `https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${extensionName}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
        configList.push({ fileName, publisher, extensionName, version, url });
      });
      resolve(configList);
    });
  });
}

function writePluginConfigJson(data) {
  let str = JSON.stringify(data, "", "\t");
  fs.writeFile('vscodePluginConfig.json', str, function (err) {
    if (err) { console.warn(err); }
  })
}

async function getPluginConfigJson(extensionsPath, download = false) {
  // get configList contains fileName and downloadUrl
  let filePath = path.resolve(extensionsPath || `${USER_HOME}/.vscode/extensions`);
  let configList = await getConfigListByReaddir(filePath);
  if (download) {
    return configList;
  }
  writePluginConfigJson(configList);
}

function download() {
  let configList = getPluginConfigJson(null, true);
  //创建文件夹目录
  var dirPath = path.join(__dirname, "file");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log("文件夹创建成功");
  } else {
    console.log("文件夹已存在");
  }

  let finishedList = [];
  let unfinishedList = [];
  configList.forEach(i => {
    let stream = fs.createWriteStream(path.join(dirPath, `${i.filename}.vsix`));
    request(i.url).pipe(stream).on("close", function (err) {
      if (err) {
        console.warn(err);
        unfinishedList.push(i);
        // checkfinishedstatus
        return
      }
      console.log(`${i.extensionName}下载完毕`);
      finishedList.push(i);
      // checkfinishedstatus
    });
  });
}


// https://www.jianshu.com/p/26b707966440