// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// let testReq = window.electron.require('./test.js');
// console.log(testReq.test);

let baseTime = 60;  // Timer value in seconds
let timeRemaining = baseTime;

let folderPath = '';
let fileList = [];
let fileIndex = 0;

let fileTypeFilter = ['.jpg', '.png', '.bmp'];

function selectImageDirectory(){
    window.electron.ipcSend('directoryRequest');
}

function updateTimerDisplay(time){
    let timeMin = Math.floor(time/60);
    let timeSec = time % 60;

    document.querySelector('#time-min').innerHTML = timeValueToString(timeMin);
    document.querySelector('#time-sec').innerHTML = timeValueToString(timeSec);
}

function timeValueToString(value){
    if(value >= 10){
        return value.toString();
    } else {
        return '0' + value.toString();
    }
}

function resetTimer(){
    timeRemaining = baseTime;
}

function getImageList(){

}

function nextImage(){
    if(fileList != null && fileIndex < fileList.length-1){
        fileIndex++;

        updateButtonSelectionAbility();
        getCurrentFile();
    }
}

function prevImage(){
    if(fileList != null && fileIndex > 0){
        fileIndex--;

        updateButtonSelectionAbility();
        getCurrentFile();
    }
}

function populateFiles(files){
    fileList = files;

    updateButtonSelectionAbility();

    // Grab first image and load it
    getCurrentFile();
}

function reset(){
    fileIndex = 0;
    setImageSrc('');
}

function updateButtonSelectionAbility(){
    if(fileList != null){
        if(fileIndex > 0){
            document.querySelector('#prev-img-btn').disabled = false;
        } else {
            document.querySelector('#prev-img-btn').disabled = true;
        }
        if(fileIndex < fileList.length-1){
            document.querySelector('#next-img-btn').disabled = false;
        } else {
            document.querySelector('#next-img-btn').disabled = true;
        }
    } else {
        document.querySelector('#prev-img-btn').disabled = true;
        document.querySelector('#next-img-btn').disabled = true;
    }
}

function getCurrentFile(){
    var targetFile = fileList[fileIndex];

    let fullPath = folderPath + '\\' + targetFile;

    let imgSrc64 = window.electron.readFileSync(fullPath);

    var src = 'data:image/png;base64,'+imgSrc64;
    setImageSrc(src);
}

function setImageSrc(src){
    document.querySelector('#target-img').setAttribute('src', src);
}

function init(){
    updateTimerDisplay(timeRemaining);

    updateButtonSelectionAbility();

    document.querySelector('#directory-select-btn').addEventListener('click', selectImageDirectory);
    document.querySelector('#prev-img-btn').addEventListener('click', prevImage);
    document.querySelector('#next-img-btn').addEventListener('click', nextImage);

    window.electron.ipcReceive("directoryResult", (data) => {
        if(data != null && data !== ''){
            folderPath = data;

            window.electron.getFilesInDirectory(folderPath, fileTypeFilter, (err, files) => {
                /// TODO: Error handling
                populateFiles(files);
            });
            
        }
    })
}

init();