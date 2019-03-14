// Source: https://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
// Source: https://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
String.prototype.regexIndexOf = function (regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
// Source: https://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
String.prototype.regexLastIndexOf = function (regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if (typeof (startpos) == "undefined") {
        startpos = this.length;
    } else if (startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while ((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}
String.prototype.regexFindNext = function (regex, startIndex) {
    // add global flag to regex so that lastIndex of regex.exec works
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    regex.lastIndex = startIndex || 0;
    var result = regex.exec(this);
    if (result === null) {
        var pos = -1;
    } else {
        var pos = result.index;
        var matchLength = result[0].length;
    }
    return {
        pos: pos,
        matchLength: matchLength
    };
}
String.prototype.regexFindPrevious = function (regex, startIndex) {
    // add global flag to regex so that lastIndex of regex.exec works
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if (typeof (startIndex) == "undefined") {
        startIndex = this.length;
    } else if (startIndex < 0) {
        startIndex = 0;
    }
    var stringToWorkWith = this.substring(0, startIndex + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    var matchLength;
    while ((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        matchLength = result[0].length;
        regex.lastIndex = ++nextStop;
    }
    return {
        pos: lastIndexOf,
        matchLength: matchLength
    };
}
String.prototype.replaceFrom = function (search, replace, startIndex) {
    if (startIndex >= 0) {
        return this.substring(0, startIndex) + this.substring(startIndex).replace(search, replace);
    } else {
        return this.replace(search, replace);
    }
}
// Based on: https://stackoverflow.com/a/7781395/6798201
const FAR = {};
FAR.isCaseSensitive = false; // default to be case insensitive
FAR.isRegex = false; // default to plain string search
FAR.findMode = false; // find next search result when ENTER is pressed
FAR.findAndReplaceMode = false; // find and replace next search result when ENTER is pressed
// api source: https://github.com/mattjmattj/simple-undo
FAR.history = new SimpleUndo({
    maxLength: 100,
    provider: function (done) {
        done(getContent());
    }
});
FAR.history.initialize(getContent());

$("#FARTextarea").addEventListener("keydown",
    (e) => {
        var evtobj = window.event ? event : e
        // detect ctrl+z (undo)
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
            FAR.history.undo(setContent);
        };
        // detect ctrl+y (redo)
        if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
            FAR.history.redo(setContent);
        };
        // detect ENTER
        if (evtobj.keyCode === 13) {
            if (FAR.findMode) {
                e.preventDefault();
                FAR.findNext();
                detectCursorMove($("#FARTextarea")).then(() => {
                    console.log("cursor moved!");
                    FAR.findMode = false;
                });
            } else if (FAR.findAndReplaceMode) {
                e.preventDefault();
                FAR.findAndReplace();
                detectCursorMove($("#FARTextarea")).then(() => {
                    FAR.findAndReplaceMode = false;
                });
            }
        }
        toggleFARPanel(e);
    });

$("#closeFARPanel").addEventListener("click", (e) => {
    toggleShowHide($("#FARPanel"), "table");
    $("#FARTextarea").focus();
});

$("#termSearch").addEventListener("keydown", (e) => {
    toggleFARPanel(e);
    var evtobj = window.event ? event : e
    // detect ENTER
    if (evtobj.keyCode === 13) {
        e.preventDefault();
        FAR.findNext();
        FAR.findMode = true;
        detectCursorMove($("#FARTextarea")).then(() => {
            console.log("cursor moved!");
            FAR.findMode = false;
        });
    }
});
$("#termReplace").addEventListener("keydown", (e) => {
    toggleFARPanel(e);
    var evtobj = window.event ? event : e
    // detect ENTER
    if (evtobj.keyCode === 13) {
        e.preventDefault();
        FAR.findAndReplace();
        FAR.findAndReplaceMode = true;
        detectCursorMove($("#FARTextarea")).then(() => {
            console.log("cursor moved!");
            FAR.findAndReplaceMode = false;
        });
    }
});

function detectCursorMove(input) {
    // clear previous interval
    if (FAR.detectCursorMoveTimeId) {
        clearInterval(FAR.detectCursorMoveTimeId);
    }
    return new Promise(function (resolve, reject) {
        let lastCursorPosition = getCursorPos(input);
        const timeId = setInterval(function () {
            console.log(`timeId ${timeId} detecting cursor move...`);
            if (input !== document.activeElement) { // input not on focus
                clearInterval(timeId);
                resolve("input out of focus!");
            } else {
                let currentCursorPosition = getCursorPos(input);
                if (!isSameCursorPosition(currentCursorPosition, lastCursorPosition)) {
                    console.log('TCL: timeId -> lastCursorPosition', lastCursorPosition);
                    console.log('TCL: timeId -> currentCursorPosition', currentCursorPosition);
                    console.log('TCL: timeId -> timeId', timeId);
                    clearInterval(timeId);
                    resolve("cursor moved!");
                }
                lastCursorPosition = currentCursorPosition;
            }
        }, 100);
        FAR.detectCursorMoveTimeId = timeId;
    });
}

function isSameCursorPosition(posA, posB) {
    return (posA.start === posB.start && posA.end === posB.end);
}

function toggleFARPanel(e) {
    var evtobj = window.event ? event : e

    // detect ctrl+f (find)
    if (evtobj.keyCode == 70 && evtobj.ctrlKey) {
        console.log('TCL: toggleFARPanel -> ctrl+f is pressed!');
        e.preventDefault();
        toggleShowHide($("#FARPanel"), "table");
        $("#FARTextarea").focus();
        $("#termSearch").focus();
    };
    // detect esc (Escape)
    if (evtobj.keyCode == 27) {
        $("#FARTextarea").focus();
        toggleShowHide($("#FARPanel"), "table");
    }
}

// term not found tooltip
FAR.notFoundTooltip = tippy('#termSearch', {
    trigger: "manual",
    animation: "perspective",
})[0];

function showTermNotFoundTooltip() {
    FAR.notFoundTooltip.setContent($("#termSearch").value + " not found!");
    FAR.notFoundTooltip.show();
}

function hideTermNotFoundTooltip() {
    FAR.notFoundTooltip.hide();
}

// position find and replace panel
if ($("#FARTextarea").clientWidth >= 800 &&
    $("#FARTextarea").clientHeight >= 300) {
    $("#FARPanel").style.top = 0;
    $("#FARPanel").style.right = 0;
    $("#FARPanel").style.margin = 0;
}

$("#termSearch").addEventListener("keydown", disableUndo);
$("#termSearch").addEventListener("input", () => {
    // turn off tooltip alert
    hideTermNotFoundTooltip();
});
$("#termReplace").addEventListener("keydown", disableUndo);
$("#termSearch").addEventListener("keyup", disableUndo);
$("#termReplace").addEventListener("keyup", disableUndo);
$("#FARTextarea").addEventListener("keyup", disableUndo);
$("#FARTextarea").addEventListener("keydown", disableUndo);

FAR.previousContent = getContent();
$("#FARTextarea").addEventListener("input", updateHistory);

function updateHistory() {
    const content = getContent();
    const difference = getDifference(FAR.previousContent, content);
    console.log('TCL: difference', difference);
    const lastVersionIndex = FAR.history.count();
    if ((difference.length === 1 && /\W/.test(difference)) ||
        difference.length > 1 ||
        lastVersionIndex === 0) {
        console.log("Saving latest history version...");
        FAR.history.save();
    } else { // update last history version
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

FAR.findNext = function () {
    FAR.find(true);
}

FAR.findPrevious = function () {
    FAR.find(false);
}

FAR.find = function (lookForNext = true) {
    console.log('TCL: FAR.find -> find');
    const textarea = $("#FARTextarea");
    // collect variables
    var txt = textarea.value;
    var searchRegex = $("#termSearch").value;

    searchRegex = FAR.processRegexPattern(searchRegex);
    console.log('TCL: FAR.find -> strSearchTerm', searchRegex);

    // find next index of searchterm, starting from current cursor position
    var cursorPosEnd = getCursorPosEnd(textarea);
    console.log('TCL: FAR.find -> cursorPos', cursorPosEnd);
    if (lookForNext) { // next match
        const result = txt.regexFindNext(searchRegex, cursorPosEnd);
        var termPos = result.pos;
        var searchTermLength = result.matchLength;
    } else { // previous match
        var cursorPosStart = getCursorPosStart(textarea) - 1;
        if (cursorPosStart < 0) {
            var termPos = -1;
        } else {
            const result = txt.regexFindPrevious(searchRegex, cursorPosStart);
            var termPos = result.pos;
            var searchTermLength = result.matchLength;
        }
    }

    // if found, select it
    if (termPos != -1) {
        setSelectionRange(textarea, termPos, termPos + searchTermLength);
    } else {
        // not found from cursor pos
        if (lookForNext) {
            // so start from beginning
            const result = txt.regexFindNext(searchRegex, 0);
            termPos = result.pos;
            searchTermLength = result.matchLength;
        } else {
            // so start from end
            const result = txt.regexFindPrevious(searchRegex, txt.length);
            var termPos = result.pos;
            var searchTermLength = result.matchLength;
        }
        if (termPos != -1) {
            setSelectionRange(textarea, termPos, termPos + searchTermLength);
            if (searchTermLength === undefined) {
                FAR.find(lookForNext);
            }
        } else {
            showTermNotFoundTooltip();
        }
    }
};

FAR.findAndReplace = function () {
    const textarea = $("#FARTextarea");
    // collect variables
    var origTxt = textarea.value; // needed for text replacement
    var txt = textarea.value;
    var searchRegex = $("#termSearch").value;
    var replaceRegex = $("#termReplace").value;

    searchRegex = FAR.processRegexPattern(searchRegex);

    // find next index of searchterm, starting from current cursor position
    var cursorPos = getCursorPosEnd(textarea);
    const result = txt.regexFindNext(searchRegex, cursorPos);
    var termPos = result.pos;
    var searchTermLength = result.matchLength;
	console.log('TCL: FAR.findAndReplace -> searchTermLength', searchTermLength);
    console.log('TCL: FAR.findAndReplace -> termPos', termPos);
    var newText = '';

    // if found, replace it, then select it
    if (termPos != -1) {
        replaceTerm();
    } else {
        // not found from cursor pos, so start from beginning
        const result = txt.regexFindNext(searchRegex, 0);
        termPos = result.pos;
        searchTermLength = result.matchLength;
        if (termPos != -1) {
            replaceTerm();
        } else {
            showTermNotFoundTooltip();
        }
    }

    function replaceTerm() {
        newText = origTxt.replaceFrom(searchRegex, replaceRegex, termPos);
        console.log('TCL: FAR.findAndReplace -> strReplaceWith', replaceRegex);
        console.log('TCL: FAR.findAndReplace -> strSearchTerm', searchRegex);
        let replaceTermLength = searchTermLength + (newText.length - origTxt.length);
		console.log('TCL: replaceTerm -> replaceTermLength', replaceTermLength);
        textarea.value = newText;
        setSelectionRange(textarea, termPos, termPos + replaceTermLength);
        FAR.history.save();
    }
};

FAR.replaceAll = function () {
    const textarea = $("#FARTextarea");
    // collect variables
    var txt = textarea.value;
    var strSearchTerm = $("#termSearch").value;

    strSearchTerm = FAR.processRegexPattern(strSearchTerm);

    // find all occurances of search string
    var matches = [];
    var pos = txt.regexIndexOf(strSearchTerm);
    while (pos > -1) {
        matches.push(pos);
        pos = txt.regexIndexOf(strSearchTerm, pos + 1);
    }

    for (var match in matches) {
        FAR.findAndReplace();
    }
};

FAR.processRegexPattern = function (regexStr) {
    let regex = regexStr;
    // escape special characters if search term is NOT a regular expression
    if (FAR.isRegex === false) {
        regex = RegExp.escape(regexStr);
    }
    // make text lowercase if search is supposed to be case insensitive
    if (FAR.isCaseSensitive === false) {
        regex = new RegExp(regex, "i");
    } else {
        regex = new RegExp(regex);
    }
    return regex;
}

$("#caseSensitive").addEventListener("click", (e) => {
    FAR.isCaseSensitive = !FAR.isCaseSensitive;
    $("#caseSensitive").classList.toggle("btn-hover");
});
$("#useRegex").addEventListener("click", (e) => {
    FAR.isRegex = !FAR.isRegex;
    $("#useRegex").classList.toggle("btn-hover");
});
$("#findPrevious").addEventListener("click", FAR.findPrevious);
$("#findNext").addEventListener("click", FAR.findNext);
$("#findAndReplace").addEventListener("click", FAR.findAndReplace);
$("#replaceAll").addEventListener("click", FAR.replaceAll);

document.addEventListener("mouseover", toggleBtnHighlight);
document.addEventListener("mouseout", toggleBtnHighlight);

function toggleBtnHighlight(e) {
    const hoveredButton = e.target.closest(".btn");
    if (hoveredButton) {
        hoveredButton.classList.toggle("btn-hover");
    }
}

// Undo changes in textarea
FAR.undo = function(){
    FAR.history.undo(setContent);
}
// Redo changes in textarea
FAR.redo = function(){
    FAR.history.redo(setContent);
}

/************************* Util methods ***********************/

function getCursorPosEnd(input) {
    return getCursorPos(input).end;
}

function getCursorPosStart(input) {
    return getCursorPos(input).start;
}

// source: https://stackoverflow.com/a/7745998/6798201
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

// Set selection of text in a textarea
// and scroll selection into middle of the screen
// Based on: https://stackoverflow.com/a/53082182/6798201
function setSelectionRange(textarea, selectionStart, selectionEnd) {
    const fullText = textarea.value;
    textarea.value = fullText.substring(0, selectionEnd);
    const scrollHeight = textarea.scrollHeight
    textarea.value = fullText;
    let scrollTop = scrollHeight;
    console.log('TCL: setSelectionRange -> scrollTop', scrollTop);
    const textareaHeight = textarea.clientHeight;
    if (scrollTop > textareaHeight) {
        scrollTop -= textareaHeight / 2;
    } else {
        scrollTop = 0;
    }
    console.log('TCL: setSelectionRange -> scrollTop', scrollTop);
    textarea.scrollTop = scrollTop;

    textarea.setSelectionRange(selectionStart, selectionEnd);
}

// source: https://stackoverflow.com/a/31733628/6798201
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
    return copyString($("#FARTextarea").value);
}

function setContent(newContent) {
    $("#FARTextarea").value = newContent;
}

// Toggle hide/show of an element
function toggleShowHide(element, displayStyle = "block") {
    console.log('TCL: toggleShowHide -> element.style.display', element.style.display);
    if (getStyle(element, "display") === "none") {
        console.log(`Showing ${element}...`);
        element.style.display = displayStyle;
    } else {
        console.log(`Hiding ${element}...`);
        element.style.display = "none";
    }
}

// Get the computed style of an element that is usually defined in CSS stylesheet
// Based on: https://stackoverflow.com/a/16748905/6798201
function getStyle(element, name) {
    return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
}

/*****Both of the below methods are already implemented in Chrome****/
// A jQuery like shorthand for querySelector function
// Source: https://gomakethings.com/making-it-easier-to-select-elements-with-vanilla-javascript/
function $(selector, scope) {
    scope = scope ? scope : document;
    return scope.querySelector(selector);
}
// A jQuery like shorthand for querySelectorAll function
// Source: https://gomakethings.com/making-it-easier-to-select-elements-with-vanilla-javascript/
function $$(selector, scope) {
    scope = scope ? scope : document;
    return scope.querySelectorAll(selector);
};