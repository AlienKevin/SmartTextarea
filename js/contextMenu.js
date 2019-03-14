// Free up the "$" symbol for custom function
jQuery.noConflict();
(function( $ ) {
    $(function() {
        $.contextMenu({
            selector: '#FARTextarea', 
            callback: function(key, options) {
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m); 
            },
            items: {
                "copy": {name: "Copy", icon: "copy"},
                "paste": {name: "Paste", icon: "paste"},
                "cut": {name: "Cut", icon: "cut"},
                "delete": {name: "Delete", icon: "delete"},
                "undo": {name: "Undo", icon: function(){
                    return 'context-menu-icon context-menu-icon-undo';
                }},
            }
        });
    });
  })(jQuery);