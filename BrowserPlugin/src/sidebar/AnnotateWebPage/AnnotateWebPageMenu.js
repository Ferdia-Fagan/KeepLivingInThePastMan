import '../../externalModules/tagify/tagify.min.js';

var input = document.getElementById("Tags");
var annotationEditor = document.getElementById("webpagesData")
    // init Tagify script on the above inputs
var tagify = null;

var currentWebpageLoggingId = null;

function recieveMessagesFromPlugin(msg,sender,sendResponse){
  if(msg.messageType === "WebpageChanged"){
    currentWebpageLoggingId = msg.webpageLoggingId;



    if(currentWebpageLoggingId !== null){

      // input.hidden = false;
      annotationEditor.style.display = 'block';

      tagify.removeAllTags();

      const webpageTags = msg.webpageTags;


      if(webpageTags.length != 0){

        tagify.addTags(webpageTags);
      }
    }else{

      // input.hidden = true;
      annotationEditor.style.display = 'none'
    }
  }

}
browser.runtime.onMessage.addListener(recieveMessagesFromPlugin)

function setUp(){


  browser.runtime.sendMessage({
    messageType: "TellSystemAnnotationUIIsOpen"
  }).then(results => {

    const returns = results.webpageAndTags;

    const allTags = results.allTags;

    tagify = new Tagify(input, {
      tagTextProp: 'text',
      whitelist: allTags,
      maxTags: 10,
      dropdown: {
        maxItems: 20,           // <- mixumum allowed rendered suggestions
        classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
        enabled: 0,             // <- show suggestions on focus
        closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
      },
      // callbacks: {
      //   // "add": onAddTag,
      //   "remove": removeTag
      // }
    })
    tagify.on("add", onAddTag)
    tagify.on("remove", removeTag)

    if(returns.webpageLoggingId !== null){
      currentWebpageLoggingId = returns.webpageLoggingId
      const webpageCurrentTags = returns.tags
  

      // input.hidden = false;
      annotationEditor.style.display = 'block';
  
      tagify.addTags(webpageCurrentTags)
      // tagify.on("add", onAddTag)
      // tagify.on("remove", removeTag)
    }else{

      // tagify.sett.hidden = true;
      annotationEditor.style.display = 'none';
    }
  })




}
setUp();


/**
 * @description
 * <tagId -> (isAdded)>
 * if it is not added, then it is being deleted
 */
var tagsReport = new Map();
var newTagsAddedReport = new Set();

function onAddTag(e){
  // outputs a String


  const addedTag = e.detail.data;

  if("id" in addedTag){

    tagsReport.set(addedTag["id"], true)

  }
  else{

    newTagsAddedReport.add(addedTag["value"])

  }

}

function removeTag(e){
  // outputs a String


  const removedTag = e.detail.data;
  

  if("id" in removedTag){

    if(tagsReport.has(removedTag.id)){
      tagsReport.delete(removedTag.id)
    }else{
      tagsReport.set(removedTag.id,false)
    }
  }
  else{
    newTagsAddedReport.delete(removedTag["value"])
  }
}

function submitTagForWebpage(){


    let updatedTagsReport = {}
    if(tagsReport.size != 0){
      updatedTagsReport.tagReport = Array.from(tagsReport);
      tagsReport = new Map();
    }
    if(newTagsAddedReport.size != 0){
      updatedTagsReport.newTagsAdded = [...newTagsAddedReport];
      newTagsAddedReport = new Set();
    }

    browser.runtime.sendMessage({
        messageType: "ChangeTagsOfWebPage",
        webpageLoggingId: currentWebpageLoggingId,
        tagsReport: updatedTagsReport
    })
    
}
document.getElementById("submitTags").onclick = submitTagForWebpage;

function goBack(){
    window.location.href = "../SideBarMenu.html";
}
document.getElementById("backButton").onclick = goBack;



function addHostnameAsPotentialForAutoCollectors(){


  browser.runtime.sendMessage({
    messageType: "AddHostnameToCollection",
    currentWebpageLoggingId: currentWebpageLoggingId
  });
  
}
document.getElementById("addHostnameButton").onclick = addHostnameAsPotentialForAutoCollectors;

