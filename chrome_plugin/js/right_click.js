// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The onClicked callback function.
function onClickHandler(info, tab) {
  if (info.menuItemId == "radio1" || info.menuItemId == "radio2") {
    console.log("radio item " + info.menuItemId +
                " was clicked (previous checked state was "  +
                info.wasChecked + ")");
  } else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
    console.log(JSON.stringify(info));
    console.log("checkbox item " + info.menuItemId +
                " was clicked, state is now: " + info.checked +
                " (previous state was " + info.wasChecked + ")");

  } else if(info.menuItemId == "bzselection"){
    //alert(info.selectionText + " is selected!");
    var key = info.selectionText;
    var search_url = "https://bugzilla.eng.vmware.com/buglist.cgi?query_format=advanced&ctype=&short_desc_type=allwordssubstr&short_desc=&longdesc_type=allwordssubstr&longdesc=" + key + "&keywords_type=allwords&keywords=&target_milestone_type=allwords&target_milestone=&bug_status=new&bug_status=assigned&bug_status=reopened&cf_build_type=equals&cf_build=&cf_branch_type=anywordssubstr&cf_branch=&cf_build_types_type=anywordssubstr&cf_build_types=&cf_build_target_type=anywordssubstr&cf_build_target=&cf_change_type=equals&cf_change=&cf_test_id_type=equals&cf_test_id=&emailassigned_to1=1&emailtype1=exact&email1=&emailassigned_to2=1&emailreporter2=1&emailqa_contact2=1&emailcc2=1&emailtype2=exact&email2=&cf_failed_type=equals&cf_failed=&cf_attempted_type=equals&cf_attempted=&cf_eta_type=&cf_doc_impact_type=equals&cf_i18n_impact_type=equals&host_op_sys_type=anyexact&guest_op_sys_type=anyexact&cf_rank_type=&cf_security_type=equals&cf_cwe_type=&cf_viss_type=&changedin=&chfieldfrom=&chfieldto=Now&chfieldoldvalue=&changes_from_product_name=0&changes_from_version_name=&chfieldvalue=&changes_to_product_name=0&changes_to_version_name=&bugidtype=include&bug_id=&votes=&sr_type=equals&sr=&sr_count_type=equals&sr_count=&cases_type=equals&cases=&case_count_type=equals&case_count=&kb_type=equals&kb=&kb_count_type=equals&kb_count=&field0-0-0=noop&type0-0-0=noop&value0-0-0=&cmdtype=doit&columnlist=&backButton=true&textSaver=longdesc%3Dmigration%7Cchfieldto%3DNow%7C&checkboxSaver=sPeople%3D100000001011010000%7CsBooleanSearch%3D0%7C"
    chrome.tabs.create({
            url: search_url,
            active: true
        }, function(tab) {
    });
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
  } else if(info.menuItemId == "ikbselection"){
    var key = info.selectionText;
    var search_url = "https://gss.vmware.com/#q=" + key + "&site=gss&start=0&num=25&lr=lang_en&partialfields=BQSQIgjAbArAnDGBmADPA7DdqAcAmOCHFFAFiQEogAA="
    chrome.tabs.create({
            url: search_url,
            active: true
        }, function(tab) {
    });
  }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  // Create one test item for each context type.
  var contexts = ["page","selection","link","editable","image","video",
                  "audio"];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "search " + context + " in bugzilla";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "bz" + context});
    var ikb_title = "search " + context + " in ikb";
    var ikb_id = chrome.contextMenus.create({"title": ikb_title, "contexts":[context],
                                         "id": "ikb" + context});
    console.log("'" + context + "' item:" + id);
  }

  // Create a parent item and two children.
  chrome.contextMenus.create({"title": "Test parent item", "id": "parent"});
  chrome.contextMenus.create(
      {"title": "Child 1", "parentId": "parent", "id": "child1"});
  chrome.contextMenus.create(
      {"title": "Child 2", "parentId": "parent", "id": "child2"});
  console.log("parent child1 child2");

  // Create some radio items.
  chrome.contextMenus.create({"title": "Radio 1", "type": "radio",
                              "id": "radio1"});
  chrome.contextMenus.create({"title": "Radio 2", "type": "radio",
                              "id": "radio2"});
  console.log("radio1 radio2");

  // Create some checkbox items.
  chrome.contextMenus.create(
      {"title": "Checkbox1", "type": "checkbox", "id": "checkbox1"});
  chrome.contextMenus.create(
      {"title": "Checkbox2", "type": "checkbox", "id": "checkbox2"});
  console.log("checkbox1 checkbox2");

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  console.log("About to try creating an invalid item - an error about " +
      "duplicate item child1 should show up");
});
