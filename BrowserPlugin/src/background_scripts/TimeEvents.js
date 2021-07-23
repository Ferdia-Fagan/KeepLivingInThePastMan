import {sendUpdateReport} from "./CommunicationPort.js";
import {updateLocalStorage,checkIfLocalStorageHasUpdateReport} from "../utils/BrowserDataComponent.js"
import {checkIfTheirIsUpdateReport} from "./BrowserStateManager.js"


// const delayInMinutes = 0;
// const periodInMinutes = 1;

// browser.alarms.create("sendUpdateReport", {
//     delayInMinutes,
//     periodInMinutes
// });


// event: alarm raised
// function onAlarm(alarm) {
//
//     switch (alarm.name) {
//         case "sendUpdateReport":
//             sendUpdateReport()   
//             break;
//         default:
//             break;
//     }
// }
// browser.alarms.onAlarm.addListener(onAlarm);

window.setInterval(sendTheUpdateReport, 1000);

function sendTheUpdateReport(){

    if(checkIfTheirIsUpdateReport()){

        sendUpdateReport();
    }
    
    if(checkIfLocalStorageHasUpdateReport()){

        updateLocalStorage();
    }
    
}