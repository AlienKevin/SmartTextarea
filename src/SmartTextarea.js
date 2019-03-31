import './utils.js'
import './style.css'
import SimpleUndo from 'simple-undo'
import tippy from 'tippy.js'
import './smart-textarea-icons.css'

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
    var result;
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
class SmartTextarea {
    constructor(textarea, options) {
        if (textarea === undefined) {
            throw new Error("No target textarea specified!");
        } else {
            this.textarea = textarea;
            this.textarea.classList.add("FARTextarea");
        }

        const defaultOptions = {
            isCaseSensitive: false,
            isRegex: false,
            maxHistoryLength: 100,
        }
        const mergedOptions = {
            ...defaultOptions,
            ...options
        };
        this.isCaseSensitive = mergedOptions.isCaseSensitive;
        this.isRegex = mergedOptions.isRegex;
        this.maxHistoryLength = mergedOptions.maxHistoryLength;

        this.findMode = false; // find next search result when ENTER is pressed
        this.findAndReplaceMode = false; // find and replace next search result when ENTER is pressed
        // api source: https://github.com/mattjmattj/simple-this.undo
        const that = this;
        this.history = new SimpleUndo({
            maxLength: this.maxHistoryLength,
            provider: (done) => {
                done(that.getContent.bind(that)());
            }
        });
        this.history.initialize(this.getContent());

        this._surroundTextareaWithDiv();

        this._createFARPanel();
        this._initializeFARComponentNames();

        // add btn-hover style to turned on buttons
        if (this.isCaseSensitive){
            this.caseSensitiveBtn.classList.add("btn-hover");
        }
        if (this.isRegex){
            this.useRegexBtn.classList.add("btn-hover");
        }

        this._initializeTermNotFoundTooltip();

        this._setUpTextarea();
        this._positionFARPanel();
        this._setUpFARInputs();
        this._setUpFARButtons();
        this.constructor._setUpButtonHoverStyle();

    }

    _initializeFARComponentNames() {
        const componentNameList = [
            "expandBtn",
            "findField",
            "termSearch", "caseSensitiveBtn", "wholeWordBtn", "useRegexBtn", "findPreviousBtn", "findNextBtn", "closeFARPanelBtn",
            "replaceField",
            "termReplace", "findAndReplaceBtn", "replaceAllBtn"
        ];
        const that = this;
        componentNameList.forEach(function (name) {
            console.log('TCL: SmartTextarea -> _initializeFARComponentNames -> name', name);
            that[name] = that.FARPanel.querySelector(`.${name}`);
        });

        hide(this.replaceField);
    }

    _surroundTextareaWithDiv() {
        const smartTextarea = document.createElement("div");
        smartTextarea.classList.add("smartTextarea");
        this.textarea.insertAdjacentElement("beforebegin", smartTextarea);
        smartTextarea.appendChild(this.textarea);
    }

    // create search and replace panel
    _createFARPanel() {
        this.textarea.insertAdjacentHTML("afterend",
            `<div class="FARPanel">
            <span class="expandBtn btn"><i class="icon-right-triangle"></i></span>
            <div class="findField">
                <div>
                    <input type="text" class="termSearch" placeholder="Find" />
                    <span class="caseSensitiveBtn btn" title="Match Case"><i class="icon-caseSensitivity"></i></span>
                    <span class="wholeWordBtn btn" title="Match Whole Word"><i class="icon-wholeWord"></i></span>
                    <span class="useRegexBtn btn" title="Use Regular Expression"><i class="icon-useRegex"></i></span>
                </div>
                <span class="findPreviousBtn btn" title="Find Previous"><i class="icon-arrow-left"></i></span>
                <span class="findNextBtn btn" title="Find Next"><i class="icon-arrow-right"></i></span>
                <span class="closeFARPanelBtn btn" title="Close"><i class="icon-close"></i></span>
            </div>
            <div class="replaceField">
                <input type="text" class="termReplace" placeholder="Replace" title="Replace" />
                <span class="findAndReplaceBtn btn" title="Find & Replace"><i class="icon-findAndReplace"></i></span>
                <span class="replaceAllBtn btn" title="Replace All"><i class="icon-replaceAll"></i></span>
            </div>
        </div>`
        );
        this.FARPanel = this.textarea.nextElementSibling;
        console.log('TCL: SmartTextarea -> _createFARPanel -> FARPanel', this.FARPanel);
    }

    _setUpTextarea() {
        this.textarea.addEventListener("keydown",
            (e) => {
                var evtobj = window.event ? event : e
                // detect ctrl+z (this.undo)
                if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
                    this.undo();
                };
                // detect ctrl+y (this.redo)
                if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
                    this.redo();
                };
                // detect ENTER
                if (evtobj.keyCode === 13) {
                    if (this.findMode) {
                        e.preventDefault();
                        this.findNext();
                        this._detectCursorMove(this.textarea).then(() => {
                            console.log("cursor moved!");
                            this.findMode = false;
                        });
                    } else if (this.findAndReplaceMode) {
                        e.preventDefault();
                        this.findAndReplace();
                        this._detectCursorMove(this.textarea).then(() => {
                            this.findAndReplaceMode = false;
                        });
                    }
                }
                this._toggleFARPanel(e);
            });

        this.closeFARPanelBtn.addEventListener("click", (e) => {
            toggleShowHide(this.FARPanel, "table");
            this.textarea.focus();
        });

    }

    // position find and replace panel
    _positionFARPanel() {
        if (this.textarea.clientWidth >= 800 &&
            this.textarea.clientHeight >= 300) {
            this.FARPanel.style.top = 0;
            this.FARPanel.style.right = 0;
            this.FARPanel.style.margin = 0;
        }
    }

    // set up search and replace input boxes
    _setUpFARInputs() {
        // disable default this.undo in search and replace inputs and textarea
        this.termSearch.addEventListener("keydown", this.constructor._disableUndo);
        this.termSearch.addEventListener("input", () => {
            // turn off tooltip alert
            this._hideTermNotFoundTooltip();
        });
        this.termReplace.addEventListener("keydown", this.constructor._disableUndo);
        this.termSearch.addEventListener("keyup", this.constructor._disableUndo);
        this.termReplace.addEventListener("keyup", this.constructor._disableUndo);
        this.textarea.addEventListener("keyup", this.constructor._disableUndo);
        this.textarea.addEventListener("keydown", this.constructor._disableUndo);

        // store history for custom this.undo in textarea
        this.previousContent = this.getContent();
        this.textarea.addEventListener("input", this.updateHistory.bind(this));

        // set up inputs
        this.termSearch.addEventListener("keydown", (e) => {
            this._toggleFARPanel(e);
            var evtobj = window.event ? event : e
            // detect ENTER
            if (evtobj.keyCode === 13) {
                e.preventDefault();
                console.log('TCL: SmartTextarea -> _setUpFARInputs -> this.findNext', this.findNext);
                console.log('TCL: SmartTextarea -> _setUpFARInputs -> this', this);
                this.findNext();
                this.findMode = true;
                this._detectCursorMove(this.textarea).then(() => {
                    console.log("cursor moved!");
                    this.findMode = false;
                });
            }
        });
        this.termReplace.addEventListener("keydown", (e) => {
            this._toggleFARPanel(e);
            var evtobj = window.event ? event : e
            // detect ENTER
            if (evtobj.keyCode === 13) {
                e.preventDefault();
                this.findAndReplace();
                this.findAndReplaceMode = true;
                this._detectCursorMove(this.textarea).then(() => {
                    console.log("cursor moved!");
                    this.findAndReplaceMode = false;
                });
            }
        });
    }

    // set up buttons in FARPanel
    _setUpFARButtons() {
        // show/hide replaceField
        this.expandBtn.addEventListener("click", () => {
            const icon = this.expandBtn.firstElementChild;
            if (icon.classList.contains("icon-right-triangle")){
                icon.classList.remove("icon-right-triangle");
                icon.classList.add("icon-down-triangle");
            } else{
                icon.classList.remove("icon-down-triangle");
                icon.classList.add("icon-right-triangle");
            }
            toggleShowHide(this.replaceField, "table-row");
        });

        this.caseSensitiveBtn.addEventListener("click", (e) => {
            this.isCaseSensitive = !this.isCaseSensitive;
            this.caseSensitiveBtn.classList.toggle("btn-hover");
        });
        this.wholeWordBtn.addEventListener("click", (e) => {
            this.isWholeWord = !this.isWholeWord;
            this.wholeWordBtn.classList.toggle("btn-hover");
        });
        this.useRegexBtn.addEventListener("click", (e) => {
            this.isRegex = !this.isRegex;
            this.useRegexBtn.classList.toggle("btn-hover");
        });
        // use bind to assign the right object to "this"
        this.findPreviousBtn.addEventListener("click", this.findPrevious.bind(this));
        this.findNextBtn.addEventListener("click", this.findNext.bind(this));
        this.findAndReplaceBtn.addEventListener("click", this.findAndReplace.bind(this));
        this.replaceAllBtn.addEventListener("click", this.replaceAll.bind(this));
    }

    // Detect mouse hovering on buttons and switch styles
    static _setUpButtonHoverStyle() {
        document.addEventListener("mouseover", this.toggleBtnHighlight);
        document.addEventListener("mouseout", this.toggleBtnHighlight);
    }

    _detectCursorMove(input) {
        // clear previous interval
        if (this.detectCursorMoveTimeId) {
            clearInterval(this.detectCursorMoveTimeId);
        }
        return new Promise((resolve, reject) => {
            let lastCursorPosition = this.constructor.getCursorPos(input);
            const timeId = setInterval(() => {
                console.log(`timeId ${timeId} detecting cursor move...`);
                if (input !== document.activeElement) { // input not on focus
                    clearInterval(timeId);
                    resolve("input out of focus!");
                } else {
                    let currentCursorPosition = this.constructor.getCursorPos(input);
                    if (!this.constructor.isSameCursorPosition(currentCursorPosition, lastCursorPosition)) {
                        console.log('TCL: timeId -> lastCursorPosition', lastCursorPosition);
                        console.log('TCL: timeId -> currentCursorPosition', currentCursorPosition);
                        console.log('TCL: timeId -> timeId', timeId);
                        clearInterval(timeId);
                        resolve("cursor moved!");
                    }
                    lastCursorPosition = currentCursorPosition;
                }
            }, 100);
            this.detectCursorMoveTimeId = timeId;
        });
    }

    _toggleFARPanel(e) {
        var evtobj = window.event ? event : e

        // detect ctrl+f (find)
        if (evtobj.keyCode == 70 && evtobj.ctrlKey) {
            console.log('TCL: toggleFARPanel -> ctrl+f is pressed!');
            e.preventDefault();
            this.search();
        };
        // detect esc (Escape)
        if (evtobj.keyCode == 27) {
            this.textarea.focus();
            toggleShowHide(this.FARPanel, "table");
        }
    }

    search() {
        const selectedText = window.getSelection().toString();
        if (this.termSearch.value === selectedText) {
            console.log('TCL: SmartTextareaBase -> search -> selectedText', selectedText);
            toggleShowHide(this.FARPanel, "table",
                () => {}, // show callback
                () => { // hide callback
                    this.textarea.focus();
                });
            if (selectedText === ""){
                this.termSearch.focus();
            }
        } else {
            if (selectedText !== "") {
                show(this.FARPanel, "table");
                this.termSearch.value = selectedText;
                this.findMode = true;
                this.textarea.focus();
            } else {
                toggleShowHide(this.FARPanel, "table",
                () => {this.termSearch.focus();},
                () => {this.textarea.focus();});
            }
        }
    }

    _initializeTermNotFoundTooltip() {
        // term not found tooltip
        this.notFoundTooltip = tippy(this.termSearch, {
            trigger: "manual",
            animation: "perspective",
        });
        console.log('TCL: SmartTextarea -> _initializeTermNotFoundTooltip -> this.notFoundTooltip', this.notFoundTooltip);
    }

    _showTermNotFoundTooltip() {
        this.notFoundTooltip.setContent(this.termSearch.value + " not found!");
        this.notFoundTooltip.show();
    }

    _hideTermNotFoundTooltip() {
        this.notFoundTooltip.hide();
    }

    updateHistory() {
        const content = this.getContent();
        const difference = this.constructor._getDifference(this.previousContent, content);
        console.log('TCL: difference', difference);
        const lastVersionIndex = this.history.count();
        if ((difference.length === 1 && /\W/.test(difference)) ||
            difference.length > 1 ||
            lastVersionIndex === 0) {
            console.log("Saving latest history version...");
            this.history.save();
        } else { // update last history version
            this.history.stack[lastVersionIndex] = content;
        }
        this.previousContent = content;
    }

    static _disableUndo(e) {
        var evtobj = window.event ? event : e
        // disable ctrl+z (this.undo)
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
            // console.log("preventing this.undo...");
            e.preventDefault();
        };
    };

    findNext() {
        this.find(true);
    }

    findPrevious() {
        console.log('TCL: SmartTextarea -> findNext -> this', this);
        this.find(false);
    }

    find(lookForNext = true) {
        console.log('TCL: this.find -> find');
        const textarea = this.textarea;
        // collect variables
        var txt = textarea.value;
        var searchRegex = this.termSearch.value;

        searchRegex = this.processRegexPattern(searchRegex);
        console.log('TCL: this.find -> strSearchTerm', searchRegex);

        // find next index of searchterm, starting from current cursor position
        var cursorPosEnd = this.constructor.getCursorPosEnd(textarea);
        console.log('TCL: this.find -> cursorPos', cursorPosEnd);
        if (lookForNext) { // next match
            const result = txt.regexFindNext(searchRegex, cursorPosEnd);
            var termPos = result.pos;
            var searchTermLength = result.matchLength;
        } else { // previous match
            var cursorPosStart = this.constructor.getCursorPosStart(textarea) - 1;
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
            this.constructor.setSelectionRange(textarea, termPos, termPos + searchTermLength);
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
                this.constructor.setSelectionRange(textarea, termPos, termPos + searchTermLength);
                if (searchTermLength === undefined) {
                    this.find(lookForNext);
                }
            } else {
                this._showTermNotFoundTooltip();
            }
        }
    };

    findAndReplace() {
        const textarea = this.textarea;
        // collect variables
        var origTxt = textarea.value; // needed for text replacement
        var txt = textarea.value;
        var searchRegex = this.termSearch.value;
        var replaceRegex = this.termReplace.value;

        searchRegex = this.processRegexPattern(searchRegex);

        // find next index of searchterm, starting from current cursor position
        var cursorPos = this.constructor.getCursorPosEnd(textarea);
        const result = txt.regexFindNext(searchRegex, cursorPos);
        var termPos = result.pos;
        var searchTermLength = result.matchLength;
        console.log('TCL: this.findAndReplace -> searchTermLength', searchTermLength);
        console.log('TCL: this.findAndReplace -> termPos', termPos);
        var newText = '';

        var replaceTerm = () => {
            newText = origTxt.replaceFrom(searchRegex, replaceRegex, termPos);
            console.log('TCL: this.findAndReplace -> strReplaceWith', replaceRegex);
            console.log('TCL: this.findAndReplace -> strSearchTerm', searchRegex);
            let replaceTermLength = searchTermLength + (newText.length - origTxt.length);
            console.log('TCL: replaceTerm -> replaceTermLength', replaceTermLength);
            textarea.value = newText;
            this.constructor.setSelectionRange(textarea, termPos, termPos + replaceTermLength);
            this.history.save();
        }

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
                this._showTermNotFoundTooltip();
            }
        }
    };

    replaceAll() {
        const textarea = this.textarea;
        // collect variables
        var txt = textarea.value;
        var strSearchTerm = this.termSearch.value;

        strSearchTerm = this.processRegexPattern(strSearchTerm);

        // find all occurances of search string
        var matches = [];
        var pos = txt.regexIndexOf(strSearchTerm);
        while (pos > -1) {
            matches.push(pos);
            pos = txt.regexIndexOf(strSearchTerm, pos + 1);
        }

        for (var match in matches) {
            this.findAndReplace();
        }
    };

    processRegexPattern(regexStr) {
        let regex = regexStr;
        // escape special characters if search term is NOT a regular expression
        if (this.isRegex === false) {
            regex = RegExp.escape(regexStr);
        }
        // make text lowercase if search is supposed to be case insensitive
        if (this.isCaseSensitive === false) {
            regex = new RegExp(regex, "i");
        } else {
            regex = new RegExp(regex);
        }
        return regex;
    }

    // this.undo changes in textarea
    undo() {
        this.history.undo(this.setContent.bind(this));
    }
    // this.redo changes in textarea
    redo() {
        this.history.redo(this.setContent.bind(this));
    }

    getContent() {
        return this.constructor._copyString(this.textarea.value);
    }

    setContent(newContent) {
        this.textarea.value = newContent;
    }

    /************************* Util methods ***********************/

    static toggleBtnHighlight(e) {
        const hoveredButton = e.target.closest(".btn");
        if (hoveredButton) {
            hoveredButton.classList.toggle("btn-hover");
        }
    }

    static getCursorPosEnd(input) {
        return this.getCursorPos(input).end;
    }

    static getCursorPosStart(input) {
        return this.getCursorPos(input).start;
    }

    // source: https://stackoverflow.com/a/7745998/6798201
    static getCursorPos(input) {
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

    static isSameCursorPosition(posA, posB) {
        return (posA.start === posB.start && posA.end === posB.end);
    }

    // Set selection of text in a textarea
    // and scroll selection into middle of the screen
    // Based on: https://stackoverflow.com/a/53082182/6798201
    static setSelectionRange(textarea, selectionStart, selectionEnd) {
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
    static _copyString(str) {
        return (' ' + str).slice(1)
    }
    // source: https://stackoverflow.com/a/29574724/6798201
    //assuming "b" contains a subsequence containing 
    //all of the letters in "a" in the same order
    static _getDifference(a, b) {
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
}

// export the class for further composition
// browser global
if (typeof window !== 'undefined') {
	window.SmartTextarea = SmartTextarea;
}
export {SmartTextarea};