import { equalId} from './general.js';

export {showPopup}

const popupArray = [];
let popupIdCounter = 1;

const removeFromArray = (myArray, itemComparator) => (idToRemove) => {
    const index = myArray.findIndex(obj => itemComparator(obj, idToRemove));
    if (index !== -1) {
        myArray.splice(index, 1);
        // console.log(`> remove obj.id==${idToRemove}`)
    }
}


const removeFromPopupArray = removeFromArray(popupArray, equalId);

// test cases
// showPopup('Hello', 'blue', 5000);
// setTimeout(() => showPopup('Hello World'), 1000);
// setTimeout(() => showPopup('This is a long message :)'), 2000);


function renderPopups() {
    if(popupArray.length===0) return;
    let offset = 0;

    popupArray.forEach(obj => {
        obj.style.top = `calc(100px + ${offset}px)`;
        offset+=(obj.offsetHeight+10);
    });
}

function showPopup (message, color='yellow', timeout=3000) {
    // Create the popup element
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.setAttribute('id', `popup-id${popupIdCounter++}`);
    popup.textContent = message;
    popup.style.backgroundColor = `var(--color-${color})`;

    // Register the popup
    popupArray.unshift(popup);

    // Add the popup element to the container
    const container = document.getElementById('popup-container');
    container.appendChild(popup);
    renderPopups();

    // Show the popup
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);

    // Hide the popup after the specified timeout
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => {
            container.removeChild(popup);
            removeFromPopupArray(popup.id);
            renderPopups();
        }, 300);
    }, timeout);
}
