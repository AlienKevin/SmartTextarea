const FAR = {};
// api source: https://github.com/mattjmattj/simple-undo
FAR.history = new SimpleUndo({
    maxLength: 100,
    provider: function (done) {
        done(getContent());
    }
});
FAR.history.initialize(getContent());

document.getElementById("FARTextarea").addEventListener("keydown",
    (e) => {
        var evtobj = window.event ? event : e
        // detect ctrl+z (undo)
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
            FAR.history.undo(setContent);
        };
    });

document.getElementById("termSearch").addEventListener("keydown", disableUndo);
document.getElementById("termReplace").addEventListener("keydown", disableUndo);
document.getElementById("termSearch").addEventListener("keyup", disableUndo);
document.getElementById("termReplace").addEventListener("keyup", disableUndo);
document.getElementById("FARTextarea").addEventListener("keyup", disableUndo);
document.getElementById("FARTextarea").addEventListener("keydown", disableUndo);

FAR.previousContent = getContent();
document.getElementById("FARTextarea").addEventListener("input", updateHistory);
function updateHistory(){
	console.log('TCL: input');
    const content = getContent();
    const difference = getDifference(FAR.previousContent, content);
	console.log('TCL: difference', difference);
    const lastVersionIndex = FAR.history.count();
    if ((difference.length === 1 && /\W/.test(difference)) ||
        difference.length > 1 ||
        lastVersionIndex === 0) {
            console.log("Saving latest history version...");
        FAR.history.save();
    } else{ // update last history version
        FAR.history.stack[lastVersionIndex] = content;
    }
    FAR.previousContent = content;
}

function disableUndo(e) {
    var evtobj = window.event ? event : e
    // disable ctrl+z (undo)
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
        // console.log("preventing undo...");
        e.preventDefault();
    };
};

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
    var cursorPos = getCursorPosEnd(textarea);
    console.log('TCL: FAR.find -> cursorPos', cursorPos);
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
    var cursorPos = getCursorPosEnd(textarea);
    var termPos = txt.indexOf(strSearchTerm, cursorPos);
    var newText = '';

    // if found, replace it, then select it
    if (termPos != -1) {
        newText = origTxt.substring(0, termPos) + strReplaceWith + origTxt.substring(termPos + strSearchTerm.length, origTxt.length)
        textarea.value = newText;
        textarea.setSelectionRange(termPos, termPos + strReplaceWith.length);
        FAR.history.save();
    } else {
        // not found from cursor pos, so start from beginning
        termPos = txt.indexOf(strSearchTerm);
        if (termPos != -1) {
            newText = origTxt.substring(0, termPos) + strReplaceWith + origTxt.substring(termPos + strSearchTerm.length, origTxt.length)
            textarea.value = newText;
            textarea.setSelectionRange(termPos, termPos + strReplaceWith.length);
            FAR.history.save();
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
function getCursorPosEnd(input) {
    return getCursorPos(input).end;
}

function getCursorPos(input) {
    input.focus();
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

function copyString(str) {
    return (' ' + str).slice(1)
}
// source: https://stackoverflow.com/a/29574724/6798201
//assuming "b" contains a subsequence containing 
//all of the letters in "a" in the same order
function getDifference(a, b) {
    var i = 0;
    var j = 0;
    var result = "";

    while (j < b.length) {
        if (a[i] != b[j] || i == a.length)
            result += b[j];
        else
            i++;
        j++;
    }
    return result;
}

function getContent() {
    return copyString(document.getElementById("FARTextarea").value);
}

function setContent(newContent) {
    document.getElementById("FARTextarea").value = newContent;
}