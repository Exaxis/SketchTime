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

let fileTypeFilter = ['.jpg', '.jpeg', '.png', '.bmp' ];

let playing = false;
let paused = false;
let shuffled = false;

let timeInput = false;

let timer;

function selectImageDirectory(){
    if(!playing && !timeInput){
        window.electron.ipcSend('directoryRequest');
    }
}

function updateBodySizeToWindow(){
    //let winSize = window.electron.getWindowDimensions();

    let width = window.innerWidth;
    let height = window.innerHeight;

    document.querySelector('body').style.maxHeight = height.toString()+"px";
    document.querySelector('body').style.maxWidth = width.toString()+"px";

    document.querySelector('#target-img').style.maxHeight = (height-150).toString()+"px";
}

function updateTimerDisplay(){
    let timeMin = Math.floor(timeRemaining/60);
    let timeSec = timeRemaining % 60;

    document.querySelector('#time-min').innerHTML = timeValueToString(timeMin);
    document.querySelector('#time-sec').innerHTML = timeValueToString(timeSec);
}

function updateStatusDisplay(){
    if(fileList != null && fileList.length > 0){
        var num = fileIndex+1;
        document.querySelector('#status-display').innerHTML = "Image " + num + " of " + fileList.length;
    } else {
        document.querySelector('#status-display').innerHTML = "No images in directory";
    }
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
    window.electron.getFilesInDirectory(folderPath, fileTypeFilter, (err, files) => {
        /// TODO: Error handling
        populateFiles(files);
        updateStatusDisplay();
    });
}

function shuffleImageList(){
    let currentIndex = fileList.length, temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = fileList[currentIndex];
        fileList[currentIndex] = fileList[randomIndex];
        fileList[randomIndex] = temporaryValue;
    }
}


function nextImage(){
    if(timeInput){
        return;
    }

    if(fileList != null && fileIndex < fileList.length-1){
        fileIndex++;

        stop();

        updateButtonSelectionAbility();
        updateStatusDisplay();
    }
}

function prevImage(){
    if(timeInput){
        return;
    }

    if(fileList != null && fileIndex > 0){
        fileIndex--;

        stop();

        updateButtonSelectionAbility();
        updateStatusDisplay();
    }
}

function play(){
    if(timeInput){
        return;
    }
    if(!playing && fileList != null && fileList.length > 0){
        playing = true;

        document.querySelector('#time-container-display').classList.remove('clickable');
        document.querySelector('#directory-button').classList.remove('clickable');
        document.querySelector('#shuffle-btn').classList.remove('clickable');

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

                    document.querySelector('#time-container-display').classList.add('clickable');
                    document.querySelector('#directory-button').classList.add('clickable');

                    updateButtonSelectionAbility();

                    if(fileList != null && fileList.length > 0){
                        if(fileIndex < fileList.length-1){
                            fileIndex++;
                        } else if(fileIndex == fileList.length-1){
                            fileIndex = 0;
                        }
                        updateStatusDisplay();
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
    if(timeInput){
        return;
    }

    clearInterval(timer);

    document.querySelector('#time-container-display').classList.add('clickable');
    document.querySelector('#directory-button').classList.add('clickable');
    document.querySelector('#shuffle-btn').classList.add('clickable');

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

function shuffleClicked(){
    if(timeInput){
        return;
    }

    if(fileList != null && fileList.length > 0 && !playing){
        if(!shuffled){
            shuffled = true;

            shuffleImageList();
            fileIndex = 0;
            updateStatusDisplay();

            document.querySelector('#shuffle-btn').classList.add('toggled-on');
        } else {
            shuffled = false;

            getImageList();
            

            document.querySelector('#shuffle-btn').classList.remove('toggled-on');
        }
    }
}

function populateFiles(files){
    fileList = files;

    if(shuffled){
        shuffleImageList();
    }

    fileIndex = 0;

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

    if(fileList != null && fileList.length > 0 && !timeInput){
        document.querySelector('#play-btn').disabled = false;
        document.querySelectorAll('.control-button').forEach(function(item) {
            item.classList.add('clickable');
        });

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
        document.querySelectorAll('.control-button').forEach(function(item) {
            item.classList.remove('clickable');
        });

        document.querySelector('#prev-img-btn').disabled = true;
        document.querySelector('#next-img-btn').disabled = true;
        document.querySelector('#play-btn').disabled = true;

    }

    if(fileList != null && fileList.length > 0 && !playing && !timeInput){
        document.querySelector('#shuffle-btn').classList.add('clickable');
    } else {
        document.querySelector('#shuffle-btn').classList.remove('clickable');
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

    if(!timeInput && !playing){
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

        document.querySelector('#directory-button').classList.remove('clickable');

        updateButtonSelectionAbility();
    }
}

function switchToTimeDisplay(){
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

        updateButtonSelectionAbility();

        document.querySelector('#directory-button').classList.add('clickable');

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
    document.querySelector('#shuffle-btn').addEventListener('click', shuffleClicked);

    document.querySelector('#app-close-btn').addEventListener('click', quitApp);
    document.querySelector('#app-minimize-btn').addEventListener('click', minimizeApp);
    document.querySelector('#app-maximize-btn').addEventListener('click', maximizeApp);
    document.querySelector('#app-restore-btn').addEventListener('click', restoreApp);

    document.querySelector('#time-container-display').addEventListener('click', switchToTimeInput);
    document.querySelector('#time-confirm-btn').addEventListener('click', switchToTimeDisplay);

    window.addEventListener('resize', updateBodySizeToWindow);

    document.querySelector('#app-maximize-btn').classList.remove('is-hidden');
    document.querySelector('#app-restore-btn').classList.add('is-hidden');

    window.electron.ipcReceive("directoryResult", (data) => {
        if(data != null && data !== ''){
            folderPath = data;

            var arr = folderPath.split('\\');
            var name = arr[arr.length-1] || arr[arr.length-2];

            document.querySelector('#path-text').innerHTML = name;

            getImageList();
            
        }
    })
}

init();