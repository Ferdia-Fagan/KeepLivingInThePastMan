// browser.menus.create({
//   id: "log-selection",
//   title: "Log '%s' to the console",
//   contexts: ["selection"]
// });

// browser.menus.onClicked.addListener(function(info, tab) {
//   if (info.menuItemId == "log-selection") {
//     console.log(info.selectionText);
//   }
// });
// import getCssSelector from 'css-selector-generator';
// import unique from 'unique-selector';

import {highlightSelection,highlightWithThisCollectionOfRanges} from "../utils/TextHighlighter"

// import Rangee from '../../custom_modules/rangee-master';

// import "../../node_modules/rangy/lib/rangy-serializer"
// import "../../node_modules/rangy/lib/rangy-classapplier"
// import "../../node_modules/rangy/lib/rangy-highlighter"

// var rangy = window.rangy;


//------------------------------------------------------

// var serializedHighlights = decodeURIComponent(window.location.search.slice(window.location.search.indexOf("=") + 1));
// var highlighter;

// var initialDoc;



// window.onload = function() {


//     console.log("loaded rangy")
//     rangy.init();

//     highlighter = rangy.createHighlighter();

//     highlighter.addClassApplier(rangy.createClassApplier("highlight", {
//         ignoreWhiteSpace: true,
//         tagNames: ["span", "a"]
//     }));

//     highlighter.addClassApplier(rangy.createClassApplier("note", {
//         ignoreWhiteSpace: true,
//         elementTagName: "a",
//         elementProperties: {
//             href: "#",
//             onclick: function() {
//                 var highlight = highlighter.getHighlightForElement(this);
//                 if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
//                     highlighter.removeHighlights( [highlight] );
//                 }
//                 return false;
//             }
//         }
//     }));


//     if (serializedHighlights) {
//         highlighter.deserialize(serializedHighlights);
//     }
// };

// function highlightSelectedText() {
//     console.log("highlightSelectedText() called")
//     highlighter.highlightSelection("highlight");
    
// }

// function noteSelectedText() {
//     highlighter.highlightSelection("note");
// }

//------------------------------------------------------


// const rangee = new Rangee({ document });

// // import TextHighlighter from "../utils/TextHighlighter"
// // import {highlight} from "../utils/TextHighlighterSave"
// import {highlightSelection,highlightWithThisCollectionOfRanges} from "../utils/TextHighlighter"

// // var hltr = new TextHighlighter(document.body);

// const options = {
//     // Array of selector types based on which the unique selector will generate
//     selectorTypes : [ 'ID', 'Class','NthChild' ]
// }
// // selectorTypes : [ 'ID', 'Class', 'Tag', 'NthChild' ]


const NOTE_POPUP = `<div id='KLITP_AddNoteForHighlightPopup'>
    <textarea id="KLITP_NoteEditor" placeholder='write note for highlight'></textarea>
    <button id="KLITP_AddNote" >Add note</button>
    <button id="KLITP_CancelNote" >Cancel</button>
    </div>
    `;
document.body.insertAdjacentHTML('afterend',NOTE_POPUP);

const notePopUpDiv = document.getElementById("KLITP_AddNoteForHighlightPopup");

const noteEditor = document.getElementById("KLITP_NoteEditor");


document.getElementById("KLITP_AddNote").onclick = handler_AddNote;
document.getElementById("KLITP_CancelNote").onclick = handler_CancelNote;

var theIdTemp = 0;

var notes = new Map();

var currentOpenedNoteId;

function setupFromBackgroundScript(request){

    if(request.messageType === "GiveHighlightsAndNotes"){

        

    }

}
// browser.runtime.onMessage.addListener(setupFromBackgroundScript)

function handler_AddNote(){
    console.log("add button clicked");
    
    let note = noteEditor.value;

    notes.set(currentOpenedNoteId,note);

    browser.runtime.sendMessage({
        messageType: "SaveSelectedTextNoteFromWebpage",
        highlightId: currentOpenedNoteId,
        highlightNote: note
    });

    notePopUpDiv.style.display = 'none';
}

function handler_CancelNote(){
    console.log("cancel button clicked");

    notePopUpDiv.style.display = 'none';
}


function clickedHighlightedText(event){

    currentOpenedNoteId = parseInt(event.target.dataset.theId);

    notePopUpDiv.style.display = 'block';

    if(notes.has(currentOpenedNoteId)){
        noteEditor.value = notes.get(currentOpenedNoteId)
    }else{
        noteEditor.value = "";
    }
}

// function rangeToObj(range) {
//     return {
//       startKey: range.startContainer.parentNode.dataset.key,
//       startTextIndex: Array.prototype.indexOf.call(range.startContainer.parentNode.childNodes, range.startContainer),
//       endKey: range.endContainer.parentNode.dataset.key,
//       endTextIndex: Array.prototype.indexOf.call(range.endContainer.parentNode.childNodes, range.endContainer),
//       startOffset: range.startOffset,
//       endOffset: range.endOffset
//     }
// }

// function objToRange(uniqueSelector) {
//     var range = document.createRange();
//     range.setStart(document.querySelector(uniqueSelector).childNodes[0], 5);
//     range.setEnd(document.querySelector(uniqueSelector).childNodes[0], 0);
//     return range;
// }
// var key=0
// function addKey(element) {
//     if (element.children.length > 0) {
//         Array.prototype.forEach.call(element.children, function(each, i) {
//         each.dataset.key = key++;
//         addKey(each)
//         });
//     }
// };

// addKey(document.body);

// function getUniqueKeyForNode (targetNode) {
//     const pieces = ['doc'];
//     let node = targetNode;

//     while (node && node.parentNode) {
//         pieces.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node));
//         node = node.parentNode
//     }

//     return pieces.reverse().join('/');
// }

function highlightTheSelectedText(){
    var selectedTextFromWebpage = document.getSelection();
    var range = selectedTextFromWebpage.getRangeAt(0);
    // range.

    var startElementSelectorStartOffset = range.startOffset;
    var endElementSelectorEndOffset = range.endOffset;

    // const startElementSelector = unique(selectedTextFromWebpage.anchorNode, options );
    // const endElementSelector = unique(selectedTextFromWebpage.focusNode, options );

    // var highlightInfo = {};

    var highlightWrapper = document.createElement("span");
    // highlightWrapper.style.display = "inline"
    
    highlightWrapper.dataset.theId = theIdTemp;

    console.log("highlightWrapper.dataset.theId: " + highlightWrapper.dataset.theId)

    highlightWrapper.addEventListener('click',clickedHighlightedText,false);
    highlightWrapper.style.backgroundColor = "#ffff00";
    highlightWrapper.style.fontSize = "1.2em";
    range.surroundContents(highlightWrapper);


    var startElementSelector = null;
    var endElementSelector = null;

    var selectionAnchorNodeOffset = selectedTextFromWebpage.anchorOffset - 1;
    var selectionFocusNodeOffset = selectedTextFromWebpage.focusOffset - 1;

    var rangeIsInSameElement = null;
    var rangeIsInSameChild = null;

    if(range.startContainer !== range.endContainer){
        startElementSelector = unique(range.startContainer, options );
        endElementSelector = unique(range.endContainer, options );
        
        rangeIsInSameElement,rangeIsInSameChild = false;
    }else{
        startElementSelector = unique(range.startContainer, options );
        rangeIsInSameElement = true;

        if(selectionAnchorNodeOffset === selectionFocusNodeOffset-1){
            rangeIsInSameChild = true;
        }else{
            rangeIsInSameChild = false;
        }
    }

    console.log("adsofmnewoinrewjrnkewjbrewrbiuwefndsiojfas 1: " + unique(highlightWrapper, options ))
    console.log("adsofmnewoinrewjrnkewjbrewrbiuwefndsiojfas 2: " + getCssSelector(highlightWrapper))
    console.log("adsofmnewoinrewjrnkewjbrewrbiuwefndsiojfas 3: " + unique(range.startContainer, options ))
    console.log("adsofmnewoinrewjrnkewjbrewrbiuwefndsiojfas 4: " + getCssSelector(range.startContainer))
    console.log("adsofmnewoinrewjrnkewjbrewrbiuwefndsiojfas 5: " + unique(selectedTextFromWebpage.anchorNode, options ))
    console.log("adsofmnewoinrewjrnkewjbrewrbiuwefndsiojfas 6: " + getCssSelector(selectedTextFromWebpage.anchorNode))

    // var selectionAnchorNode = unique(selectedTextFromWebpage.anchorNode, options );
    // var selectionFocusNode = unique(selectedTextFromWebpage.focusNode, options );

    // var selectionAnchorNodeOffset = selectedTextFromWebpage.anchorOffset - 1;
    // var selectionFocusNodeOffset = selectedTextFromWebpage.focusOffset - 1;


    // const startElementSelector = unique(range.startContainer, options );
    // const endElementSelector = unique(range.endContainer, options );

    // const startElementSelector = unique(selectedTextFromWebpage.anchorNode, options );
    // const startElementSelector = unique(range.startContainer, options );

    // const endElementSelector = unique(selectedTextFromWebpage.focusNode, options );
    // const endElementSelector = unique(range.endContainer.focusNode, options );

    console.log("adding saved highlight to range 11 : " + theIdTemp)
    console.log("adding saved highlight to range 21 : " + startElementSelectorStartOffset)
    console.log("adding saved highlight to range 31 : " + endElementSelectorEndOffset)

    browser.runtime.sendMessage({
        messageType: "SaveSelectedTextFromWebpage",
        highlightId: theIdTemp,
        highlightInfo: {rangeIsInSameElement:rangeIsInSameElement,rangeIsInSameChild:rangeIsInSameChild,
            startElementSelector,startElementSelectorStartOffset,
            endElementSelector,endElementSelectorEndOffset,
            // selectionAnchorNode,selectionFocusNode,
            selectionAnchorNodeOffset,selectionFocusNodeOffset}
    });

    selectedTextFromWebpage.removeAllRanges();

    theIdTemp+=1;
    
}

// browser.runtime.sendMessage({
//     messageType: "GetHighlightedTextAndNotesFromWebpage",
// }).then(highlightTheText,false);


function highlightTheText(selectedTextFromWebpage){
    console.log("highlightTheText has arrived: " + JSON.stringify(selectedTextFromWebpage));

    let highlightedTexts = selectedTextFromWebpage["highlightedTexts"]
    let highlightsNotes = selectedTextFromWebpage["highlightsNotes"];

    if(highlightedTexts.size !== 0){
        notes = highlightsNotes;
        // notes.size
        var x = highlightedTexts.entries();
    
        console.log("the x size is : " + x.length)
    
        var ranges = [];
    
        for(let [i,selectedText] of x){
            var {rangeIsInSameElement,rangeIsInSameChild,
                startElementSelector,startElementSelectorStartOffset,
                endElementSelector,endElementSelectorEndOffset,
                selectionAnchorNodeOffset,selectionFocusNodeOffset} = selectedText

            console.log("adding saved highlight to range 1 : " + i)
            console.log("adding saved highlight to range startElementSelectorStartOffset : " + startElementSelectorStartOffset)
            console.log("adding saved highlight to range endElementSelectorEndOffset : " + endElementSelectorEndOffset)
        
            // console.log("adding saved highlight to range selectionAnchorNodeOffset : " + selectionAnchorNodeOffset)
            // console.log("adding saved highlight to range selectionFocusNodeOffset : " + selectionFocusNodeOffset)

            // var startNode = document.querySelector(startElementSelector);
            // var endNode = document.querySelector(endElementSelector);
        
            // var SelectionStartNode = document.querySelector(selectionAnchorNode);
            // var SelectionEndNode = document.querySelector(selectionFocusNode);
        
            // const abc = startNode.innerText
            // console.log("child node is: " + abc)
            // theSelection.setBaseAndExtent(SelectionStartNode,selectionAnchorNodeOffset,SelectionEndNode,selectionFocusNodeOffset)

            // const theRangeForSelection = new Range()
            // var theRangeForSelection = document.createRange();
            // var theSelection = document.getSelection();
            // window.getSelection()

            // theRangeForSelection.setStart(startNode,selectionAnchorNodeOffset);
            // theRangeForSelection.setEnd(endNode,selectionFocusNodeOffset);
            // theRangeForSelection.collapse(true);
            // theRangeForSelection.setStart(SelectionStartNode.firstChild,startElementSelectorStartOffset);
            // theRangeForSelection.setEnd(SelectionEndNode.firstChild,endElementSelectorEndOffset);

            var theRange = document.createRange();
            // theRange.setStartAfter(theRangeForSelection.startContainer)
            // theRange.collapse(true);
            // theRange.setStartAfter(theRangeForSelection.endContainer)

            var startRangeNode = null;
            var startRangeNodeChildIndex = null;

            var endRangeNode = null;
            var endRangeNodeChildIndex = null;

            if(rangeIsInSameElement){
                console.log("x1");

                startRangeNode = endRangeNode = document.querySelector(startElementSelector);

                if(rangeIsInSameChild){
                    console.log("x2");
                    startRangeNodeChildIndex = endRangeNodeChildIndex = selectionAnchorNodeOffset;
                }else{
                    console.log("x3");
                    startRangeNodeChildIndex = selectionAnchorNodeOffset;
                    endRangeNodeChildIndex = selectionFocusNodeOffset;
                }
                  

            }else{
                console.log("x4");
                startRangeNode = document.querySelector(startElementSelector);
                endRangeNode = document.querySelector(endElementSelector);
                
                startRangeNodeChildIndex = selectionAnchorNodeOffset;
                endRangeNodeChildIndex = selectionFocusNodeOffset;
            }


            theRange.setStart(startRangeNode.childNodes[startRangeNodeChildIndex],startElementSelectorStartOffset);
            theRange.setEnd(endRangeNode.childNodes[endRangeNodeChildIndex],endElementSelectorEndOffset);

            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(theRange); 
    
            var range = sel.getRangeAt(0);

            ranges.push([i,range]);

            // sel.removeAllRanges(); 

            // var theRangeForSelectionStartOffset = theRangeForSelection.startContainer;
            // var theRangeForSelectionEndOffset = theRangeForSelection.endContainer;

            // theRangeForSelection.setStart(theRangeForSelection.startOffset, startElementSelectorStartOffset);
            // theRangeForSelection.setEnd(theRangeForSelection.endContainer.firstChild, endElementSelectorEndOffset);

            // const theSelection = document.getSelection();

            // theSelection.setBaseAndExtent(SelectionStartNode,selectionAnchorNode,SelectionEndNode,selectionFocusNode)

            // theSelection.removeAllRanges();
            // const theRangeForSelection = document.createRange();

            // theSelection.addRange(theRange);
            

            // var theRange = document.createRange();

            // theRange.setStartAfter(theRangeForSelectionStartOffset)
            // theRange.setStart(startNode.firstChild,startElementSelectorStartOffset);
            // theRange.setEnd(endNode.firstChild,endElementSelectorEndOffset);
        
            // theRange.setStart(startNode, startElementSelectorStartOffset);
            // theRange.setEnd(endNode, endElementSelectorEndOffset);
    
            // theSelection.addRange(theRange);

            // var range = theSelection.getRangeAt(0);

            // var theRangeForSelectionStartOffset = range.startContainer;
            // var theRangeForSelectionEndOffset = range.endContainer;

            // range.setStartAfter(theRangeForSelectionStartOffset)
            // range.setEndBefore(theRangeForSelectionEndOffset)

            // range.setStart(theRangeForSelectionStartOffset.firstChild,startElementSelectorStartOffset);
            // range.setEnd(theRangeForSelectionEndOffset.firstChild,endElementSelectorEndOffset);

            // const theSelectionn = document.getSelection();

            // // theSelection.removeAllRanges();
            // // theSelectionn.removeAllRanges();
            // theSelectionn.addRange(range);

            // const theRange = theSelection.getRangeAt(0);

            // ranges.push([i,range]);

            // theSelection.removeAllRanges()
            // theSelectionn.removeAllRanges()
    
        }
    
        var max = 0;
    
        for(let [i, theRange] of ranges){
            console.log("adding saved highlight to range : " + i)
            console.log("adding saved highlight to range : " + theRange.toString())
            const highlightWrapper = document.createElement("span");
    
            highlightWrapper.dataset.theId = i;
        
            highlightWrapper.addEventListener('click',clickedHighlightedText,false);
            highlightWrapper.style.backgroundColor = "#ffff00";
            highlightWrapper.style.fontSize = "1.2em";
            theRange.surroundContents(highlightWrapper);
    
            if(i>max){
                max = i;
            }
        }
    
        theIdTemp = max+1;        
    }



}


function reHighlightTheText(selectedTextFromWebpage){
    let highlightedTexts = selectedTextFromWebpage["highlightedTexts"];
    let highlightsNotes = selectedTextFromWebpage["highlightsNotes"];

    if(highlightedTexts.size !== 0){

        var allHighlights = highlightedTexts.entries();

        for(let [i,selectedText] of allHighlights){
            var deserializedSelection = rangy.deserializeSelection(selectedText);
            highlightSelectionn(deserializedSelection)
            // // const {startElementSelector,startElementSelectorStartOffset,
            //     // endElementSelector,endElementSelectorEndOffset} = selectedText;
            // // console.log("startElementSelectorstartElementSelector: " + startElementSelector)
            // console.log("rehighlighting")

            // // var selection = document.getSelection();

            // // var startElementNode = document.querySelector(startElementSelector)
            // // var endElementNode = document.querySelector(endElementSelector)


            // // selection.setBaseAndExtent(startElementNode,startElementSelectorStartOffset,endElementNode,endElementSelectorEndOffset);

            // highlightWithThisCollectionOfRanges(selectedText)
            // // highlightSelection(selection);
        }

    }

}

function highlightSelectionn(selection){
    // if (selection && selection.rangeCount > 0) {
    //     const range = selection.getRangeAt(0);

    //     if (range) {
    //         var serializedRange = rangy.serializeRange(range);
    //         var deseriazedRange = rangy.deserializeRange(range);
    //         // there you have rangee output (range representation in base64) and you can store somewhere
    //     }
    // }    

    // const selectionAsRangesCollection = highlightSelection(selection);
    highlightSelection(selection);
    // var range = selection.getRangeAt(0);
    // var startElementSelectorStartOffset = selection.anchorOffset;
    // var endElementSelectorEndOffset = selection.focusOffset;

    // var range = document.createRange();
    // range.setStart(selection.anchorNode, startElementSelectorStartOffset);
    // range.setEnd(selection.focusNode, endElementSelectorEndOffset);
    
    // var x = range.startContainer;
    // if(x.nodeType === 3){
    //     x = x.parentElement;
    // }
    // var startElementSelector = unique(x, options )
    // console.log("asdfoidsiofjsdvcnsadf " + startElementSelector)
    // console.log("asdfoidsiofjsdvcnsadf " + startElementSelectorStartOffset)
    // console.log("asdfoidsiofjsdvcnsadf " + endElementSelectorEndOffset)

    // var y = range.endContainer;
    // if(y.nodeType === 3){
    //     y = y.parentElement;
    // }
    // var endElementSelector = unique(y, options )
    // console.log("asdfoidsiofjsdvcnsadf " + endElementSelector)
    
    // {startElementSelector,startElementSelectorStartOffset,
    //     endElementSelector,endElementSelectorEndOffset}
    // browser.runtime.sendMessage({
    //     messageType: "SaveSelectedTextFromWebpage",
    //     highlightId: theIdTemp,
    //     highlightInfo: selectionAsRangesCollection
    // });
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey) {
        console.log("command pressed:")
        if(event.key == "h"){
            console.log("Command pressed is highlight");
            // rangy.init();
            // highlightTheSelectedText()

            // // var serializedSelection = rangy.serializeSelection(selection,false,document.documentElement);
            var serializedSelection = serializeSelection();

            var selection = document.getSelection();

            browser.runtime.sendMessage({
                messageType: "SaveSelectedTextFromWebpage",
                highlightId: theIdTemp,
                highlightInfo: serializedSelection
            });

            highlightSelectionn(selection);
            // highlightSelectedText();
        }

        if(event.key == "n"){
            console.log("Command pressed is noteing");
            noteSelectedText();
        }

    }

}, false);

function serializeSelection(){
    var serializedSelection = rangy.serializeSelection();

    // serializedSelection.focus();
    // serializedSelection.select();

    return serializedSelection;
}



function restoreSelection() {
    rangy.init();
    rangy.modules.Serializer;

    console.log('page is fully loaded1');
    browser.runtime.sendMessage({
        messageType: "GetHighlightedTextAndNotesFromWebpage",
    }).then(reHighlightTheText,false);
    // rangy.init();
    // rangy.restoreSelectionFromCookie();
}

// window.addEventListener('load', (event) => {
//     console.log('page is fully loaded2');
// });

// var selectionSaved = false;

// function saveSelection() {
//     if (!selectionSaved) {
//         rangy.saveSelectionCookie();
//         selectionSaved = true;
//     }
// }

window.onload = restoreSelection;
// window.onbeforeunload = saveSelection;
// window.onunload = saveSelection;



