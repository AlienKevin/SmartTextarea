import "./SmartTextareaBase.js"
import "./ContextMenuMixin.js"

// Initialize smartTextarea
window.SmartTextarea = class SmartTextarea extends ContextMenuMixin(SmartTextareaBase){

}
// const smartTextarea1 = new SmartTextarea(document.getElementById("textarea1"));
// const smartTextarea2 = new SmartTextarea(document.getElementById("textarea2"));