// Array to hold callback functions
var callbacks = []; 

function getDomainFromUrl(url){
	var host = "null";
	if(typeof url == "undefined" || null == url)
		url = window.location.href;
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

var isLogInsightFlag = false;

var gContentScriptData = {};

function checkForValidUrl(tabId, changeInfo, tab) {
    //only shows up when title is Log Insight
    gContentScriptData[tab.id] = null;
    if(tab.title.toLowerCase().indexOf("Interactive Analytics | vRealize Log Insight".toLowerCase()) >= 0){
        //chrome.browserAction.show(tabId);
        isLogInsightFlag = true;
    }
    else{
        isLogInsightFlag = false;
    }
};

function isLogInsight() {
    return isLogInsightFlag;
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);


// This function is called onload in the popup code
function getPageInfo(callback, tab) { 
    // Add the callback to the queue
    callbacks.push(callback); 
    // Inject the content script into the current page 
    if (!gContentScriptData[tab.id] || gContentScriptData[tab.id].foundText.length==0) {
        chrome.tabs.executeScript(tab.id, { file: "js/jquery.min.js" });
        chrome.tabs.executeScript(tab.id, { file: 'js/content_script.js' }); 
    }
    else{
        var callback = callbacks.shift();
        // Call the callback function
        callback(gContentScriptData[tab.id]); 
    }
}; 

// Perform the callback when a request is received from the content script
chrome.extension.onMessage.addListener(function(request)  { 
    // Save the request as cache
    var queryInfo = {
      active: true,
      currentWindow: true
    };
    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        gContentScriptData[tab.id] = request;
    });
    // Get the first callback in the callbacks array
    // and remove it from the array
    var callback = callbacks.shift();
    // Call the callback function
    callback(request); 
}); 
