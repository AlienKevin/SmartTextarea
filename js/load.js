(function(){fallback.load({

    simpleUndo: "lib/simpleUndo/simpleUndo.js",

    popperJs: [
        "//unpkg.com/popper.js@1/dist/umd/popper.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",
    ],

    jQuery: [
        '//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
        'lib/jQuery/jquery.min.js',
    ],

    'jQuery.ui': [
        '//cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.ui.position.min.js',
        '//cdn.jsdelivr.net/npm/jquery-contextmenu@2.7.1/dist/jquery.ui.position.min.js',
        'lib/jQueryUI/jquery.ui.position.min.js',
    ],
    jQueryContextMenu: [
        '//cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.js',
        '//cdn.jsdelivr.net/npm/jquery-contextmenu@2.7.1/dist/jquery.contextMenu.min.js',
        'lib/jQueryContextMenu/jquery.contextMenu.min.js'
    ],
}, {
    shim: {
        'jQuery.ui': ['jQuery'],
        'jQueryContextMenu': ['jQuery'],
    },
});
fallback.ready(function() {
    dynamicallyLoadScript("https://unpkg.com/tippy.js@4").then(
    () => dynamicallyLoadScript("js/script.js")).then(
    () => dynamicallyLoadScript("js/contextMenu.js"));
});

function dynamicallyLoadScript(url) {
    return new Promise(function(resolve, reject) {
    var script = document.createElement("script"); // create a script DOM node
    script.src = url; // set its src to the provided URL
    script.onload = () => {resolve(script); console.log(`${url} loaded!`)};
    script.onerror = () => reject(new Error(`Error when loading ${url}!`));
    document.body.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
});
}
})();