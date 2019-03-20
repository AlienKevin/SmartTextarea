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
                        that.search();
                        break;
                }
            },
            items: {
                "undo": {
                    name: `Undo   <span style="float: right">Ctrl+Z</span>`,
                    isHtmlName: true,
                    icon: () => "icon-undo"
                },
                "redo": {
                    name: `Redo   <span style="float: right">Ctrl+Y</span>`,
                    isHtmlName: true,
                    icon: () => "icon-redo"
                },
                "search": {
                    name: `Search <span style="float: right">Ctrl+F</span>`,
                    isHtmlName: true,
                    icon: () => "icon-search"
                },
            }
        });
    }
}

// export
// browser global
if (typeof window != 'undefined') {
	window.ContextMenuMixin = ContextMenuMixin;
}
export {ContextMenuMixin};