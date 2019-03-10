const FAR = {};
FAR.find = function () {
	console.log('TCL: FAR.find -> find');
    const textarea = document.getElementById("FARTextarea");
    // collect variables
    var txt = textarea.value;
    var strSearchTerm = document.getElementById("termSearch").value;
    var isCaseSensitive = document.getElementById("caseSensitive").checked;

    // make text lowercase if search is supposed to be case insensitive
    if (isCaseSensitive == false) {
        txt = txt.toLowerCase();
        strSearchTerm = strSearchTerm.toLowerCase();
    }

    // find next index of searchterm, starting from current cursor position
    var cursorPos = getCursorPos(textarea);
    var termPos = txt.indexOf(strSearchTerm, cursorPos);

    // if found, select it
    if (termPos != -1) {
        textarea.setSelectionRange(termPos, termPos + strSearchTerm.length);
    } else {
        // not found from cursor pos, so start from beginning
        termPos = txt.indexOf(strSearchTerm);
        if (termPos != -1) {
            textarea.setSelectionRange(termPos, termPos + strSearchTerm.length);
        } else {
            alert("not found");
        }
    }
};

FAR.findAndReplace = function () {
    const textarea = document.getElementById("FARTextarea");
    // collect variables
    var origTxt = textarea.value; // needed for text replacement
    var txt = textarea.value;
    var strSearchTerm = document.getElementById("termSearch").value;
    var strReplaceWith = document.getElementById("termReplace").value;
    var isCaseSensitive = document.getElementById("caseSensitive").checked;
    var termPos;

    // make text lowercase if search is supposed to be case insensitive
    if (isCaseSensitive == false) {
        txt = txt.toLowerCase();
        strSearchTerm = strSearchTerm.toLowerCase();
    }

    // find next index of searchterm, starting from current cursor position
    var cursorPos = getCursorPos(textarea);
    var termPos = txt.indexOf(strSearchTerm, cursorPos);
    var newText = '';

    // if found, replace it, then select it
    if (termPos != -1) {
        newText = origTxt.substring(0, termPos) + strReplaceWith + origTxt.substring(termPos + strSearchTerm.length, origTxt.length)
        textarea.value = newText;
        textarea.setSelectionRange(termPos, termPos + strReplaceWith.length);
    } else {
        // not found from cursor pos, so start from beginning
        termPos = txt.indexOf(strSearchTerm);
        if (termPos != -1) {
            newText = origTxt.substring(0, termPos) + strReplaceWith + origTxt.substring(termPos + strSearchTerm.length, origTxt.length)
            textarea.value = newText;
            textarea.setSelectionRange(termPos, termPos + strReplaceWith.length);
        } else {
            alert("not found");
        }
    }
};

FAR.replaceAll = function () {
    const textarea = document.getElementById("FARTextarea");
    // collect variables
    var txt = textarea.value;
    var strSearchTerm = document.getElementById("termSearch").value;
    var isCaseSensitive = document.getElementById("caseSensitive").checked;

    // make text lowercase if search is supposed to be case insensitive
    if (isCaseSensitive == false) {
        txt = txt.toLowerCase();
        strSearchTerm = strSearchTerm.toLowerCase();
    }

    // find all occurances of search string
    var matches = [];
    var pos = txt.indexOf(strSearchTerm);
    while (pos > -1) {
        matches.push(pos);
        pos = txt.indexOf(strSearchTerm, pos + 1);
    }

    for (var match in matches) {
        FAR.findAndReplace();
    }
};

document.getElementById("find").addEventListener("click", FAR.find);
document.getElementById("findAndReplace").addEventListener("click", FAR.findAndReplace);
document.getElementById("replaceAll").addEventListener("click", FAR.replaceAll);

// Util methods
function getCursorPos(input) {
    if ("selectionStart" in input && document.activeElement == input) {
        return {
            start: input.selectionStart,
            end: input.selectionEnd
        };
    } else if (input.createTextRange) {
        var sel = document.selection.createRange();
        if (sel.parentElement() === input) {
            var rng = input.createTextRange();
            rng.moveToBookmark(sel.getBookmark());
            for (var len = 0; rng.compareEndPoints("EndToStart", rng) > 0; rng.moveEnd("character", -1)) {
                len++;
            }
            rng.setEndPoint("StartToStart", input.createTextRange());
            for (var pos = {
                    start: 0,
                    end: len
                }; rng.compareEndPoints("EndToStart", rng) > 0; rng.moveEnd("character", -1)) {
                pos.start++;
                pos.end++;
            }
            return pos;
        }
    }
    return -1;
}