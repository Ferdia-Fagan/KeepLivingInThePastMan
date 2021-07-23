var x = 0;

var backScript = null;

console.log("sel script has been loaded")

browser.runtime.getBackgroundPage(function(bg) {
    console.log("selenium helper page has loaded up fine : " + bg.testSample);

});

function getX(){
    console.log("getX has been called.")
    return 10;
}