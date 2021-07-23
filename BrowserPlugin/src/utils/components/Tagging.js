import '../../externalModules/tagify/tagify.min.js';


export function  getAllTagsAndBookmarks(){

    return browser.runtime.sendMessage({
        messageType: "GetAllTagsAndBookmarks"
    })

}


/**
 * When using tagify (tagging) this encapsulates functionality
 */
export class TaggingStateContainer {


  constructor(queryTagsBox,tagsToUse,enforceWhitelist,functionToGetIdsForNewTags){

      this.tagify;
      this.tagsReport = new Map();
      this.newTagsAddedReport = new Set();

      this.settingUpWithInitialTags = false;

      this.enforceWhitelist = enforceWhitelist;

      this.functionToGetIdsForNewTags = functionToGetIdsForNewTags;
      
      this.setUp_SelectFromAndCreateNewTags(queryTagsBox,tagsToUse,enforceWhitelist)
  }

  setUp_SelectFromAndCreateNewTags(queryTagsBox,tagsToUse,enforceWhitelist){
    // const self = this;
    // browser.runtime.sendMessage({
    //     messageType: "GetAllTagsAndBookmarks"
    // })
    // .then(function({allTags,bookmarksData}) {

    this.tagsToUse = tagsToUse;
    this.queryTagsBox = queryTagsBox;
    // var tagify;
    const self = this;
    self.tagify = new Tagify(this.queryTagsBox, {
        tagTextProp: 'text',
        whitelist: this.tagsToUse,
        maxTags: 10,
        enforceWhitelist: enforceWhitelist,
        dropdown: {
          maxItems: 20,           // <- mixumum allowed rendered suggestions
          classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
          enabled: 0,             // <- show suggestions on focus
          closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
        },
        callbacks: {
          "add": this.onAddTag.bind(self),
          "remove": this.onRemoveTag.bind(self)
        }
    });
    // .bind(self)
    // this.tagify.on("add",this.onAddTag);
    // self.setUpConfigs(self)
    // });
    //
  }

  addTags(tags){
    // this.tagify.settings.callbacks = {};
    // this.queryTagsBox.innerText = tags;
    // this.tagify.value = tags;
    // this.tagify.update(true)
    // this.tagify.updateValueByDOMTags()
    this.settingUpWithInitialTags = true;
    this.tagify.addTags(tags);
    this.settingUpWithInitialTags = false;
    // this.tagify.value.push(tags[0]);
  }

  removeTags(){
    this.tagify.removeAllTags();
  }

  onAddTag(e){
      // outputs a String

      if(!this.settingUpWithInitialTags){
        const addedTag = e.detail.data;
      
        if("id" in addedTag){

          // this.tagsReport.set(addedTag["id"], true);
          this.tagsReport.set(addedTag["id"], true)
          // browser.runtime.sendMessage({
          //   messageType: "AddTagToWebpage",
          //   isNewTag: false,
          //   tag: addedTag["id"]
          // });
        }
        else{

          this.newTagsAddedReport.add(addedTag["value"]);
          // browser.runtime.sendMessage({
          //   messageType: "AddTagToWebpage",
          //   isNewTag: true,
          //   tag: addedTag["value"]
          // });
        }
      }
    }

  onRemoveTag(tagRemoved_Detail){
      // outputs a String

    
      const removedTag = tagRemoved_Detail.detail.data;
      
    
      if("id" in removedTag){

        if(this.tagsReport.has(removedTag.id)){
          // Then the tag are removing has only been added during this annotation session (and so has not updated db)
          this.tagsReport.delete(removedTag.id);
        }else{
          this.tagsReport.set(removedTag.id,false);
        }
      }
      else{
        this.newTagsAddedReport.delete(removedTag["value"]);
      }
  }

  checkIfHasBeenChanged(){
    if(this.tagsReport.size != 0 || this.newTagsAddedReport.size != 0){
      return true;
    }else{
      return false;
    }
  }

  updateIdsForNewTags(){
    
    if(this.newTagsAddedReport.size !== 0){
      self = this;
      return browser.runtime.sendMessage({
        messageType: "AddNewTags",
        newTags: [...self.newTagsAddedReport]
      }).then(newTagIds => {

        self.newTagsIds = newTagIds.map(newTag => newTag.id);
        self.tagsToUse = self.tagsToUse.concat(newTagIds);
        // self.tagify.loadOriginalValues();
        self.tagify.settings.whitelist.push(...self.tagsToUse);
        // self.tagify.loading(false).dropdown.show


      })
    }else{
      return Promise.resolve()
    }
  }

  getTagUpdatesReport(){
    let updatedTagsReport = {};

    // this.tagsReport.map(([key,value]) => )
    let addedTags = [];
    let removedTags = [];
    
    this.tagsReport.forEach( (val, key) => {
      if(val){
        addedTags.push(key)
      }else{
        removedTags.push(key)
      }
    });




    if(addedTags.length !== 0){
      updatedTagsReport["addedTags"] = addedTags;
    }

    if(removedTags.length !== 0){
      updatedTagsReport["removedTags"] = removedTags;
    }

    // const x = Array.from( this.tagsReport ).map(([key, value]) => {
    //   if(){

    //   }
    // });
    //

    // if(this.tagsReport.size !== 0){
    //
    //   // updatedTagsReport.tagsReport = Array.from(this.tagsReport);
    //   updatedTagsReport = Array.from(this.tagsReport);
    //   this.tagsReport = new Map();
    // }
    if(!this.enforceWhitelist && this.newTagsAddedReport.size != 0){
      // then the user has been allowed to enter new tags (that dont exist yet)
      // and has added >= 1 new tags
      // this.newTagsIds = await browser.runtime.sendMessage({
      //   messageType: "AddNewTags",
      //   newTags: this.newTagsAddedReport
      // })


      if(!updatedTagsReport.hasOwnProperty("addedTags")){
        updatedTagsReport["addedTags"] = Array.from(this.newTagsIds);
      }else{
        updatedTagsReport["addedTags"] = updatedTagsReport["addedTags"].concat(this.newTagsIds)
      }


      // updatedTagsReport["newTagsAdded"] = Array.from(this.newTagsIds);
      this.newTagsAddedReport = new Set();
    }

    return updatedTagsReport;
  }

  getAllTagsByIds(){
    return this.tagify.value.map(item => {
      if(item.hasOwnProperty("id")){
        return item.id;
      }else{
        return this.newTagsIds.pop();
      }
    });
  }

}





