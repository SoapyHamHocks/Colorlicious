'use strict';
const Cc = Components.classes, Ci = Components.interfaces;

var prefBranch = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.colorlicious.').QueryInterface(Ci.nsIPrefBranch2);
var watcher = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
var uxChannel = false;
var hostOS;

var macButtonsCSS = "#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) :-moz-any(.toolbarbutton-1, .toolbarbutton-menubutton-button, .toolbarbutton-menubutton-dropmarker)\
					{\
						-moz-appearance: none !important;\
					    padding: 0 3px !important;\
					    border: 1px solid rgba(0, 0, 0, .4) !important;\
					    border-radius: 4px !important;\
					    background-color: transparent !important;\
					    background-image: linear-gradient(hsla(0, 05%, 100%, .7), hsla(0, 0%, 100%, .3), hsla(0, 0%, 100%, 0)) !important;\
					    box-shadow: 0 1px 0 hsla(0, 0%, 100%, .3) inset,\
					                0 0 0 1px hsla(0, 0%, 100%, .05) inset,\
					                0 1px 0 hsla(0, 0%, 100%, .28) !important;\
						background-origin: border-box !important;\
						background-clip: border-box !important;\
						opacity: 1 !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) :-moz-any(.toolbarbutton-1, .toolbarbutton-menubutton-button, .toolbarbutton-menubutton-dropmarker):-moz-window-inactive\
					{\
					    border-color: rgba(0, 0, 0, .22) !important;\
					    background-image: linear-gradient(hsla(0, 0%, 100%, .16), hsla(0, 0%, 100%, .06), hsla(0, 0%, 100%, 0)) !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-dropmarker[disabled=true] > .dropmarker-icon,\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1[type=menu-button]:not(:hover):-moz-window-inactive .dropmarker-icon\
					{\
						opacity: .5 !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) :-moz-any(.toolbarbutton-1, .toolbarbutton-menubutton-button):-moz-any(:not([disabled]):hover:active, [open], [checked]),\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1:not([buttondown=true])[open] > .toolbarbutton-menubutton-dropmarker\
					{\
					    background-image: linear-gradient(hsla(0, 0%, 100%, .1), hsla(0, 0%, 100%, .4)) !important;\
					    box-shadow: 0 1px 3px hsla(0, 0%, 0%, .3) inset,\
					                0 1px 0 hsla(0, 0%, 100%, .28) !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) :-moz-any(.toolbarbutton-1, .toolbarbutton-menubutton-button)[checked]\
					{\
					    background-image: linear-gradient(hsla(0, 0%, 100%, .1), hsla(0, 0%, 100%, .4)),\
					    				  linear-gradient(rgba(0, 0, 0, .5), rgba(0, 0, 0, .5)) !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1[type=menu-button]\
					{\
						background: none !important;\
						border: none !important;\
						box-shadow: none !important;\
						padding: 0 1px !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=large] > #nav-bar #back-button\
					{\
					    border-radius: 999px !important;\
					    width: 30px !important;\
					    min-height: 30px !important;\
					    max-height: 30px !important;\
					    margin-bottom: 0 !important;\
					    -moz-padding-start: 3px !important;\
					    -moz-padding-end: 5px !important;\
					}\
					window:not([chromehidden~=toolbar]) #navigator-toolbox[iconsize=large][mode=icons] > :-moz-any(#nav-bar[currentset*='unified-back-forward-button,urlbar-container'], #nav-bar:not([currentset])) > #unified-back-forward-button > #forward-button\
					{\
					    border-radius: 0 !important;\
					    -moz-padding-start: 3px !important;\
					    -moz-padding-end: 1px !important;\
					}\
					window:not([chromehidden~=toolbar]) #navigator-toolbox[iconsize=large][mode=icons] > :-moz-any(#nav-bar[currentset*='unified-back-forward-button,urlbar-container'], #nav-bar:not([currentset])) > #unified-back-forward-button > #forward-button[disabled=true]\
					{\
						background-clip: padding-box !important;\
					    border-color: transparent !important;\
					    box-shadow: none !important;\
					}\
					window:not([chromehidden~=toolbar]) #navigator-toolbox[iconsize=large][mode=icons] > :-moz-any(#nav-bar[currentset*='unified-back-forward-button,urlbar-container'], #nav-bar:not([currentset])) > #unified-back-forward-button:hover > #forward-button[disabled=true]\
					{\
					    transition-property: border-color, background-clip !important;\
					    transition-delay: 99999999s !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #back-button\
					{\
					    -moz-border-end-width: 0 !important;\
					    border-radius: 4px 0 0 4px !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #back-button:-moz-any(:not([disabled]):hover:active, [open])\
					{\
					    -moz-border-end-width: 1px !important;\
					    min-width: 29px !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #forward-button\
					{\
					    -moz-border-start-width: 0 !important;\
					    border-radius: 0 4px 4px 0 !important;\
					    background-image: linear-gradient(to top, hsla(0, 0%, 100%, .14) 1px, rgba(0, 0, 0, .21) 1px, rgba(0, 0, 0, .21)),\
					                      linear-gradient(hsla(0, 05%, 100%, .7), hsla(0, 0%, 100%, .3), hsla(0, 0%, 100%, 0)) !important;\
					    background-size: 1px calc(100% - 3px), auto !important;\
					    background-repeat: no-repeat, repeat !important;\
					    background-position: 0 2px, center !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #back-button:-moz-any(:hover:active:not([disabled=true]), [open]) + #forward-button\
					{\
					    background-image: linear-gradient(hsla(0, 05%, 100%, .7), hsla(0, 0%, 100%, .3), hsla(0, 0%, 100%, 0)) !important;\
					    background-size: auto !important;\
					    background-repeat: repeat !important;\
					    background-position: center !important;\
					    min-width: 27px !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #back-button + #forward-button:-moz-window-inactive\
					{\
					    background-image: linear-gradient(to top, hsla(0, 0%, 100%, .14) 1px, rgba(0, 0, 0, .21) 1px, rgba(0, 0, 0, .21)),\
					                      linear-gradient(hsla(0, 0%, 100%, .16), hsla(0, 0%, 100%, .06), hsla(0, 0%, 100%, 0)) !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #back-button + #forward-button:-moz-any(:not([disabled]):hover:active, [open])\
					{\
					    background-image: linear-gradient(hsla(0, 0%, 100%, .1), hsla(0, 0%, 100%, .4)) !important;\
					    -moz-border-start-width: 1px !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #back-button:-moz-locale-dir(rtl)\
					{\
					    border-radius: 0 4px 4px 0 !important;\
					}\
					#navigator-toolbox[mode=icons][iconsize=small] > #nav-bar #forward-button:-moz-locale-dir(rtl)\
					{\
					    border-radius: 4px 0 0 4px !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-button,\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-dropmarker:-moz-locale-dir(rtl)\
					{\
					    border-radius: 4px 0 0 4px !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-button:-moz-locale-dir(rtl),\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-dropmarker\
					{\
					    border-radius: 0 4px 4px 0 !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-button\
					{\
					    background-image: linear-gradient(to top, hsla(0, 0%, 100%, .14) 1px, rgba(0, 0, 0, .21) 1px, rgba(0, 0, 0, .21)),\
						                  linear-gradient(hsla(0, 05%, 100%, .7), hsla(0, 0%, 100%, .3), hsla(0, 0%, 100%, 0)) !important;\
						background-size: 1px calc(100% - 3px), auto !important;\
						background-repeat: no-repeat, repeat !important;\
						background-position: 100% 2px, center !important;\
						-moz-border-end-width: 0 !important;\
						padding: 0 5px 0 !important;\
						-moz-padding-start: 3px !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-button:-moz-window-inactive\
					{\
					    background-image: linear-gradient(to top, hsla(0, 0%, 100%, .14) 1px, rgba(0, 0, 0, .21) 1px, rgba(0, 0, 0, .21)),\
						                  linear-gradient(hsla(0, 0%, 100%, .16), hsla(0, 0%, 100%, .06), hsla(0, 0%, 100%, 0)) !important;\
						background-size: 1px calc(100% - 3px), auto !important;\
						background-repeat: no-repeat, repeat !important;\
						background-position: 100% 2px, center !important;\
						-moz-border-end-width: 0 !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1[buttondown=true] > .toolbarbutton-menubutton-button\
					{\
					    background-image: linear-gradient(hsla(0, 0%, 100%, .1), hsla(0, 0%, 100%, .4)) !important;\
						background-size: auto !important;\
						background-repeat: repeat !important;\
						background-position: center !important;\
						-moz-border-end-width: 1px !important;\
						-moz-padding-end: 4px !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1[open] > .toolbarbutton-menubutton-button\
					{\
					    background-image: linear-gradient(hsla(0, 05%, 100%, .7), hsla(0, 0%, 100%, .3), hsla(0, 0%, 100%, 0)) !important;\
						background-size: auto !important;\
						background-repeat: repeat !important;\
						background-position: center !important;\
					    -moz-border-end-width: 1px !important;\
					    -moz-padding-end: 4px !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-dropmarker\
					{\
						-moz-border-start-width: 0 !important;\
						padding: 1px 7px !important;\
					}\
					#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-menubutton-dropmarker > .dropmarker-icon\
					{\
						margin-top: 2px !important;\
					}";

function install(data, reason) {}
function uninstall(data, reason) {}

var sheetService =
{
	namespace: '@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");@-moz-document url("chrome://browser/content/browser.xul") {',
	ssService: Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService),
	ioService: Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService),
	sstoreService: Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore),
	enable: function(sheet,ref)
	{
		var ssService = this.ssService;
		
		if (!ssService.sheetRegistered(sheet, ssService.USER_SHEET))
			ssService.loadAndRegisterSheet(sheet, ssService.USER_SHEET);
	},
	
	disable: function(sheet)
	{
		var ssService = this.ssService;
		if (ssService.sheetRegistered(sheet, ssService.USER_SHEET))
		  ssService.unregisterSheet(sheet, ssService.USER_SHEET);
	},
	
	load: function(url,base)
	{
		var url = this.ioService.newURI(this.getEmbedCSSURL(url),null,base);
		this.enable(url);
		return url;
	},
	
	getEmbedCSSURL: function(css)
	{
		return 'data:text/css;charset=utf-8,' + encodeURIComponent(this.namespace + css + '}');
	}
};

const _utils =
{
	HSLA: function(H,S,L,A)
	{
		return 'hsla(' + H + ', ' + S + '%, ' + L + '%, ' + A / 100 +')';
	},
	
	hue2rgb: function(p, q, t)
	{
		if (t < 0)
			t += 1;
		if (t > 1)
			t -= 1;
		if (t < 1/6)
			return p + (q - p) * 6 * t;
		if (t < 1/2)
			return q;
		if (t < 2/3)
			return p + (q - p) * (2/3 - t) * 6;
		return p;
	},
	
	hslToRgb: function(h, s, l)
	{
	    var r, g, b;
	    var h = h / 360;
	    var s = s / 100;
	    var l = l /100;
	    
	    if(s == 0)
	    {
	      r = g = b = l;
	    }
	    else
	    {
	    	var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = this.hue2rgb(p, q, h + 1/3);
			g = this.hue2rgb(p, q, h);
			b = this.hue2rgb(p, q, h - 1/3);
		}
	    return [r * 255, g * 255, b * 255];
	},
	
	colorBrightness: function(H,S,L)
	{
		var rgb = this.hslToRgb(H,S,L);
		return Math.round((Math.sqrt(rgb[0] * rgb[0] * .241 + rgb[1] * rgb[1] * .691 + rgb[2] * rgb[2] * .068) / 255) * 100);
	}
}

const appmenu =
{
	_ref: null,
	change: function(newval)
	{
		if (newval)
		{
			var values = JSON.parse(newval);
			var H = values.h;
			var S = values.s;
			var L = values.l;
			var A = values.a;
			var CSS = 
				"#main-window:not([privatebrowsingmode]) #appmenu-button\
				{\
					-moz-border-left-colors: rgba(255,255,255,.6) rgba(0,0,0,.66) !important;\
					-moz-border-bottom-colors: rgba(255,255,255,.6) rgba(0,0,0,.66) !important;\
					-moz-border-right-colors: rgba(255,255,255,.6) rgba(0,0,0,.66) !important;\
					background-color: transparent !important;\
					background-image: linear-gradient(hsla("+ (H + 5) + ", " + (S * .9) + "%, " + (L * 1.28) + "%, " + (A / 100) +"), hsla(" + (H - 5) + ", " + (S * .91) + "%, " + (L * .88) + "%, " + (A / 100) + ") 95%)!important;\
				}\
				#main-window:not([privatebrowsingmode]) #appmenu-button:not([open]):hover\
				{\
					background-image: radial-gradient(farthest-side at center bottom, hsla(" + (H + 25) + ", " + (S * .96) + "%, " + (L * 1.34) + "%, .5) 10%, hsla(" + (H + 25) + ", " + (S * .96) + "%, " + (L * .67) +"%, 0) 70%)," + "radial-gradient(farthest-side at center bottom, hsla(" + (H + 3) + ", " + S + "%, " + (L * .92) + "%, 1), hsla(" + (H + 10) + ", " + S + "%, " + (L * 1.68) + "%, 0)), linear-gradient(hsla(" + (H + 3) + ", " + (S * .91) + "%, " + (L * 1.24) + "%, " + (A / 100) + "), hsla(" + (H - 10) + ", " + S + "%, " + (L * .82) + "%, " + (A / 100) + ") 95%) !important;\
					box-shadow: 0 1px hsla(0,0%,100%,.1) inset, 0 0 1.5px 1px hsla(" + (H+17) +","+ (S*.89) + "%," + (L*2*.82) + "%,.7)inset,0 -1px 0 hsla(" + (H+17) +","+(S*.89) +"%," + (L*2*.82) +"%,.5) inset!important;\
				}"
			
			if(_utils.colorBrightness(H,S,L) >= 50)
			{
				CSS +=
					"#main-window:not([privatebrowsingmode]) #appmenu-button\
					{\
						color: rgba(0, 0, 0, .8) !important;\
						text-shadow: 0 0 1px hsla(0, 0%, 100%, .7),\
									 0 1px 1.5px hsla(0, 0%, 100%, .5) !important;\
					}\
					#main-window:not([privatebrowsingmode]) #appmenu-button > .button-box > .button-menu-dropmarker\
					{\
						list-style-image: url(chrome://colorlicious/skin/overlay/appmenu-dropmarker.png) !important;\
					}\
					#main-window:not([privatebrowsingmode]) #appmenu-button > .button-box > .button-text\
					{\
						opacity: .9999 !important;\
					}";
			}
			
			this._ref = newval ? sheetService.load(CSS, null) : null;
		}
	},
};

const button =
{
	_ref: null,
	
	change: function(newval)
	{
		if (!newval)
			return;
		
		var values = JSON.parse(newval);
		
		if (!values)
			return;
		
		var H = values.h;
		var S = values.s;
		var L = values.l;
		var A = values.a;
		var _colorNormal = _utils.HSLA(H, S, L, A);
		var _colorOpaque = _utils.HSLA(H, S, L, 100);
		
		var CSS = "";
		
		switch (hostOS)
		{
			case 'WINNT':
				CSS +=
					"#navigator-toolbox[iconsize=large][mode=icons] > :-moz-any(#nav-bar[currentset*='unified-back-forward-button,urlbar-container'],#nav-bar:not([currentset])) > #unified-back-forward-button > #back-button .toolbarbutton-icon,\
					 #navigator-toolbox[iconsize=large][mode=icons] > #nav-bar .toolbarbutton-1[type=menu-button]:not([buttonover]):-moz-any(:hover, [open]) > .toolbarbutton-menubutton-button > .toolbarbutton-icon,\
					 #navigator-toolbox[iconsize=large][mode=icons] > #nav-bar .toolbarbutton-1[type=menu-button][buttonover] > .toolbarbutton-menubutton-dropmarker > .dropmarker-icon\
					 {\
					 	 background-color: " + _utils.HSLA(H, S, L, A * .75) + " !important;\
					 }\
					 #navigator-toolbox[iconsize=large][mode=icons] > #nav-bar .toolbarbutton-1:not([buttonover]):hover > .toolbarbutton-menubutton-dropmarker > .dropmarker-icon,\
					 #navigator-toolbox[iconsize=large][mode=icons] > #nav-bar :-moz-any(.toolbarbutton-1, .toolbarbutton-menubutton-button):not([disabled]):not([checked]):not([open]):not(:active):hover > .toolbarbutton-icon\
					 {\
					 	 background-color: " + _utils.HSLA(H, S, L, A) + " !important;\
					 }\
					 #navigator-toolbox[iconsize=large][mode=icons] > #nav-bar .toolbarbutton-1:not([buttondown])[open] > .toolbarbutton-menubutton-dropmarker > .dropmarker-icon,\
					 #navigator-toolbox[iconsize=large][mode=icons] > #nav-bar :-moz-any(.toolbarbutton-1, .toolbarbutton-menubutton-button):not([disabled]):-moz-any([checked], [open], :hover:active) > .toolbarbutton-icon\
					 {\
					 	 background-color: " + _utils.HSLA(H, S, L - 10, A) + " !important;\
					 }";
				break;
			case 'Darwin':
				CSS += macButtonsCSS;
				CSS +=
					"#navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1:not([type=menu-button]),\
					 #navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1[type=menu-button] > .toolbarbutton-menubutton-button,\
					 #navigator-toolbox[mode=icons] > toolbar:not(#TabsToolbar) .toolbarbutton-1[type=menu-button] > .toolbarbutton-menubutton-dropmarker\
					 {\
						 background-color: " + _colorNormal + " !important;\
					 }";
				break;
		}
		
		this._ref = newval ? sheetService.load(CSS, null) : null;
	},
};

const tab =
{
	_ref: null,
	
	change: function(newval)
	{
		if (!newval)
			return;
		
		var values = JSON.parse(newval);
		
		if (!values)
			return;
		
		var H = values.h;
		var S = values.s;
		var L = values.l;
		var A = values.a;
		var _color = _utils.HSLA(H, S, L, A);
		
		var CSS = "";
		
		if(_utils.colorBrightness(H, S, L) >= 50)
		{
			CSS +=
				".tabbrowser-tab:not([selected=true])\
				{\
					color: #000 !important;\
					text-shadow: 0 1px 0 hsla(0, 0%, 100%, .5) !important;\
				}";
		}
		else
		{
			CSS +=
				".tabbrowser-tab:not([selected=true])\
				{\
					color: #FFF !important;\
					text-shadow: 0 1px 0 rgba(0, 0, 0, .5) !important;\
				}";
		}
		
		switch (hostOS)
		{
			case 'WINNT':
			
				CSS +=
					".tabbrowser-tab:not([selected=true])\
					{\
						text-shadow: none !important;\
					}";
				
				 if (uxChannel)
				 {
				 }
				 else
				 {
					CSS +=
						".tabbrowser-tab:not(:-moz-any([selected], [pinned][titlechanged], :-moz-lwtheme)),\
						 .tabs-newtab-button:not(:-moz-lwtheme) {\
						  background-image: linear-gradient(to top, rgba(10%,10%,10%,.4) 1px, transparent 1px),\
											linear-gradient(transparent, hsla(0,0%,45%,.1) 1px, hsla(0,0%,32%,.2) 80%, hsla(0,0%,0%,.2)),\
											linear-gradient(" + _color + "," + _color + ")!important;\
						}\
						.tabbrowser-tab:not(:-moz-any([selected], [pinned][titlechanged], :-moz-lwtheme)):hover,\
						.tabs-newtab-button:not(:-moz-lwtheme):hover {\
						  background-image: linear-gradient(to top, rgba(10%,10%,10%,.4) 1px, transparent 1px),\
											linear-gradient(hsla(0,0%,100%,.3) 1px, hsla(0,0%,75%,.2) 80%, hsla(0,0%,60%,.2)),\
											linear-gradient(" + _color + "," + _color + ")!important;\
						}";
					if (_utils.colorBrightness(H,S,L) <= 50)
					CSS +=
						'.tabbrowser-tab:not([selected]):not(:-moz-lwtheme) .tab-text {\
						color: white !important;\
						text-shadow: none !important;\
					}';
				}
				break;
			
			case 'Darwin':
				CSS +=
					'.tab-background-start:not([selected])\
					{\
					    clip-path: url(chrome://colorlicious/skin/overlay/tab.svg#osx-tab-ontop-left-curve-clip-path) !important;\
					}\
					.tab-background-end:not([selected])\
					{\
					    clip-path: url(chrome://colorlicious/skin/overlay/tab.svg#osx-tab-ontop-right-curve-clip-path) !important;\
					}\
					.tab-background-start:not([selected]),\
					.tab-background-middle:not([selected]),\
					.tab-background-end:not([selected]),\
					#TabsToolbar[tabsontop=false]\
					{\
					    background-color: ' + _color + ' !important;\
					}\
					#TabsToolbar[tabsontop=true] .tab-background:not([selected])\
					{\
						margin-top: 2px !important;\
					}\
					#TabsToolbar[tabsontop=false] .tab-background:not([selected])\
					{\
						margin-bottom: 2px !important;\
						transform: scaleY(-1) !important;\
					}\
					.tabs-newtab-button::before,\
					.tabs-newtab-button::after\
					{\
					    content: "" !important;\
					    display: inherit !important;\
					    width: 12px !important;\
					    margin-top: 2px !important;\
					    margin-bottom: 2px !important;\
					    position: relative !important;\
					    background: ' + _color + ' !important;\
					}\
					#TabsToolbar[tabsontop=false] .tabs-newtab-button::before,\
					#TabsToolbar[tabsontop=false] .tabs-newtab-button::after\
					{\
						transform: scaleY(-1) !important;\
					}\
					.tabs-newtab-button::before\
					{\
					    clip-path: url(chrome://colorlicious/skin/overlay/tab.svg#osx-tab-ontop-left-curve-clip-path) !important;\
					    -moz-margin-start: -5px !important;\
					    -moz-margin-end: -7px !important;\
					}\
					.tabs-newtab-button::after\
					{\
					    clip-path: url(chrome://colorlicious/skin/overlay/tab.svg#osx-tab-ontop-right-curve-clip-path) !important;\
					    -moz-margin-start: -8px !important;\
					    -moz-margin-end: -4px !important;\
					}\
					.tabs-newtab-button\
					{\
					    background-image: linear-gradient(' + _color + ', ' + _color + ') !important;\
					    background-position: 7px 2px !important;\
					    background-repeat: no-repeat !important;\
					    background-size: calc(100% - 15px) calc(100% - 4px) !important;\
					}\
					.tabs-newtab-button > .toolbarbutton-icon\
					{\
					    position: relative !important;\
					    z-index: 1 !important;\
					}\
					.tabbrowser-tab[selected]\
					{\
						position: relative !important;\
						z-index: 999 !important;\
					}';
				break;
			
			case 'Linux':
				 if (uxChannel)
				 {
				 }
				 else
				 {
					CSS +=
						".tabbrowser-tab:not(:-moz-any([selected], [pinned][titlechanged], :-moz-lwtheme)),\
						.tabs-newtab-button:not(:-moz-lwtheme)\
						{\
							background-image: linear-gradient(hsla(0, 0%, 100%, .2), hsla(0, 0%, 45%, .2) 2px, hsla(0, 0%, 32%, .2) 80%),\
											  linear-gradient(" + _color + ", " + _color + ") !important;\
						}\
						.tabbrowser-tab:not(:-moz-any([selected], [pinned][titlechanged], :-moz-lwtheme)):hover,\
						.tabs-newtab-button:not(:-moz-lwtheme):hover\
						{\
							background-image: linear-gradient(hsla(0, 0%, 100%, .6), hsla(0, 0%, 100%, .2) 4px, hsla(0, 0%, 75%, .2) 80%),\
											  linear-gradient(" + _color + ", " + _color + ") !important;\
						}";
				}
				
				if (_utils.colorBrightness(H,S,L) <= 50)
					CSS +=
						'.tabbrowser-tab:not([selected]):not(:-moz-lwtheme) .tab-text\
						{\
							color: #fff !important;\
						}';
				else
					CSS +=
						'.tabbrowser-tab:not([selected]):not(:-moz-lwtheme) .tab-text\
						{\
							color: #000 !important;\
						}';
				break;
				
		}
		this._ref = newval ? sheetService.load(CSS, null) : null;
	},
};


const selectedtab =
{
	_ref: null,
	
	change: function(newval)
	{
		if (!newval)
			return;
		
		var values = JSON.parse(newval);
		
		if (!values)
			return;
		
		var H = values.h;
		var S = values.s;
		var L = values.l;
		var A = values.a;
		var _color = _utils.HSLA(H, S, L, 100);
		
		var CSS =
			"#navigator-toolbox .toolbarbutton-text[disabled=true],\
			#addon-bar .toolbarbutton-text[disabled=true]\
			{\
				opacity: .5 !important;\
			}";
		
		if(_utils.colorBrightness(H,S,L) >= 50)
		{
			if(hostOS == "Darwin")
			{
				CSS +=
					"#navigator-toolbox toolbarbutton:not(:-moz-any(.bookmark-item:not([disabled=true]):hover, .bookmark-item[open])) .toolbarbutton-text,\
					#addon-bar .toolbarbutton-text\
					{\
						color: #000 !important;\
						text-shadow: 0 1px 0 hsla(0, 0%, 100%, .5) !important;\
					}";
			}
			else
			{
				CSS +=
					"#navigator-toolbox .toolbarbutton-text,\
					#addon-bar .toolbarbutton-text\
					{\
						color: #000 !important;\
						text-shadow: 0 1px 0 hsla(0, 0%, 100%, .5) !important;\
					}";
			}
			
		}
		else
		{
			CSS +=
				"#navigator-toolbox .toolbarbutton-text,\
				#addon-bar .toolbarbutton-text\
				{\
					color: #FFF !important;\
					text-shadow: 0 1px 0 rgba(0, 0, 0, .5) !important;\
				}";
		}
		
		switch (hostOS)
		{
			case 'WINNT':
				 if (uxChannel)
				 {
					CSS +=
						".tab-background-middle[selected=true]:not(:-moz-lwtheme),\
						 .tab-background-start[selected=true]:not(:-moz-lwtheme)::before,\
						 .tab-background-end[selected=true]:not(:-moz-lwtheme)::before\
						 {\
							 background-image: url(chrome://browser/skin/tabbrowser/tab-active-middle.png),\
								  			   linear-gradient(transparent, transparent 2px, rgba(254, 254, 254, .72) 2px, rgba(254, 254, 254, .72) 2px, rgba(250, 250, 250, .88) 3px, rgba(250, 250, 250, .88) 3px, rgba(254, 254, 254, .72) 4px, rgba(254, 254, 254, .72) 4px, rgba(253, 253, 253, .45)),\
								  			   linear-gradient(transparent, transparent 2px, hsl(210, 75%, 92%) 2px, " +  _color + ") !important;\
						 }\
						 #nav-bar,\
						 #nav-bar[collapsed=true] + toolbar,\
						 #PersonalToolbar\
						 {\
							 background-color:" + _color + " !important;\
						 }";
				 }
				 else
				 {
					  CSS +=
						"#main-window:not([disablechrome]) .tabbrowser-tab[selected]:not(:-moz-lwtheme)\
						{\
							background-image: -moz-linear-gradient(white, hsla(0, 0%, 100%, .5) 50%),\
											  -moz-linear-gradient(" + _color + ", " + _color + ") !important;\
						}\
						#main-window:not([disablechrome])[tabsontop=false] .tabbrowser-tab[selected]:not(:-moz-lwtheme)\
						{\
							background-image: -moz-linear-gradient(bottom, rgba(10%, 10% ,10% , .4) 1px, transparent 1px),\
											  -moz-linear-gradient(white, hsla(0, 0%, 100%, .5) 50%),\
											  -moz-linear-gradient(" + _color + ", " + _color + ") !important;\
						}\
						#navigator-toolbox[tabsontop=true] > toolbar:not(#toolbar-menubar):not(#TabsToolbar):not(:-moz-lwtheme),\
						#browser-bottombox:not(:-moz-lwtheme)\
						{\
						  background-color:" + _color + "!important;\
						}";
				}
				CSS +=
					"#main-window:not([disablechrome]) #navigator-toolbox:not(:-moz-lwtheme)::after\
					{\
						background-clip: padding-box !important;\
						background-color: transparent !important;\
						background-image: linear-gradient(rgba(0, 0, 0, .25), rgba(0, 0, 0, .25)), linear-gradient(" +  _color +  ", " + _color + ") !important;\
					}";
				break;
			
			case 'Darwin':
				CSS += macButtonsCSS;
				CSS +=
					".tab-background-start[selected]\
					{\
						clip-path: url(chrome://colorlicious/skin/overlay/tab.svg#osx-tab-ontop-left-curve-clip-path) !important;\
						height: 22px;\
					}\
					.tab-background-end[selected]\
					{\
						clip-path: url(chrome://colorlicious/skin/overlay/tab.svg#osx-tab-ontop-right-curve-clip-path) !important;\
						height: 22px !important;\
					}\
					#TabsToolbar[tabsontop=true] .tab-background[selected]\
					{\
						margin-top: 2px !important;\
					}\
					#TabsToolbar[tabsontop=false] .tab-background[selected]\
					{\
						margin-bottom: 2px !important;\
						transform: scaleY(-1) !important;\
					}\
					.tab-background-start[selected],\
					.tab-background-middle[selected],\
					.tab-background-end[selected],\
					#navigator-toolbox > toolbar:not(#TabsToolbar),\
					#addon-bar\
					{\
						-moz-appearance: none !important;\
						background-color:" + _color + "!important;\
					}\
					#addon-bar\
					{\
						background-image: linear-gradient(hsla(0, 0%, 100%, .23), hsla(0, 0%, 100%, 0)) !important;\
						border-top: 1px solid rgba(0, 0, 0, .25) !important;\
						box-shadow: 0 1px 0 hsla(0, 0%, 100%, .35) inset !important;\
					}\
					#TabsToolbar[tabsontop=true]\
					{\
						background-image: url(chrome://browser/skin/tabbrowser/tabbar-top-bg-active.png),\
										  linear-gradient(to top, " + _color + " 2px, transparent 2px) !important;\
					}\
					#TabsToolbar[tabsontop=true]:-moz-window-inactive\
					{\
						background-image: url(chrome://browser/skin/tabbrowser/tabbar-top-bg-inactive.png),\
										  linear-gradient(to top, " + _color + " 2px, transparent 2px) !important;\
					}\
					#TabsToolbar[tabsontop=false]\
					{\
						background-image: url(chrome://browser/skin/tabbrowser/tabbar-bottom-bg-active.png),\
										  linear-gradient(to bottom, " + _color + " 2px, transparent 2px) !important;\
					}\
					#TabsToolbar[tabsontop=false]:-moz-window-inactive\
					{\
						background-image: url(chrome://browser/skin/tabbrowser/tabbar-bottom-bg-inactive.png),\
										  linear-gradient(to bottom, " + _color + " 2px, transparent 2px) !important;\
					}";
					break;
			case 'Linux':
				 if (uxChannel)
				 {
				 }
				 else
				 {
					  CSS +=
						"#main-window:not([disablechrome]) .tabbrowser-tab[selected]:not(:-moz-lwtheme)\
						{\
							background-image: linear-gradient(hsla(0, 0%, 100%, .8) 1px, hsla(0, 0%, 100%, .5) 3px, hsla(0, 0%, 100%, .3) 32%),\
											linear-gradient(" + _color + ", " + _color + ") !important;\
						}\
						#navigator-toolbox[tabsontop=true] > toolbar:not(#toolbar-menubar):not(#TabsToolbar):not(:-moz-lwtheme),\
						#browser-bottombox:not(:-moz-lwtheme)\
						{\
							background-color:" + _color + " !important;\
						}\
					  ";
				}
				
				if (_utils.colorBrightness(H,S,L) <= 50)
					CSS +=
						'#main-window:not([disablechrome]) .tabbrowser-tab[selected]:not(:-moz-lwtheme) .tab-text\
						{\
							color: white !important;\
						}';
				break;
				
		}
		
		this._ref = newval ? sheetService.load(CSS, null) : null;
	},
};

var Prefs =
{
	_prefs:
	{
		'button':
		{
			binding: button
		},
		'tab':
		{
			binding: tab
		},
		'selectedtab':
		{
			binding: selectedtab
		},
		'appmenu':
		{
			binding: appmenu
		}
	},
	
	getPrefValue: function(key)
	{
		switch (prefBranch.getPrefType(key))
		{
			case prefBranch.PREF_INT:
				return prefBranch.getIntPref(key);
			case prefBranch.PREF_BOOL:
				return prefBranch.getBoolPref(key);
			case prefBranch.PREF_STRING:
				return prefBranch.getCharPref(key);
		}
		
		return null;
	},
	
	onPrefChange:
	{
		observe: function(subject, topic, key)
		{
			if (!(key in Prefs._prefs))
				return;
			
			var pref = Prefs._prefs[key];
			var val = Prefs.getPrefValue(key);
			
			if (pref.binding._ref)
				sheetService.disable(pref.binding._ref);
			
			if (val) 
				pref.binding.change(val);
		}
	},
	
	enable: function()
	{
		for (var key in this._prefs)
		{
			var pref = Prefs._prefs[key];
			var val = Prefs.getPrefValue(key);
			
			if (val)
				pref.binding.change(val);
		}
		
		prefBranch.addObserver('', this.onPrefChange, false);
	},
	
	disable: function()
	{
		for (var pref in this._prefs)
		{
			var pref = this._prefs[pref];
			
			if (pref.binding._ref)
				sheetService.disable(pref.binding._ref);
		}
		
		prefBranch.removeObserver('', this.onPrefChange);
	}
};

var colorlicious =
{
	firstRun: false,
	runOnce: function(win)
	{
		if (this.firstRun == true || win.document.documentElement.getAttribute("windowtype") != "navigator:browser")
			return;
		
		var _prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		var def_prefs = _prefs.getDefaultBranch("extensions.colorlicious.");
		var sync_prefs = _prefs.getDefaultBranch("services.sync.prefs.sync.extensions.colorlicious.");
		
		def_prefs.setCharPref("button","");
		def_prefs.setCharPref("appmenu","");
		def_prefs.setCharPref("tab","");
		def_prefs.setCharPref("selectedtab","");
		def_prefs.setCharPref("customPresets","");
		def_prefs.setCharPref("hostOS", "");
		def_prefs.setCharPref("TEST", "");
		def_prefs.setBoolPref("uxChannel", false);
		_prefs.getDefaultBranch("extensions.").setCharPref("Colorlicious@SoapySpew.description","chrome://colorlicious/locale/options.properties");
		
		// Enable syncing of prefs
		sync_prefs.setBoolPref("button", true);
		sync_prefs.setBoolPref("appmenu", true);
		sync_prefs.setBoolPref("tab", true);
		sync_prefs.setBoolPref("selectedtab", true);
		sync_prefs.setBoolPref("customPresets", true);
		
		//check for ux-channel, maybe this is a better way to check for this
		try
		{
			if (_prefs.getDefaultBranch("app.").getCharPref('update.channel') == 'nightly-ux')
			{
				uxChannel = true;
				//prefBranch.setBoolPref("uxChannel", true);
			}
		}
		catch(e)
		{
			//uxChannel = false;
		}
		
		// set hostOS
		hostOS = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;
		prefBranch.setCharPref("hostOS", hostOS);
		
		Prefs.enable();
		this.firstRun = true;
	},
	
	_init: function(win){},
	
	observe: function(subject, topic)
	{
		if (topic != "domwindowopened")
		  return;
		
		subject.addEventListener("load", function runOnce()
		{
			subject.removeEventListener("load", runOnce, false);
			colorlicious.runOnce(subject);
		}, false);
	}
};

function startup(data, reason)
{
	watcher.registerNotification(colorlicious);
	var mWindows = watcher.getWindowEnumerator();
	
	while (mWindows.hasMoreElements())
	{
		colorlicious.runOnce(mWindows.getNext());
	}
};

function shutdown(data, reason)
{
	watcher.unregisterNotification(colorlicious);
	Prefs.disable();
};