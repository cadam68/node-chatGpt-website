import { showPopup } from "./utils/popups.js";
import * as Log from "./utils/log4js.js";

export { ExtractPdfView }

const ExtractPdfView = (inputEL, formEL, resultLabel, result, progressBtn, submitCallback)=> {

    const wsProgress = new WebSocket('ws://localhost:3501');
    let wsId=-1;

    function updateProgressBar(progress) {
        progressBtn.style.setProperty('--background-percent', `${progress}%`);
    }

    // Example usage: updateProgressBar(75);

    wsProgress.addEventListener('message', function(event) {
        const data = JSON.parse(event.data);
        Log.debug('WebSocket.onmessage : '+ JSON.stringify(data));
        if (data.type === 'id') {
            wsId = data.id;
        } else if (data.type === 'progress') {
            const percentComplete = Math.ceil(Number(data.percentComplete));
            updateProgressBar(percentComplete);
        } else if (data.type === 'result') {
            const results = data.result;
            showPopup(`result = ${results}`);
        } else if (data.type === 'message') {
            showPopup(`${data.value}`, data.level==='error'?'orange':'blue');
        }
    });

    const fetchFn = (val, callback) => {
        updateProgressBar(0);
        fetch('http://localhost:3500/contentExtract?wsId='+wsId+'&url=' +encodeURI(val))
            .then(response=> response.json()
            .then(data=> callback(data) ));
    }

    const updateHtml = (data)=> {
        progressBtn.disabled = false;
        updateProgressBar(100);

        if (data.error) {
            resultLabel.textContent = 'Oups... something is wrong...';
            showPopup(data.error, 'orange', 5000);
            return;
        }

        resultLabel.textContent="Number of pages extracted: ";
        result.textContent = data.nbPdfGenerated;
        showPopup(`Number of pages extracted: ${data.nbPdfGenerated}`);
        if(submitCallback) setTimeout(submitCallback, 2000);
    }

    formEL.addEventListener('submit', (e) => {
        e.preventDefault();
        progressBtn.disabled = true;

        try {
            fetchFn(inputEL.value, (data) => updateHtml(data));
        } catch (err) {
            showPopup('Oups... something went wrong!', 'orange', 5000);
            progressBtn.disabled = false;
        }
    });
    inputEL.value='https://be.heureka.ch/de/fachthemen';

    return { fetchFn, updateHtml  }
}
