// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// let testReq = window.electron.require('./test.js');
// console.log(testReq.test);

let baseTime = 90;  // Timer value in seconds
let timeRemaining = baseTime;

let folderPath = '';
let fileList = [];
let fileIndex = 0;

let fileTypeFilter = ['.jpg', '.png', '.bmp'];

let playing = false;
let paused = false;

let timeInput = false;

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

function quitApp(){
    console.log("Ouch");
    window.electron.ipcSend('close-app');
}

function minimizeApp(){
    window.electron.ipcSend('minimize-app');
}

function restoreApp(){
    window.electron.ipcSend('restore-app');
    document.querySelector('#app-maximize-btn').classList.remove('is-hidden');
    document.querySelector('#app-restore-btn').classList.add('is-hidden');
}

function maximizeApp(){
    window.electron.ipcSend('maximize-app');
    document.querySelector('#app-maximize-btn').classList.add('is-hidden');
    document.querySelector('#app-restore-btn').classList.remove('is-hidden');
}

var switchToTimeInput = function(){
    console.log('switch to input');
    if(!timeInput){
        // Regular display was clicked
        timeInput = true;

        document.querySelector('#min-input').value = Math.floor(baseTime/60);
        document.querySelector('#sec-input').value = baseTime%60;

        document.querySelector('#time-container-display').classList.add('is-hidden');
        document.querySelector('#time-container-input').classList.remove('is-hidden');

        //document.querySelector('#time-container-input').classList.remove('time-container-small');
        document.querySelector('#time-container-input').classList.add('time-container-large');

        //document.querySelector('#time-container-display').classList.remove('time-container-small');
        document.querySelector('#time-container-display').classList.add('time-container-large');
    }
}

function switchToTimeDisplay(){
    console.log('switch to display');
    if(timeInput){
        timeInput = false;

        var min = parseInt(document.querySelector('#min-input').value);
        var sec = parseInt(document.querySelector('#sec-input').value);

        baseTime = (min*60) + sec;
        timeRemaining = baseTime;

        updateTimerDisplay();

        document.querySelector('#time-container-display').classList.remove('is-hidden');
        document.querySelector('#time-container-input').classList.add('is-hidden');

        //document.querySelector('#time-container-display').classList.add('time-container-small');
        document.querySelector('#time-container-display').classList.remove('time-container-large');

        //document.querySelector('#time-container-input').classList.add('time-container-small');
        document.querySelector('#time-container-input').classList.remove('time-container-large');

    }
}

function init(){
    updateTimerDisplay();

    updateButtonSelectionAbility();

    document.querySelector('#directory-button').addEventListener('click', selectImageDirectory);
    document.querySelector('#prev-img-btn').addEventListener('click', prevImage);
    document.querySelector('#next-img-btn').addEventListener('click', nextImage);

    document.querySelector('#stop-btn').addEventListener('click', stop);
    document.querySelector('#play-btn').addEventListener('click', play);
    document.querySelector('#pause-btn').addEventListener('click', pause);

    document.querySelector('#app-close-btn').addEventListener('click', quitApp);
    document.querySelector('#app-minimize-btn').addEventListener('click', minimizeApp);
    document.querySelector('#app-maximize-btn').addEventListener('click', maximizeApp);
    document.querySelector('#app-restore-btn').addEventListener('click', restoreApp);

    document.querySelector('#time-container-display').addEventListener('click', switchToTimeInput);
    document.querySelector('#time-confirm-btn').addEventListener('click', switchToTimeDisplay);

    document.querySelector('#app-maximize-btn').classList.remove('is-hidden');
    document.querySelector('#app-restore-btn').classList.add('is-hidden');

    window.electron.ipcReceive("directoryResult", (data) => {
        if(data != null && data !== ''){
            folderPath = data;

            var arr = folderPath.split('\\');
            var name = arr[arr.length-1] || arr[arr.length-2];
            console.log(name);
            console.log(arr);
            document.querySelector('#path-text').innerHTML = name;

            window.electron.getFilesInDirectory(folderPath, fileTypeFilter, (err, files) => {
                /// TODO: Error handling
                populateFiles(files);
            });
            
        }
    })
}

init();