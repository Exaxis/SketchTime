const {
  contextBridge,
  ipcRenderer
} = require("electron");

const fs = require("fs");
const path = require("path");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "electron", {
      ipcSend: (channel, data) => {
          // whitelist channels
          let validChannels = ["toMain", "directoryRequest"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);
          }
      },
      ipcReceive: (channel, func) => {
          let validChannels = ["fromMain", "directoryResult"];
          if (validChannels.includes(channel)) {
              // Deliberately strip event as it includes `sender` 
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      },
      require:(module) => {
        var result = require(module);
        return result;
      },
      getFilesInDirectory:(directoryPath, fileTypes, callback) => {
        fs.readdir(directoryPath, (err, files) => {
          /// TODO: Error handling
          let fileList = [];

          files.forEach(file => {
            if(fileTypes == null || fileTypes.length == 0){
              fileList.push(file);
            } else if(fileTypes.includes(path.extname(file))){
              fileList.push(file);
            }
          });

          callback(err, fileList);
        });
      },
      readFileSync:(filePath) => {
        let img = fs.readFileSync(filePath).toString('base64');

        return img;
      }
  }
);

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })
