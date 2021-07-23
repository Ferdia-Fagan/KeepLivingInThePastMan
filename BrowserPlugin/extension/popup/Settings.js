
backButton = document.getElementById("back");

hiddenSettings = document.getElementById("settingsToSet");
// numberSettings = document.getElementById("numberSettings");
numberSettings = document.getElementsByClassName("numberSettings");

theSettingsForm = document.getElementById("theSettings");

function hideIndexSettings(){

    hiddenSettings.classList.add("hidden");
}

function showIndexSettings(){

    hiddenSettings.classList.remove("hidden");
}

function onlyAllowNumberEntry(evt) { 

    var ASCIICode = (evt.which) ? evt.which : evt.keyCode;
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) 
        return false; 
    return true; 
} 

function submitSettingsForm(){

    browser.runtime.sendMessage({
        messageType: "updateIndexingSettings",
        indexAllPages: theSettingsForm.indexAllPages.value,
        minimumTotalTime: theSettingsForm.minimumTotalTime.value,
        minimumTotalVisits: theSettingsForm.minimumTotalVisits.value,
        conditions: theSettingsForm.conditions.value,
    });
    

    return false;
}


function setSettingsButtonsListeners(){


    document.getElementById("indexAllPages").onclick = hideIndexSettings;
    document.getElementById("setIndexSettings").onclick = showIndexSettings;

    // numberSettings.onkeypress = onlyAllowNumberEntry
    for (var item of numberSettings) {
        item.onkeypress = onlyAllowNumberEntry;
    }



    theSettingsForm.onsubmit = submitSettingsForm;
}
setSettingsButtonsListeners();

function goBackToMenu(){

    window.location.href = "./Menu.html";
}
backButton.onclick = goBackToMenu;
