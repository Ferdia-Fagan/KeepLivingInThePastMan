import webpageMetadataParser from "page-metadata-parser";

console.log("WebpageExtrractionLayer has been imported")

/**
 * This will listen for messages from the background scripts
 */
browser.runtime.onMessage.addListener(request => {
    if(request.messageType == "askForTitle"){
        console.log("current page being asked for title")

        return Promise.resolve(document.title);
    }
    else if(request.messageType == "askForScrapings"){

        console.log("The page is being asked to scrape")
        
        let webpageMetadata = getWebpageMetadata();

        webpageMetadata["scrapedContent"] = ScrapeWebPage();
        
        return Promise.resolve(webpageMetadata);
    }
    return Promise.resolve({});
});

function getWebpageMetadata(){
    const metadata = webpageMetadataParser.getMetadata(document, window.location)

    const webpageTitle = encodeURIComponent(metadata.title);
    
    const webpageImageUrl = ((metadata.image !== undefined)? encodeURI(metadata.image):((metadata.icon !== undefined)? encodeURI(metadata.icon) : null));

    const webpageUrl = encodeURI(metadata.url); //TODO: I DONT KNOW IF CANONICAL URL IS BETTER. i THINK IT IS. SHOULD BE REPLACED

    return {title:webpageTitle, url: webpageUrl, imgUrl: webpageImageUrl}
}

/**
 * @description
 * scrapes the web page of 
 * @returns 
 * html body text
 */
function ScrapeWebPage(){
    return document.body.innerText.trim().replace(/[^a-zA-Z ]/g, " ").replace(/\s\s+/g, ' ');   // remove letters, then remove all spacing
}