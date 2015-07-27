// This script is only injected when the popup form is loaded
// (see popup.js), so we don't need to worry about waiting for page load

// Object to hold information about the current page

//debugger;

var readTimeout = 100;

var foundText = [];

var gReadDoneFlag = true;

$(".logmessage").each(function (){
    foundText.push($(this).text());
});

pagination = $(".paginationItem");
paginationLength = pagination.length;
if (paginationLength > 0){
    next = pagination[paginationLength-1];
    if(next && next.text && next.text.indexOf("Next")>=0){
        next.click();
        console.log('next page');
        setTimeout(readNextPage, readTimeout);
        gReadDoneFlag = false;
    }
}

if (gReadDoneFlag) {
    readDone();
}

function readNextPage(){
    gReadDoneFlag = false;
    $(".logmessage").each(function (){
        foundText.push($(this).text());
    });
    pagination = $(".paginationItem");
    paginationLength = pagination.length;
    next = pagination[paginationLength-1];
    if(next && next.text && next.text.indexOf("Next")>=0){
        next.click();
        console.log('next page');
    }
    else{
        if($(".result-text") && $(".result-text").text()){
            var line = $(".result-text").text();
            line.replace(/(\r\n|\n|\r)/gm,"");
            var numbers = line.match(/[0-9]+/g);
            if(numbers[1]==numbers[2]){
                console.log("done");
                gReadDoneFlag = true;
            }
            else {
                console.log("not last");
            }
        }
        else{
            console.log("not ready");
        }
    }
    if (!gReadDoneFlag) {
        setTimeout(readNextPage, readTimeout);
    }
    else {
        first = pagination[1];
        first.click();
        setTimeout(readDone, readTimeout);
    }
}

function readDone(){
    var regexArray = [];
    $("input.constraint-textbox").each(function() {
        regexArray.push(this.value);   
    });
    regexArray = $.unique(regexArray);
    console.log(regexArray);
    foundText = $.unique(foundText);
    console.log(foundText);
    matchInfo = {
        'regexArray':regexArray,
        'foundText' :foundText
    }
    chrome.extension.sendMessage(matchInfo);
}

// Send the information back to the extension
//chrome.extension.sendMessage(pageInfo);




//var comment_ID = document.getElementById("keywords_cosmetic");
//var gray_ID = comment_ID.getElementsByClassName('itemIcon gray');
//var red_ID = comment_ID.getElementsByClassName('itemIcon red');
//var cf_ID = document.getElementById("cf_doc_impact");
//var evt_click = document.createEvent("MouseEvents");
//evt_click.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
//var evt_over = document.createEvent("MouseEvents");
//evt_over.initMouseEvent("mouseover", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);

//gray_ID.dispatchEvent(evt_over);
//gray_ID.dispatchEvent(evt_click);
//red_ID.dispatchEvent(evt_over);
//red_ID.dispatchEvent(evt_click);
//console.log(gray_ID);
//console.log(red_ID);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) 
    {
        if (request.type=="CHANGE")
        {
            //console.log(sender.tab ?
            //        "from a content script:" + sender.tab.url :
            //        "from the extension");
            //console.log(request.greeting);
            summary_ID = document.getElementById("short_desc");
            summary_ID.value = request.summary;
            keyword_ID = document.getElementById("keywords");
            keyword_ID.value = request.keywords;
            comment_ID = document.getElementById("comment");
            comment_ID.value = request.comment;
            //if (request.greeting == "hello")
            //    sendResponse({farewell: "goodbye"});
        }
        else if(request.type=="SUBMIT")
        {
            var evt_click = document.createEvent("MouseEvents");
            evt_click.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
            submit_ID = document.getElementById("bugSubmit");
            button_ID = submit_ID.getElementsByClassName('ui-button ui-widget ui-state-default ui-corner-all');
            console.log(button_ID);
            jQuery("button_ID").submit();
        }
        else
        {
                console.log("Error in request type");
        }
    }
);
