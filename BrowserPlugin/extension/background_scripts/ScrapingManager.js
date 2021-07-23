// import {transformHTML} from "../utils/ScrapingContent.js";
import {sendWebPageScrapings} from "./CommunicationPort.js"


// function scrapeTheWebPage(htmlBody){
//     // function encode_utf8(s) {
//     //     return unescape(encodeURIComponent(s));
//     // }
//     // var scrapedPageContent = decodeURI(encodeURIComponent(transformHTML({html:htmlBody})));
//     // return scrapedPageContent;
//     return htmlBody;
// }

/**
 * @description
 * Get webpage scrapings from webpage and give them to communication to send to native application.
 * 
 * @summary
 * Tell the tab to tell the content page of its webpage to scrape the web page.
 * It recieves a message back containing the scraped web page contents.
 * Then sends these scrapings to communication to send to native application.
 * @param {*} tabId 
 * @param {*} webPageId 
 */
export function scrapeWebPage(tabId, webPageId){
    console.log("the tab id is : " + tabId)
    browser.tabs.sendMessage(
        tabId,
        {messageType: "askForScrapings"}
    ).then(scrapingResults => {
        // scrapingResults: {title: String, url: String, imgUrl: String, scrapedContent: String}
        sendWebPageScrapings(webPageId, scrapingResults);
    });
    
}

