import {showPopup} from "./utils/popups.js";
import * as Log from "./utils/log4js.js";
export {ChatBotView}


const ChatBotView = (inputEL, formEL, progressBtn, messages, questionTemplate, answerTemplate) => {

    const wsProgress = new WebSocket(location.origin.replace(/^http/, 'ws'));
    let wsId = -1;

    function updateProgressBar(progress) {
        progressBtn.style.setProperty('--background-percent', `${progress}%`);
    }

    wsProgress.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        Log.debug('WebSocket.onmessage : ' + JSON.stringify(data));
        if (data.type === 'id') {
            wsId = data.id;
        } else if (data.type === 'progress') {
            const percentComplete = Math.ceil(Number(data.percentComplete));
            updateProgressBar(percentComplete);
        } else if (data.type === 'message') {
            showPopup(`${data.value}`, data.level === 'error' ? 'orange' : 'blue');
        }
    });

    const fetchFn = async (val, callback) => {
        updateProgressBar(0);
        const html = Mustache.render(questionTemplate, {
            message: val,
        });
        messages.insertAdjacentHTML('beforeend', html);
        autoscroll();
        inputEL.value = '';

        let response = await fetch('/chat?wsId=' + wsId + '&question=' + encodeURI(val))
        let data = await response.json();
        callback(data);
    }

    const autoscroll = () => {
        // New message element
        const newMessage = messages.lastElementChild;

        // Height of the new message
        const newMessageStyles = getComputedStyle(newMessage);                 // get the style of the message element
        const newMessageMargin = parseInt(newMessageStyles.marginBottom);
        const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

        // Visible height
        const visibleHeight = messages.offsetHeight;                           // height of the visible container

        // Height of messages containes
        const containerHeight = messages.scrollHeight;                         // total height of the container

        // How far have I scrolled ?
        const scrollOffset = messages.scrollTop + visibleHeight;

        // where we at the bottom before the message was render ?
        if (containerHeight - newMessageHeight <= scrollOffset) {
            messages.scrollTop = messages.scrollHeight;
        }
    }

    const updateHtml = (data) => {
        progressBtn.disabled = false;
        updateProgressBar(100);

        if (data.error) {
            showPopup(data.error, 'orange', 5000);
            return;
        }

        const html = Mustache.render(answerTemplate, {
            message: data.answer,
        });
        messages.insertAdjacentHTML('beforeend', html);
        autoscroll();
    }

    formEL.addEventListener('submit', async (e) => {
        e.preventDefault();
        progressBtn.disabled = true;

        try {
            await fetchFn(inputEL.value, (data) => updateHtml(data));
        } catch (err) {
            showPopup('Oups... something went wrong!', 'orange', 5000);
            progressBtn.disabled = false;
        }
    });

    // inputEL.value = 'Ab welche Qualitatssicherungsstufe kann die Brandschutzbehorde verlangen ?';
    inputEL.value = 'ist Holz ein gut baustoff ?';

    return {fetchFn, updateHtml}
}
