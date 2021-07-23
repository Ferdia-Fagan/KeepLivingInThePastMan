import {TaggingStateContainer} from "../../utils/components/Tagging.js"

function goBack(){
    window.location.href = "../SideBarMenu.html";
    // dataToLoad
}
document.getElementById("backButton").onclick = goBack;

// setUp_SelectFromAndCreateNewTags(tagsInputTextArea);

// var tagify;
// const queryTagsBox = document.getElementById("autoCollectorTagField");

// var taggingState = new TaggingStateContainer(queryTagsBox);
// taggingState.setUp_SelectFromAndCreateNewTags(queryTagsBox)

// var x = setUp_SelectFromAndCreateNewTags(queryTagsBox).then((tagify) => {
//     // tagify.addTags(webpageCurrentTags)
//

//     var taggingState = new TaggingStateContainer()

//     const onAddTags = taggingState.onAddTag

//     tagify.addTags([]);
//     tagify.on("add", onAddTags);
//     // tagify.on("remove", taggingState.onRemoveTag);
//     //
//     //
    
//     Promise.resolve({tagify,taggingState});
// });
const selectionList_Container = document.getElementById("selectionList_Container");

const autoCollectorNameField = document.getElementById("autoCollectorNameField");
// const autoCollectorTagField = document.getElementById("autoCollectorTagField");
// const hostnameField = document.getElementById("hostnameField");
/**
 *  @description
 *      This is used to contain the autoCollector editing.
 *      using getEditedAutoCollector() is used to get: 
 *          updateReport(which will be used) to updated the native application 
 *              of tags and hostnames used for autoCollector. This just contains the 
 *              added or removed summaries.
 *      
 *          (2) updated autoCollector parameters. 
 *  @summary
 */
class AutoCollectorEditComponent{
    
    constructor(){    // TODO: get rid of default values
        //TODO: add all html elements for editing
        const self = this;
        browser.runtime.sendMessage({
            messageType: "GetAllTagsAndBookmarks"
        }).then(function({allTags,bookmarksData}) {
            self.autoCollectorTagField = new TaggingStateContainer(document.getElementById("autoCollectorTagField"),allTags,false);  
            // self.allWebpageTags = new Map(allTags.map(({value,id}) => [id,value]))

        });

        browser.runtime.sendMessage({
            messageType: "GetAllHostnames"
        }).then(function(hostnames) {
            self.autoCollectorHostnameField = new TaggingStateContainer(document.getElementById("hostnameField"),hostnames,true);  
            // self.allHostnames = new Map(hostnames.map(({value,id}) => [id,value]))
        });

        // this.nameField = autoCollectorName;
        
        // this.autoCollectorHostnameField
        // this.hostnameField = new TaggingStateContainer(document.getElementById("hostnameField"));  //TODO: use existing tags
        //
    }

    openAutoCollectorEditComponent(autoCollector){
        // setup:
        autoCollectorNameField.value = autoCollector.name;

        this.autoCollector = autoCollector;

        this.clearAutoCollectorEditorTaggings();

        if('tagIds' in this.autoCollector){
            // const theTags = this.autoCollector.tagIds.map(tagId => ({value: this.allWebpageTags.get(tagId), id: tagId}))
            //
            // this.autoCollectorTagField.removeTags();
            // this.autoCollectorTagField.addTags(theTags);
            this.autoCollectorTagField.addTags(this.autoCollector.tagIds);
        }

        if('hostIds' in this.autoCollector){
            // const theHostnames = this.autoCollector.hostIds.map(hostnameId => ({value: this.allHostnames.get(hostnameId), id: hostnameId}))
            //
            // this.autoCollectorHostnameField.removeTags();
            // this.autoCollectorHostnameField.addTags(theHostnames);
            this.autoCollectorHostnameField.addTags(this.autoCollector.hostIds);
        }

        // this.autoCollector = autoCollector;
        // this.autoCollectorIndex = autoCollectorIndex;
        // this.isNewAutoCollector = isNewAutoCollector;
        // if(isNewAutoCollector){
        //     // then making auto collecotr
        //     this.autoCollectorUpdates = {newNameField:autoCollectorName};
        // }else{
        //     // Then editing auto collector
        //     this.autoCollectorUpdates = {};
        // }
    }

    async getNewAutoCollector(){
        // var newAutoCollector = {};
        
        this.autoCollector.name = autoCollectorNameField.value;
        
        await this.autoCollectorTagField.updateIdsForNewTags();
        let tagIdsUsed = this.autoCollectorTagField.getAllTagsByIds();
        if(tagIdsUsed.length !== undefined){

            this.autoCollector.tagIds = tagIdsUsed;
        }
        //

        let hostnameIdsUsed = this.autoCollectorHostnameField.getAllTagsByIds();
        if(hostnameIdsUsed.length !== undefined){

            this.autoCollector.hostIds = hostnameIdsUsed;
        }
        //

        return this.autoCollector;
    } 

    /**
     * 
     * @returns autoCollectorUpdated,autoCollectorUpdates
     * autoCollectorUpdated -> whatever fields for autoCollector that have been updated(whole field)
     * To update browser plugin indexdb collection.
     * 
     * autoCollectorUpdates -> condensed update report of what has been changed, added, removed, etc. 
     * To update native application
     */
    async getEditedAutoCollector(){
        var autoCollectorUpdates = {id: this.autoCollector.id};
        var autoCollector = {id: this.autoCollector.id};
        // var autoCollectorUpdated = {};


        if(this.autoCollector.name !== autoCollectorNameField.value){
            // autoCollectorUpdates.newNameField = autoCollectorNameField.value;

            autoCollector["name"] = autoCollectorNameField.value;
        }

        // let tagsUpdateReport = this.autoCollectorTagField.getTagUpdatesReport();
        //
        // // if(Object.keys(tagsUpdateReport).length !== 0){
        // if(Object.keys(tagsUpdateReport).length !== 0){
        //

        //     autoCollectorUpdates.tagsUpdateReport = tagsUpdateReport;

        //     this.autoCollector.tagIds = this.autoCollectorTagField.getAllTagsByIds();
        //     // this.autoCollector.tags = autoCollectorNameField.value;
        // }

        await this.autoCollectorTagField.updateIdsForNewTags(); // TODO: this is hack just to get things working
        let tagsUpdateReport = this.autoCollectorTagField.getTagUpdatesReport();
        // if(tagsUsed.length !== undefined){
        if(Object.keys(tagsUpdateReport).length !== 0){
            autoCollectorUpdates.updatedTagsById = tagsUpdateReport;
            
            autoCollector["tagIds"] = this.autoCollectorTagField.getAllTagsByIds();
        }

        let hostnamesUpdateReport = this.autoCollectorHostnameField.getTagUpdatesReport();
        // if(Object.keys(hostnamesUpdateReport).length !== 0){
        if(Object.keys(hostnamesUpdateReport).length !== 0){

            autoCollectorUpdates.hostnamesUpdateReport = hostnamesUpdateReport;

            autoCollector["hostIds"] = this.autoCollectorHostnameField.getAllTagsByIds();
        }
        //
        //

        return [autoCollector,autoCollectorUpdates];
    }

    clearAutoCollectorEditorTaggings(){
        this.autoCollectorTagField.removeTags();
        this.autoCollectorHostnameField.removeTags();
    }

}

// var autoCollectorEditComponent = browser.runtime.sendMessage({
//         messageType: "GetAllTagsAndBookmarks"
//     }).then(function({allTags,bookmarksData}) {
//
//         autoCollectorEditComponent = new AutoCollectorEditComponent(allTags)
//
//         return autoCollectorEditComponent;
// });

const autoCollectorEditComponent = new AutoCollectorEditComponent();

const autoCollectorListElement = document.getElementById("selectionList");

// /**
//  * @description
//  * <autoCollectorId: Int, Name: String>
//  */
// var listOfAutoCollectors = [];


function setUp(){
    // TODO: make request to message background scripts to get list of current AutoAnnotators.
    // let index = 0;
    // var allTagsAndBookmarksRequest = browser.runtime.sendMessage({
    //     messageType: "GetAllTagsAndBookmarks"
    // })

    var allAutoCollectorsRequest = browser.runtime.sendMessage({
        messageType: "GetAllAutoCollectors"
    })
    allAutoCollectorsRequest.then(autoCollectors => {

        // listOfAutoCollectors = autoCollectors;

        for(let [autoCollectorId,autoCollectorName] of autoCollectors) {
            addAutoCollectorToViewableList(autoCollectorId, autoCollectorName);
        }
    })
    
}
setUp();

function addAutoCollectorToViewableList(indexId,autoCollector){
    let autoCollectorElement = document.createElement('li');
        
    let autoCollectorElementButton = document.createElement('button');
    autoCollectorElementButton.innerText = autoCollector;
    autoCollectorElementButton.dataset.autoCollectorId = indexId;
    autoCollectorElementButton.onclick = openExistingAutoCollector;

    autoCollectorElement.appendChild(autoCollectorElementButton);

    autoCollectorListElement.appendChild(autoCollectorElement);
}

// inst();

const addAutoCollector_Menu = document.getElementById("addAutoCollector_Menu")
const inputNameNewAutoCollector = document.getElementById("setNameForNewAutoCollector")

const editAutoCollector_Menu = document.getElementById("editAutoCollector_Menu")

const editAutoCollector_Container = document.getElementById("editAutoCollector_Container")

var currentlyCreatingNewAutoCollector = false;
/**
 * Triggered when click the createNewAutoCollector button.
 * If no name given, then does nothing.
 */
function createNewAutoCollector(){
    if(inputNameNewAutoCollector.value.length != 0){

        // autoCollectors.push({name: inputNameNewAutoCollector.value});
        // displayEditContainerForAutoCollector(autoCollectors.size,inputNameNewAutoCollector.value)
        openAutoCollectorEditDisplay();
        currentlyCreatingNewAutoCollector = true;
        var autoCollector = {name: inputNameNewAutoCollector.value}
        displayEditContainerForAutoCollector(autoCollector);
    }
}
document.getElementById("createNewAutoCollector").onclick = createNewAutoCollector;

var autoCollectorListElementSelected;

function openExistingAutoCollector(autoCollectorClicked){
    autoCollectorListElementSelected = autoCollectorClicked.target;

    browser.runtime.sendMessage({
        messageType: "GetAutoCollector",
        autoCollectorId: parseInt(autoCollectorClicked.currentTarget.dataset.autoCollectorId)
    }).then(autoCollector => {


        openAutoCollectorEditDisplay();
        displayEditContainerForAutoCollector(autoCollector);
    });

}

function displayEditContainerForAutoCollector(autoCollector){
    // addAutoCollector_Menu.style.display = "none";
    // editAutoCollector_Menu.style.display = "block";
    
    // editAutoCollector_Container.style.display = "block";

    // Setup editing fields:
    // const tagsInputTextArea = document.getElementById("autoCollectorNameField");
    // tagsInputTextArea.value = autoCollectorName;
    //

    autoCollectorEditComponent.openAutoCollectorEditComponent(autoCollector);
}

function openAutoCollectorEditDisplay(){
    selectionList_Container.style.display = "none";

    addAutoCollector_Menu.style.display = "none";
    editAutoCollector_Menu.style.display = "block";
    
    editAutoCollector_Container.style.display = "block";
}

function closeAutoCollectorEditDisplay(){
    selectionList_Container.style.display = "block";

    addAutoCollector_Menu.style.display = "block";
    editAutoCollector_Menu.style.display = "none";

    editAutoCollector_Container.style.display = "none";
}


function saveEditedAutoCollector(){

    if(currentlyCreatingNewAutoCollector){
        autoCollectorEditComponent.getNewAutoCollector().then(newAutoCollector => {

            browser.runtime.sendMessage({
                messageType: "CreateAutoCollector",
                newAutoCollector: newAutoCollector
            }).then(givenIdForNewAutoCollector => {
                // listOfAutoCollectors.push([givenIdForNewAutoCollector,newAutoCollector.name]);
                addAutoCollectorToViewableList(givenIdForNewAutoCollector,newAutoCollector.name);
            })
        });
        // let newAutoCollector = autoCollectorEditComponent.getNewAutoCollector();

        //

        // browser.runtime.sendMessage({
        //     messageType: "CreateAutoCollector",
        //     newAutoCollector: newAutoCollector
        // }).then(givenIdForNewAutoCollector => {
        //     // listOfAutoCollectors.push([givenIdForNewAutoCollector,newAutoCollector.name]);
        //     addAutoCollectorToViewableList(givenIdForNewAutoCollector,newAutoCollector.name);
        // })
        
        currentlyCreatingNewAutoCollector = false;
    }
    else{
        autoCollectorEditComponent.getEditedAutoCollector().then(([autoCollectorUpdated,autoCollectorUpdates]) => {


            
            if(Object.keys(autoCollectorUpdated).length !== 0){
                // This means that autoCollectorUpdates is also not empty
                browser.runtime.sendMessage({
                    messageType: "UpdateAutoCollector",
                    autoCollectorUpdated,
                    autoCollectorUpdates
                })
            }
        })
        // let [autoCollectorUpdated,autoCollectorUpdates] = autoCollectorEditComponent.getEditedAutoCollector();

        //
        //

        // if(Object.keys(autoCollectorUpdated).length !== 0){
        //     // This means that autoCollectorUpdates is also not empty
        //     browser.runtime.sendMessage({
        //         messageType: "UpdateAutoCollector",
        //         autoCollectorUpdated,
        //         autoCollectorUpdates
        //     })
        // }
        
    }
    closeAutoCollectorEditDisplay();

    // inst.getEditedAutoCollector()
    //
    //
    // const autoCollectorNewOrUpdate = autoCollectorEditComponent.getEditedAutoCollector();

    // if(autoCollectorEditComponent.isNewAutoCollector){
    //     // Then add new auto collector
    //     autoCollectors.push(newAutoCollector);
    //     addAutoCollectorToViewableList(autoCollectors.size,newAutoCollector);
    // }else{
    //     // Then update the auto collector
        
    // }

}
document.getElementById("saveEditedAutoCollector").onclick = saveEditedAutoCollector;


function deleteSelectedAutoCollector(){
    autoCollectorListElementSelected.remove();
    autoCollectorListElementSelected = null;

    if(!currentlyCreatingNewAutoCollector){
        browser.runtime.sendMessage({
            messageType: "DeleteAutoCollector",
            autoCollectorId: autoCollectorEditComponent.autoCollector.id
        })
    }
    closeAutoCollectorEditDisplay();

}
document.getElementById("deleteEditedAutoCollector").onclick = deleteSelectedAutoCollector;
