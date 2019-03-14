// Free up the "$" symbol for custom function
jQuery.noConflict();
jQuery.contextMenu({
    selector: '#FARTextarea',
    callback: function (key, options) {
        console.log('TCL: options', options);
        console.log('TCL: key', key);
        switch (key) {
            case "undo":
                FAR.undo();
                break;
            case "redo":
                FAR.redo();
                break;
            case "search":
                FAR.findNext();
        }
    },
    items: {
        "undo": {
            name: "Undo",
            icon: () => "icon-undo"
        },
        "redo": {
            name: "Redo",
            icon: () => "icon-redo"
        },
        "search": {
            name: "Search",
            icon: () => "icon-search"
        },
    }
});

// Insert text at current cursor position in a textarea
// Source: https://stackoverflow.com/a/11077016/6798201
function insertAtCursor(myField, myValue) {
    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos) +
            myValue +
            myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
    }
}