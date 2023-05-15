
const isPallier = (pas) => {
    let currentPallier = -1;
    return (val) => {
        let current=Math.floor(val/pas);
        if(current!=currentPallier) {
            currentPallier=current;
            return true;
        }
        return false;
    }
}

const delay = async (ms=1000) => {
    await new Promise(resolve => setTimeout(resolve, ms));    // pause 1 second
}

module.exports = { isPallier, delay }