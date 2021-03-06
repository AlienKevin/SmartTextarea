/*****Both of the below methods are already implemented in Chrome****/
// A jQuery like shorthand for querySelector function
// Source: https://gomakethings.com/making-it-easier-to-select-elements-with-vanilla-javascript/
window.$ = function (selector, scope) {
    scope = scope ? scope : document;
    return scope.querySelector(selector);
}
// A jQuery like shorthand for querySelectorAll function
// Source: https://gomakethings.com/making-it-easier-to-select-elements-with-vanilla-javascript/
window.$$ = function (selector, scope) {
    scope = scope ? scope : document;
    return scope.querySelectorAll(selector);
};

// Toggle hide/show of an element
window.toggleShowHide = function (element, displayStyle = "block", showCallback, hideCallback) {
    console.log('TCL: toggleShowHide -> element.style.display', element.style.display);
    if (getStyle(element, "display") === "none") {
        console.log(`Showing ${element}...`);
        show(element, displayStyle);
        if (typeof showCallback === "function") {
            showCallback();
        }
    } else {
        console.log(`Hiding ${element}...`);
        hide(element);
        if (typeof hideCallback === "function") {
            hideCallback()
        }
    }
}

window.show = function (element, displayStyle = "block") {
    element.style.display = displayStyle;
}

window.hide = function (element) {
    element.style.display = "none";
}

// Get the computed style of an element that is usually defined in CSS stylesheet
// Based on: https://stackoverflow.com/a/16748905/6798201
window.getStyle = function (element, name) {
    return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
}