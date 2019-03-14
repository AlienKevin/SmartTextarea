// Free up the "$" symbol for custom function
jQuery.noConflict();
(function( $ ) {
    $(function() {
        $.contextMenu({
            selector: '#FARTextarea', 
            callback: function(key, options) {
				console.log('TCL: options', options);
				console.log('TCL: key', key);
                switch (key){
                    case "copy":
                        document.execCommand("copy");
                        break;
                }
            },
            items: {
                "copy": {name: "Copy", icon: () => "icon-copy"},
                "paste": {name: "Paste", icon: () => "icon-paste"},
                "cut": {name: "Cut", icon: () => "icon-cut"},
                "delete": {name: "Delete", icon: () => "icon-delete"},
                "undo": {name: "Undo", icon: () => "icon-undo"},
            }
        });
    });
  })(jQuery);