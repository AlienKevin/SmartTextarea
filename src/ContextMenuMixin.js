import './utils.js'
import jQuery from "jquery";
import 'jquery-contextmenu/dist/jquery.contextMenu.min';
import '../node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.css';

const ContextMenuMixin = superclass => class extends superclass {
    constructor(...args) {
        super(...args);
        const that = this;
        // Free up the "$" symbol for custom function
        jQuery.noConflict();
        jQuery.contextMenu({
            selector: ".smartTextarea textarea",
            callback: function (key, options) {
                console.log('TCL: options', options);
                console.log('TCL: key', key);
                switch (key) {
                    case "undo":
                        that.undo();
                        break;
                    case "redo":
                        that.redo();
                        break;
                    case "search":
                        const selectedText = window.getSelection().toString();
                        toggleShowHide(that.FARPanel, "table");
                        if (selectedText !== "") {
                            that.termSearch.value = selectedText;
                            that.findNext(selectedText);
                            that.findMode = true;
                        } else {
                            that.termSearch.focus();
                        }
                        break;
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
    }
}

export {ContextMenuMixin};