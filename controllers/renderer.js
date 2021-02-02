// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// let testReq = window.electron.require('./test.js');
// console.log(testReq.test);

let baseTime = 30;  // Timer value in seconds
let timeRemaining = baseTime;

let folderPath = '';
let fileList = [];
let fileIndex = 0;

let fileTypeFilter = ['.jpg', '.png', '.bmp'];

let playing = false;
let paused = false;

let timer;

function selectImageDirectory(){
    window.electron.ipcSend('directoryRequest');
}

function updateTimerDisplay(){
    let timeMin = Math.floor(timeRemaining/60);
    let timeSec = timeRemaining % 60;

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

        stop();

        updateButtonSelectionAbility();
    }
}

function prevImage(){
    if(fileList != null && fileIndex > 0){
        fileIndex--;

        stop();

        updateButtonSelectionAbility();
    }
}

function play(){
    if(!playing){
        playing = true;

        getCurrentFile();

        updateButtonSelectionAbility();

        timer = setInterval(function(){
            if(!paused){
                timeRemaining--;

                if(timeRemaining == 0){
                    playing = false;

                    timeRemaining = baseTime;

                    clearImage();
                    clearInterval(timer);
                    updateButtonSelectionAbility();

                    if(fileList != null && fileList.length > 0){
                        if(fileIndex < fileList.length-1){
                            fileIndex++;
                        } else if(fileIndex == fileList.length-1){
                            fileIndex = 0;
                        }
                    }
                }

                updateTimerDisplay();
            }
        }, 1000);
    } else if(paused){
        paused = false;

        updateButtonSelectionAbility();
    }
}

function stop(){
    clearInterval(timer);

    timeRemaining = baseTime;
    playing = false;
    paused = false;

    clearImage();

    updateTimerDisplay();
    updateButtonSelectionAbility();
}

function pause(){
    if(playing && !paused){
        paused = true;

        updateButtonSelectionAbility();
    }
}

function populateFiles(files){
    fileList = files;

    updateButtonSelectionAbility();
}

function reset(){
    fileIndex = 0;
    setImageSrc('');
}

function updateButtonSelectionAbility(){

    if(playing && !paused){
        document.querySelector('#play-btn').classList.add('is-hidden');
        document.querySelector('#pause-btn').classList.remove('is-hidden');
        document.querySelector('#stop-btn').classList.remove('is-hidden');
    } else if(playing && paused){
        document.querySelector('#play-btn').classList.remove('is-hidden');
        document.querySelector('#pause-btn').classList.add('is-hidden');
        document.querySelector('#stop-btn').classList.remove('is-hidden');
    }else if (!playing){
        document.querySelector('#play-btn').classList.remove('is-hidden');
        document.querySelector('#pause-btn').classList.add('is-hidden');
        document.querySelector('#stop-btn').classList.add('is-hidden');
    }

    if(fileList != null && fileList.length > 0){
        document.querySelector('#play-btn').disabled = false;
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
        document.querySelector('#play-btn').disabled = true;

    }
}

function getCurrentFile(){
    var targetFile = fileList[fileIndex];

    let fullPath = folderPath + '\\' + targetFile;

    let imgSrc64 = window.electron.readFileSync(fullPath);

    var src = 'data:image/png;base64,'+imgSrc64;
    setImageSrc(src);
}

function clearImage(){
    document.querySelector('#target-img').setAttribute('src', '');
}

function setImageSrc(src){
    document.querySelector('#target-img').setAttribute('src', src);
}

function init(){
    updateTimerDisplay();

    updateButtonSelectionAbility();

    document.querySelector('#directory-select-btn').addEventListener('click', selectImageDirectory);
    document.querySelector('#prev-img-btn').addEventListener('click', prevImage);
    document.querySelector('#next-img-btn').addEventListener('click', nextImage);

    document.querySelector('#stop-btn').addEventListener('click', stop);
    document.querySelector('#play-btn').addEventListener('click', play);
    document.querySelector('#pause-btn').addEventListener('click', pause);

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