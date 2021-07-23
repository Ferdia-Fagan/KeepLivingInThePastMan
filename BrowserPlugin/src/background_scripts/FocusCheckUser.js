import {UnfocusOnCurrentTab,FocusOnCurrentTab} from "./BrowserStateManager.js"

function onError(error) {

}



browser.idle.setDetectionInterval(250);

/**
 * @description
 * Checks if current web page on has audio or is muted, and if it is it logs web page visit time for the
 * current webpage/tab and pauses counting from there.
 * @param {*} tabInfo 
 */
function pauseLoggingTimeIfCurrentTabIsNotActive(tabInfo){



    if(!tabInfo[0].audible || tabInfo[0].mutedInfo.muted){

        // logWebPageVisitTime(currentTabId, Date.now());
        UnfocusOnCurrentTab()
    }
}

/**
 * Called on state change.
 * If changes to idle -> it focus checks the user, and turns off logging of visit time of current web page .
 * If changes to active -> it turns logging of visit time of current web page back on. 
 * @param {*} state 
 */
function handleBrowserStateChange(state) {

    if(state == "idle"){

        const gettingCurrentTab = browser.tabs.query({currentWindow: true, active: true});
        gettingCurrentTab.then(pauseLoggingTimeIfCurrentTabIsNotActive, onError);
    }else if(state == "active"){

        FocusOnCurrentTab();
    }
}
browser.idle.onStateChanged.addListener(handleBrowserStateChange);

