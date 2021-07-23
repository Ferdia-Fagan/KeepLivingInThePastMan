import "../../externalModules/litepicker/dist/litepicker.js";
// import 'litepicker/dist/plugins/ranges';
import "../../externalModules/litepicker/dist/plugins/multiselect.js";

import '../../externalModules/tagify/tagify.min.js';


// import { addConsoleHandler } from 'selenium-webdriver/lib/logging';

// const TAGS_SYMBOL = '@'; 
// // const TAGS_SYMBOL = 50; 
// const BOOKMARKFOLDER_SYMBOL = '#'; 
// // const BOOKMARKFOLDER_SYMBOL = 51; 

// // const OPEN_CURLY_BRACKET = 219
// const OPEN_CURLY_BRACKET = '{'
// // const CLOSE_CURLY_BRACKET = 221
// const CLOSE_CURLY_BRACKET = '}'

// var lookingForOpeningBracket = false;


function goBack(){
    window.location.href = "../SideBarMenu.html";
    // dataToLoad
}
document.getElementById("backButton").onclick = goBack;

var tagify;
// var input = document.querySelector('[name=mix]')
const queryInputBox = document.getElementById("queryStringBox")
var queryTagsBox = document.getElementById("queryTagsBox");

var bookmarksFolderPathsMap = null;

function setUp(){
    // queryInputBox.oninput = inputss 
    // queryInputBox.onkeypress = queryInput
    
    browser.runtime.sendMessage({
        messageType: "GetAllTagsAndBookmarks",
    }).then(tagsAndBookmarksData=>{

        const {allTags,bookmarksData} = tagsAndBookmarksData;



        tagify = new Tagify(queryTagsBox, {
            tagTextProp: 'text',
            whitelist: allTags,
            maxTags: 10,
            enforceWhitelist: true,
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
        tagify.addTags([])
        tagify.on("add", onAddTag)
        tagify.on("remove", onRemoveTag)
        // tagify.getTagIndexByValue
        // bookmarksAsTree.name = "root";
        const {rootId, bookmarksPathsMap} = bookmarksData
        bookmarksFolderPathsMap = bookmarksPathsMap;
        // convertBookmarkTreeToNodeView(bookmarksFilterViewList,bookmarksAsTree);
        convertBookmarkPathMapToNodeView(bookmarksFilterViewList,rootId);
    })
    // const i = new Litepicker({
    //     element: document.getElementById('litepicker'),
    //     singleMode: false,
    //     format:'DD/MM/YYYY',
    //     // singleMode: false,
    //     plugins: ['multiselect'],   //'multiselect'
    //     inlineMode:true,
    //     setup: (picker) => {
    //         picker.on('button:apply', () => {
    //             // some action
    //
    //             //
    //             dateInput.value = picker.multipleDatesToString("DD/MM/YYYY")
    //         })
    //     }
    //     // tooltipText: {
    //     //     one: 'night',
    //     //     other: 'nights'
    //     // },
    //     // tooltipNumber: (totalDays) => {
    //     //     return totalDays - 1;
    //     // }
    // })

    // i.multipleDatesToString()
}
setUp();

var yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const dateInput = new Litepicker({
    element: document.getElementById('litepicker'),
    singleMode: false,
    format:'DD/MM/YYYY',
    // singleMode: false,
    plugins: ['multiselect'],   //'multiselect'
    inlineMode:true,
    maxDate: yesterday
    // setup: (picker) => {
    //     picker.on('button:apply', () => {
    //         // some action
    //
    //         //
    //         dateInput.value = picker.multipleDatesToString("DD/MM/YYYY")
    //     })
    // }
});



function onAddTag(e){


}

function onRemoveTag(e){


}


/* function inputss(value){

    // if(closeOpenCurlyBrackets){
    //
    //     queryInputBox.value += '}'
    //     closeOpenCurlyBrackets = false
    //     queryInputBox.setSelectionRange(queryInputBox.value.length - 1,queryInputBox.value.length - 1)
    // }
} */

const bookmarksFilterView = document.getElementById("bookmarksFilterView")
// const bookmarksFilterViewList = document.getElementById("bookmarksFilterViewList")
const bookmarksFilterViewList = document.querySelector('#bookmarksFilterViewList')

var hideFIlterByBookmarksView = true;

function filterByBookmarks(){


    hideFIlterByBookmarksView = !hideFIlterByBookmarksView;

    bookmarksFilterView.style.display = (hideFIlterByBookmarksView ? "none":"block");
}
document.getElementById("filterByBookmarks").onclick = filterByBookmarks;

var selectedBookmarkFolders = new Set();

function bookmarkNodePressed(bookmarkNodePressed){
    //


    const bookmarkSelected = JSON.parse(bookmarkNodePressed.getAttribute('data-selected'))
    
    bookmarkNodePressed.dataset.selected = !bookmarkSelected
    var colorToSet;
    if(!bookmarkSelected){
        colorToSet = "blue"
        // bookmarkNodePressed.style.backgroundColor = "blue";
        selectedBookmarkFolders.add(bookmarkNodePressed.id)
    }else{
        colorToSet = "red"
        // bookmarkNodePressed.style.backgroundColor = "red";
        selectedBookmarkFolders.delete(bookmarkNodePressed.id)
    }
    bookmarkNodePressed.style.backgroundColor = colorToSet;

    const selectedBookmarkChildren = bookmarksFolderPathsMap.get(bookmarkNodePressed.id).bookmarkChildren

    function getAllDescendantsOfBookmarkFolder(bookmarkChildren){
        for(let bookmarkChildId of bookmarkChildren){
            document.getElementById(bookmarkChildId).style.backgroundColor = colorToSet;
            // bookmarksFilterViewList["." + bookmarkChildId].style.backgroundColor = "blue";
            getAllDescendantsOfBookmarkFolder(bookmarksFolderPathsMap.get(bookmarkChildId).bookmarkChildren)

            if(bookmarkSelected){
                // then deslect:
                selectedBookmarkFolders.delete(bookmarkChildId)
            }else{
                // then select:
                selectedBookmarkFolders.add(bookmarkChildId)
            }
        }
    }

    getAllDescendantsOfBookmarkFolder(selectedBookmarkChildren);
}

function convertBookmarkPathMapToNodeView(parent,currentBookmarkId){
    var li = document.createElement("li");
    var nodeButton = document.createElement("BUTTON");

    const {name, bookmarkChildren} = bookmarksFolderPathsMap.get(currentBookmarkId)
    // nodeButton.innerHTML = folder.name;
    nodeButton.innerHTML = name;
    // nodeButton.value = folder.bookmarkId;
    // nodeButton.setAttribute('data-id',currentBookmarkId);
    nodeButton.setAttribute('data-selected',false)

    nodeButton.setAttribute("id", currentBookmarkId)

    nodeButton.style.backgroundColor = "red";

    // nodeButton.onclick = printId
    // nodeButton.onclick = (() =>
    // nodeButton.onclick = (() => printId(folder.bookmarkId))
    nodeButton.addEventListener('click', event => {
        bookmarkNodePressed(event.target)
    });

    li.appendChild(nodeButton);

    

    if(bookmarkChildren.length != 0){

        var folderNode = document.createElement("ul")
        // folderNode.innerHTML = ""
        for(let childFolderId of bookmarkChildren){

            folderNode = (convertBookmarkPathMapToNodeView(folderNode,childFolderId));
        }

        li.appendChild(folderNode);

    }else{

    }
    
    parent.appendChild(li);
    return parent;
}


/* function convertBookmarkTreeToNodeView(parent,folder){
    var li = document.createElement("li");
    var nodeButton = document.createElement("BUTTON");
    // nodeButton.innerHTML = folder.name;
    nodeButton.innerHTML = folder.name;
    // nodeButton.value = folder.bookmarkId;
    nodeButton.setAttribute('data-id',folder.bookmarkId);

    // nodeButton.onclick = printId
    // nodeButton.onclick = (() =>
    // nodeButton.onclick = (() => printId(folder.bookmarkId))
    nodeButton.addEventListener('click', event => {
        bookmarkNodePressed(event.target)
    });

    li.appendChild(nodeButton);

    if(folder.bookmarkChildren.length != 0){

        var folderNode = document.createElement("ul")
        // folderNode.innerHTML = ""
        for(let childFolder of folder.bookmarkChildren){

            folderNode = (convertBookmarkTreeToNodeView(folderNode,childFolder));
        }

        li.appendChild(folderNode);

    }else{

    }
    
    parent.appendChild(li);
    return parent;
     
} */
const queryResultsContainer = document.getElementById("queryResultsContainer")

function submitQuery(){
    //
    var tagIds = [];
    for(let tagAdded of tagify.value ){


        tagIds.push(tagAdded.id)
    }

    let theQuery = {};

    const dateInput_dates = dateInput.multipleDatesToString('DD/MM/YYYY',',');

    if(dateInput_dates !== ""){

        theQuery["filterDates"] = dateInput_dates.split(',');
    }

    // theQuery["filterByToday"] = document.querySelector("#filterByToday_Option:checked").value;
    // == "off")? true:false;

    theQuery["filterByToday"] = (document.querySelector("#filterByToday_Option:checked")  != null)? true:false;

    // var theQuery = {query: queryInputBox.value}

    if(tagIds.length != 0){
        theQuery["tags"] = tagIds;
    }
    if(selectedBookmarkFolders.size != 0){
        theQuery["bookmarks"] =  Array.from(selectedBookmarkFolders.keys());
    }


    if(queryInputBox.value.length !== 0){

        theQuery["query"] = queryInputBox.value.toLowerCase();

        browser.runtime.sendMessage({
            messageType: "Query",
            query: theQuery
        }).then((queryResultsMes) => {
            const queryResults = queryResultsMes.results


    
            queryResultsContainer.innerHTML = "";   // reset results.
    
            if(queryResults.length == 0){
                var noResultHolder = document.createElement('li');
                noResultHolder.appendChild(document.createTextNode("No results found"))
    
                queryResultsContainer.appendChild(noResultHolder)
            }else{
    
                for(let [webpageLoggingId,webpageTitle,webpageUrl,imgUrl] of queryResults){
                    /*
                        SINGLE LIST ELEMENT:
                        
                            <li class="queryResultItem">
                            <div class="webpageResultHeader"><a href="https://en.wikipedia.org/wiki/Information_theory">https://en.wikipedia.org/wiki/Information_theory</a></div>
                            <div class="webpageInfoCont">
                                <div class="webpageDataCont">
                                <p>Home page</p>
                                </div>
                                <div><img class="webpageImgCont" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Binaryerasurechannel.png/100px-Binaryerasurechannel.png"></div>
                            </div>
                            </li>
        
                    */
        
                    var resultItem = document.createElement('li');
                    resultItem.className = "queryResultItem"
        
                    const webpageResultHeader = document.createElement('div');
                    webpageResultHeader.className = "webpageResultHeader"
                    resultItem.appendChild(webpageResultHeader)
        
                    const webpageLink_a = document.createElement('a');
                    webpageLink_a.href = decodeURI(webpageUrl);
                    webpageLink_a.innerHTML = decodeURI(webpageUrl);
                    webpageLink_a.dataset.webpageLoggingId = webpageLoggingId;
                    webpageLink_a.addEventListener('click', event => {

                    });
        
                    webpageResultHeader.appendChild(webpageLink_a)
        
                    const webpageInfoCont = document.createElement('div');
                    webpageInfoCont.className = "webpageInfoCont";
                    resultItem.appendChild(webpageInfoCont)
        
                    const webpageDataCont = document.createElement('div');
                    webpageDataCont.className = "webpageDataCont";
                    webpageInfoCont.appendChild(webpageDataCont)
        
                    const webpageTitle_p = document.createElement('p');
                    webpageTitle_p.appendChild(document.createTextNode(decodeURI(webpageTitle)))
                    webpageDataCont.appendChild(webpageTitle_p)
        
                    const webpageImgCont = document.createElement('div');
                    webpageImgCont.className = "webpageImgCont";
                    webpageInfoCont.appendChild(webpageImgCont)
        
                    var img = new Image();
                    img.src =  decodeURI(imgUrl); 
                    webpageImgCont.appendChild(img);
        
                    // nodeButton.setAttribute('data-selected',false)
        
        
                    // resultItem.appendChild(webpageLink);
                    // resultItem.appendChild(webpageInfoCont);
                    
        
                    queryResultsContainer.appendChild(resultItem);
                }
            }
        })
    }

}
document.getElementById("submitQuery").onclick = submitQuery;



