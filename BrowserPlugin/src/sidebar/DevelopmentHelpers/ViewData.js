
var dataList = document.getElementById('dataOutputList');

var dataToLoad;
var dataToLoadName;

function goBack(){
    window.location.href = "../SideBarMenu.html";
    // dataToLoad
}
document.getElementById("backButton").onclick = goBack;

function loadUpdateReport(){
    dataToLoadName = "loadUpdateReport";
    loadData();
    // dataToLoad
}
document.getElementById("loadUpdateReport").onclick = loadUpdateReport;

function loadTabsData(){
    dataToLoadName = "loadTabsData";
    loadData();
    // dataToLoad
}
document.getElementById("loadTabsData").onclick = loadTabsData;

function loadWebpageData(){
    dataToLoadName = "loadWebpageData";
    loadData();
    // dataToLoad
}
document.getElementById("loadWebpageData").onclick = loadWebpageData;

function loadData(){

    browser.runtime.sendMessage({
        messageType: "getData",
        dataName: dataToLoadName
    }).then(response => {
        dataList.innerHTML = ""

        response.theData.forEach(function (item) {
            let li = document.createElement('li');
            dataList.appendChild(li);

        
            li.innerHTML += JSON.stringify(item);
        });
    });


}
document.getElementById("reload").onclick = loadData;
