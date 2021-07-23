console.log("sample tests loaded")

function setup(backgroundPage){

    var urls = ["https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update",
    "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs"]


    for(let url of urls){
        browser.tabs.create({
            url: url,
            windowId: 1,
        });
    }
    describe('Background', function() {
        describe('ping', function() {
            it('should return pong in response', function() {
                // Return a promise for Mocha using the Firefox browser API instead of chrome.
                return browser.runtime.sendMessage('ping')
                    .then(function(response) {
                        // console.log("here is the response : " + response);
                        console.log("here is the testSample : " + backgroundPage.testSample);
                        expect(response).to.equal('pong');
                    });
            });
        });
        describe('here is another test', function() {
            it('should return pong in response', function() {
                // Return a promise for Mocha using the Firefox browser API instead of chrome.
                browser.runtime.sendMessage('ping')
                const c = backgroundPage.testSample;
                console.log("here is the testSample : " + c);
                expect(c).to.equal(11);
                
            });
        });
    });
}

function onGot(page) {
    console.log("page.testSample : "+ page.testSample);
    setup(page);
}

function onError(error) {
    console.log(`Error: ${error}`);
}

var gettingPage = browser.runtime.getBackgroundPage()
gettingPage.then(onGot, onError);