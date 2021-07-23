
// function loadDevelopersPage(){
//     window.location.href = "./DevelopmentHelpers/ViewData.html";
// }
// document.getElementById("viewDeveloperHelpers").onclick = loadDevelopersPage;

function loadAnnotatorPage(){
    window.location.href = "./AnnotateWebPage/AnnotateWebPageMenu.html";
}
document.getElementById("annotateCurrentWebPage").onclick = loadAnnotatorPage;

function loadQueryPage(){
    window.location.href = "./Query/QueryUI.html";
}
document.getElementById("navigateToQuery").onclick = loadQueryPage;

function loadAutoAnnotatorMenu(){
    window.location.href = "./AutoCollector/AutoCollectorMenu.html";
}
document.getElementById("openAutoCollectorMenu").onclick = loadAutoAnnotatorMenu;