import { showPopup } from "./utils/popups.js";
import * as Log from "./utils/log4js.js";

export { CallApiView }

const CallApiView = (result, progressBtn, route, submitCallback) => {

    const wsProgress = new WebSocket(location.origin.replace(/^http/, 'ws'));
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
        } else if (data.type === 'message') {
            showPopup(`${data.value}`, data.level==='error'?'orange':'blue');
        }
    });

    const fetchFn = (callback) => {
        updateProgressBar(0);
        fetch('http://localhost/'+route+'?wsId='+wsId)
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

        result.textContent=data.res;
        showPopup(data.res);
        if(submitCallback) setTimeout(submitCallback, 2000);
    }

    progressBtn.addEventListener('click', (e) => {
        e.preventDefault();
        progressBtn.disabled = true;

        try {
            fetchFn((data) => updateHtml(data));
        } catch (err) {
            showPopup('Oups... something went wrong!', 'orange', 5000);
            progressBtn.disabled = false;
        }
    });

    return { fetchFn, updateHtml }
}
