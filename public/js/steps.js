
import { Observable } from "./utils/observable.js";
import * as Log from "./utils/log4js.js";

export { stepsController };

const stepsController = (() => {

    const itemList = [];

    const register = (btnEltId, sectionEltId, groupdId=1) => {
        Log.debug(`stepsController.register: btn[${btnEltId}] <-> section[${sectionEltId}]`);
        const item = createItem(btnEltId, sectionEltId, groupdId);
        itemList.push(item);
        return item;
    };

    const resetExcept = (id, groupdId) => {
        itemList.filter(item => item.id!==id && item.groupdId===groupdId).forEach(item=>{
            item.activated.setValue(false);
        });
    }

    const createItem = (btnEltId, sectionEltId, groupdId) => {
        const activated = Observable(false);
        let btnElt = document.getElementById(btnEltId);
        let sectionElt = document.getElementById(sectionEltId);

        // btnElt.setAttribute('disabled', 'true');            // disabled all btn items

        activated.onChange((value, oldValue) => {
            // Log.debug(`[${btnEltId}].value : ${oldValue} -> ${value}`)
            if(value) {
                btnElt.classList.add('active');
                sectionElt.classList.add('active');
                btnElt.setAttribute('disabled', 'true');         // manually activated
                sectionElt.removeAttribute('disabled');
            } else {
                btnElt.classList.remove('active');
                sectionElt.classList.remove('active');
                btnElt.removeAttribute('disabled');              // manually activated
                sectionElt.setAttribute('disabled', 'true');
            }
            if(value!==oldValue&&value) resetExcept(btnEltId, groupdId);
        })

        btnElt.addEventListener("click", (evt) => activated.setValue(true));

        return { id:btnEltId, btn:document.getElementById(sectionEltId), section:document.getElementById(sectionEltId), activated, groupdId };

    };

    const activate = (btnEltId) => {
        let item = itemList.find(item => item.id === btnEltId);
        if(item) item.activated.setValue(true);
    }

    return {
        register, activate
    };
})();


