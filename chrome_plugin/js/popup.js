// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, tab);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function showMatchedString(matchInfo){
    console.log(matchInfo);
    regexArray = matchInfo.regexArray;
    foundText = matchInfo.foundText;
    var matchedRegex = []
    $(regexArray).each(function(){
        var patt = new RegExp(this.toLowerCase());
        var matched = false;
        $(foundText).each(function (){
            if (patt.test(this.toLowerCase())){
                console.log("matched");
                console.log(this);
                matched = true;
                return false;
            }
        });
        if (matched){
            matchedRegex.push(this);
        }
    });
    console.log(matchedRegex);
    //$("#log_regex").text(matchedRegex);
    var data = encodeURIComponent(JSON.stringify(matchedRegex)); 
    $("#tree").attr("src", "http://easydebug.eng.vmware.com:5555/regexSearch?data=" + data);
    /* 
    $.ajax({
        type:"GET",
        url:"http://easydebug:5555/regexSearch",
        data:"data="+data,
        cache:false, //......
        success:function(res){
            if(res.res=="success"){
                //document.getElementById("last_"+id).innerHTML = res.data;
                //document.getElementById("hidden_last_"+id).innerHTML = res.data;
                $('html').html(res.data);
            }
            else{
                $('html').html("Error while processing data");
            }
        }
    });
    */
}

function checkLogInsight(tab) {
    if(tab.title.toLowerCase().indexOf("Interactive Analytics | vRealize Log Insight".toLowerCase()) >= 0){
        return true;
    }
    else{
        return false;
    }
}

function showStop() {
    $("#tree").attr("src", "http://easydebug/fail.html");
}

window.addEventListener('load', function(evt) {
  getCurrentTabUrl(function(url, tab) {
      if(url.indexOf("bugzilla.eng.vmware.com/show_bug.cgi?id=") > -1) {
          var res = url.split("?id=");
          console.log(res[1]);
          var num = res[1].split("#");
          $("#tree").attr("src", "http://easydebug.eng.vmware.com/index.html?id=" + num[0]);
      } else {
          var isLogInsight = checkLogInsight(tab);
          if(isLogInsight){
              console.log('log insight');
              chrome.extension.getBackgroundPage().getPageInfo(showMatchedString, tab);
          }
          else{
              showStop();
          }
      }
  });
});
