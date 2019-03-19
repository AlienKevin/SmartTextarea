import {SmartTextareaBase} from "./SmartTextareaBase.js"
import {ContextMenuMixin} from "./ContextMenuMixin.js"

// Initialize smartTextarea
class SmartTextarea extends ContextMenuMixin(SmartTextareaBase){

}
const smartTextarea = new SmartTextarea(document.getElementById("FARTextarea"));
