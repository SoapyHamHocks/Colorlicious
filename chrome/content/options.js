'use strict';
const Cc = Components.classes, Ci = Components.interfaces;
let prefBranch = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.colorlicious.').QueryInterface(Ci.nsIPrefBranch2);

var appmenu_widget, tab_widget, selectedtab_widget, button_widget;
var appmenu_presets, tab_presets, selectedtab_presets, button_presets;

var colorPickerOpen = false;

Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

function $(id)
{
	return document.getElementById(id);
}

function init()
{
	appmenu_presets = new colorPresets('appmenu');
	tab_presets = new colorPresets('tab');
	selectedtab_presets = new colorPresets('selectedtab');
	button_presets = new colorPresets('button');
	appmenu_widget = new colorWidget('appmenu');
	tab_widget = new colorWidget('tab');
	selectedtab_widget = new colorWidget('selectedtab');
	button_widget = new colorWidget('button');

	topSettingPresets.init('recentpresets-hbox', 173, 3);
		
	fullscreenPopup.init();
	floatingPopup.init();
	
	leftPaneDeck(0);
}

var fullscreenPopup =
{
	popup: null,	
	init: function()
	{
		this.popup = $('fullpage-popup-deck');
	},

	show: function(aPane)
	{
		this.popup.hidden = false;

		switch (aPane)
		{	
			// Settings pane
			case 0:
				topSettingPresets.init("settings-pane-presets", 100);
				break;
			// Manage presets
			case 1:
				managePresets.init();
				break;
		}
		
		this.popup.selectedIndex = aPane;
	},

	hide: function()
	{
		this.popup.hidden = true;
		leftPaneDeck(0);
		topSettingPresets.init('recentpresets-hbox', 173, 3);
	},
}

var floatingPopup =
{
	popup: null,
	deck: null,
	
	init: function()
	{
		this.popup = $('popup-container');
		this.deck = $('floating-popup-deck');
	},

	show: function(aPane)
	{
		this.popup.removeAttribute('_hidden');
		this.deck.selectedIndex = aPane;
		
		switch (aPane)
		{	
			// Reset color settings pane
			case 0:
				$('reset-dummy-button').focus();
				break;
			
			// Create a new preset
			case 1:
				$('preset-name-textbox').focus();
		}
	},
	
	accept: function(aPane)
	{
		switch (aPane)
		{
			case 0:
				appmenu_widget.reset();
				tab_widget.reset();
				selectedtab_widget.reset();
				button_widget.reset();

				this.hide();
				break;
			
			case 1:
				var textbox =$('preset-name-textbox');
				if (textbox.value == '')
					return;
				if (!bPreset.newPreset())
					return;

				textbox.value = '';
				this.hide();
				break;
		}
	},

	hide: function()
	{
		this.popup.setAttribute('_hidden', true);
		$('preset-warning').setAttribute('_hidden', true);
	},
}

function floatingPopupMessage(message, aCallback)
{
	var container = $('general-message-flopping_popup');
	var button, cancelButton, label, hbox, spacer;
	
	var cleanPopup = function()
	{
		floatingPopup.hide();
		
		while (container.hasChildNodes())
			container.removeChild(container.firstChild);
			
		button.removeEventListener('command', onAccept, false);
		if (aCallback)
			cancelButton.removeEventListener('command', onCancel, false);
	}
	
	var onAccept = function()
	{
		cleanPopup();
		if (aCallback)
			aCallback();
	}
	
	var onCancel = function()
	{
		cleanPopup();
	}

	var _init = function ()
	{
		while (container.hasChildNodes())
			container.removeChild(container.firstChild);
			

		label = document.createElement('label');
		label.setAttribute('value', message);
		
		container.appendChild(label);
		
		spacer = document.createElement('spacer');
		spacer.flex = 1;
		spacer.className = 'popup-spacer'
		
		container.appendChild(spacer);
		
		hbox = document.createElement('hbox');
		hbox.pack = 'end';
		
		button = document.createElement('button');
		button.setAttribute('label', 'OK');
		button.className = 'button';
		button.addEventListener('command', onAccept, false);
		button.setAttribute('default', true);
		
		hbox.appendChild(button);
		
		if (aCallback)
		{
			cancelButton = document.createElement('button');
			cancelButton.setAttribute('label', 'Cancel');
			cancelButton.className = 'button';
			
			cancelButton.addEventListener('command', onCancel, false);
			hbox.appendChild(cancelButton);
		}
		
		container.appendChild(hbox);		
		// Show the popup
		floatingPopup.show(2);
		// focus the OK button
		button.focus();
	}
	_init();
}

function defaultPreset(name)
{
	var prefs =  ['appmenu','tab','selectedtab','button'];
	
	var pref_value = topSettingPresets.preference;
	
	for (var _name in pref_value)
	{
		for (var i in prefs)
		{
			var current = prefs[i];
			prefBranch.setCharPref(current, pref_value[name][current]);
		}
	}
	// update color widgets
	appmenu_widget.updatePref();
	tab_widget.updatePref();
	selectedtab_widget.updatePref();
	button_widget.updatePref();
}

function _shownewPresetDlg()
{
	floatingPopup.show(1);
}

var topSettingPresets =
{
	container: null,
	presets: [],
	_prefs: ['appmenu','tab','selectedtab','button'],
	preference: {"Early bird":{"appmenu":"{\"h\":63,\"s\":33,\"l\":74,\"a\":100}","tab":"{\"h\":153,\"s\":46,\"l\":65,\"a\":100}","selectedtab":"{\"h\":182,\"s\":46,\"l\":65,\"a\":100}","button":"{\"h\":198,\"s\":57,\"l\":49,\"a\":100}"},"Fruit salad":{"appmenu":"{\"h\":39,\"s\":67,\"l\":58,\"a\":100}","tab":"{\"h\":0,\"s\":59,\"l\":56,\"a\":100}","selectedtab":"{\"h\":53,\"s\":68,\"l\":60,\"a\":100}","button":"{\"h\":216,\"s\":44,\"l\":55,\"a\":100}"},"Winter's coming":{"appmenu":"{\"h\":177,\"s\":32,\"l\":89,\"a\":100}","tab":"{\"h\":200,\"s\":45,\"l\":81,\"a\":100}","selectedtab":"{\"h\":189,\"s\":40,\"l\":86,\"a\":100}","button":"{\"h\":195,\"s\":23,\"l\":83,\"a\":100}"}},

	create: function(name)
	{
		var preset = document.createElement('button');
		preset.pack = 'start';
		preset.align = 'end';
		preset.className = 'topSettings topSettings-preset';
		preset.setAttribute('label', name);
		
		return preset;
	},
	
	toCSS: function(h, s, l)
	{
		var string = 'hsl( ' + h + ',' + s + '%,' + l +'%)';
		return string;
	},
	
	constructBox: function(box, pref, size)
	{
		var gradientString = '';
		var positionString = '';
		var colorValues = [];
		var currentValue;
			
		for (var i = 0; i < 4; ++i)
		{
			if (pref == 'popupPreview')
				currentValue = prefBranch.getCharPref(this._prefs[i]);
			else
				currentValue = pref[this._prefs[i]];
				
			if (currentValue)
			{
				currentValue = JSON.parse(currentValue);
				var currentColor = topSettingPresets.toCSS(currentValue.h, currentValue.s, currentValue.l);
				colorValues.push(currentColor);
			}
		}

		var maxColors = colorValues.length;

		for (var i = 0; i < maxColors; ++i)
		{
			gradientString += "linear-gradient(" + colorValues[i] + ", " + colorValues[i] + "),";
			positionString += i / (maxColors - 1) * 100 + "% 0,";
		}

		if (maxColors > 0)
		{
			box.style.backgroundImage = gradientString.substring(0, gradientString.length - 1);
			box.style.backgroundPosition = positionString.substring(0, positionString.length - 1);
			box.style.backgroundSize = 100 / maxColors + "% 100%";
		}

		box.style.width = box.style.minHeight = box.style.maxHeight = box.style.maxWidth = size + "px";
		box.style.minWidth = "0";
		box.style.backgroundRepeat = "no-repeat";
	},
	
	init: function(target, size, limit, selectOnly)
	{
		var pref = prefBranch.getCharPref('customPresets');
		this.presets = [];
		this.container = $(target);
		
		if (target == 'settings-pane-presets')
		{
			var new_preset_button = $('new-preset-button');
			if (new_preset_button)
				new_preset_button.removeEventListener('command', _shownewPresetDlg, false);
		}
		
		while (this.container.hasChildNodes())
			this.container.removeChild(this.container.firstChild);
			
		if (selectOnly && !pref)
			return;
			
		$('manage-presets-header').hidden = selectOnly;
		
		if (selectOnly)
		{
			var exportButton = $('preset-export-button');
			var removeButton = $('preset-remove-button');
			
			exportButton.disabled = true;
			removeButton.disabled = true;
		}
		if (target == 'settings-pane-presets')
		{
			var newPresetButton_container = document.createElement('stack');
			newPresetButton_container.className = 'topSetting-backgroundContainer new-preset-button-container';
			var newPresetButton = document.createElement('button');
			newPresetButton_container.appendChild(newPresetButton);
			newPresetButton.id = 'new-preset-button';
			newPresetButton.className = 'newPreset';
			newPresetButton.setAttribute('label', ' ');
			newPresetButton.addEventListener('command', _shownewPresetDlg, false);
		}

		var temp = pref ? JSON.parse(pref) : this.preference;
		var count = 0;

		for (var name in temp)
		{
			if (temp.hasOwnProperty(name))
			{
				if (count == limit)
					break;
				var el = this.create(name);
				this.constructBox(el, temp[name], size);
				this.presets.push(el);
				count++;
			}
		}
		
		var selectedItemCount = 0;
		
		for (var e in this.presets)
		{
			var conBox = document.createElement('stack');
			conBox.className = 'topSetting-backgroundContainer';
			
			conBox.appendChild(this.presets[e]);
			if (selectOnly)
			{
				var checkmark = document.createElement('vbox');
				checkmark.className = 'topSetting-preset-checkmark';
				conBox.appendChild(checkmark);
			}
			this.container.appendChild(conBox);
			
			if (target == 'settings-pane-presets')
				this.container.appendChild(newPresetButton_container);

			this.presets[e].addEventListener('command', function()
			{

				var button = this;
						
					if (selectOnly)
					{
					}
					else
					{
						if (pref)
						{
							var name = this.getAttribute('label');
							for (var _name in temp)
							{
								for (var i in topSettingPresets._prefs)
								{
									var current = topSettingPresets._prefs[i];
									prefBranch.setCharPref(current, temp[name][current]);
								}
							}
						}
						else
							defaultPreset(this.label);
						// update color widgets
						appmenu_widget.updatePref();
						tab_widget.updatePref();
						selectedtab_widget.updatePref();
					}
				if (selectOnly)
				{
					var stack = this.parentNode;
					
					if (!stack.hasAttribute('selected'))
					{
						stack.setAttribute('selected', true);
						selectedItemCount++;
					}
					else
					{
						stack.removeAttribute('selected');
						selectedItemCount--;
						
					}

					exportButton.disabled = !(selectedItemCount > 0);
					removeButton.disabled = !(selectedItemCount > 0);

				}

			}, false);
		}
	}
}

var managePresets =
{
	init: function()
	{
		topSettingPresets.init('manage-presets-container', 130, null, true);
	
		$('preset-export-button').disabled = true;
		$('preset-remove-button').disabled = true;
	},
	
	refresh: function()
	{
		fullscreenPopup.show(1);
	},
	
	_export: function()
	{
		var container = $('manage-presets-container');
		var presetsToExport = [];
		
		for (var i = 0; i < container.childNodes.length; ++i)
		{
			var current = container.childNodes[i];
			if (current.getAttribute('selected'))
				presetsToExport.push(current.firstChild.getAttribute('label'));
		}
		
		var out_pref = {};
		bPreset.updatePref();
		var customPresets = bPreset.customPresets;
		
		if (!customPresets)
			return;
		
		customPresets = JSON.parse(customPresets);

		for (var i = 0; i < presetsToExport.length; ++i)
		{
			var current = presetsToExport[i];
			out_pref[current] = customPresets[current];
		}
		bPreset.exportPreset(JSON.stringify(out_pref));
		
		this.refresh();
	},
	
	_remove: function()
	{
		var container = $('manage-presets-container');
		var presetsToRemove = [];
		
		for (var i = 0; i < container.childNodes.length; ++i)
		{
			var current = container.childNodes[i];
			if (current.getAttribute('selected'))
				presetsToRemove.push(current.firstChild.getAttribute('label'));
		}
		
		for (var i = 0; i < presetsToRemove.length; ++i)
		{
			bPreset.removePreset(presetsToRemove[i]);
		}
		
		this.refresh();
		
		if (container.childNodes.length == 0)
			$('manage-presets-header').hidden = false;
	},
	
	close: function()
	{
		fullscreenPopup.show(0);
	}
};

function leftPaneDeck(i)
{
	var deck = $('leftPane-deck');
	
	var radiogroup = $('pane-settings-radiogroup');
	var vbox1 = $('leftPane-cats');
	var button = $('banner-back-button');
	var title = $('banner-title');
	
	var originalLabel = 'Colorlicious';

	deck.selectedIndex = i;
	
	button.setAttribute('_hidden', (deck.selectedIndex == 0));	
	switch (i)
	{
		case 0:
			title.value = originalLabel;
			switchDeck(4);
			break;
		case 1:
			title.value = $('colors-header-button').label;
			switchDeck(radiogroup.selectedIndex);
			break;
		case 2:
			switchFullPage('page-settings-pane');
			topSettingPresets.init("settings-pane-presets", 100);
			break;
		case 3:
			title.value = $('feedback-header-button').label;
			switchDeck(5);
			break;
	}
}

function topSettings(pane)
{
	leftPaneDeck(1);
	var radiogroup = $('pane-settings-radiogroup');
	switch(pane)
	{
		case 'toolbars':
			radiogroup.selectedIndex = 0;
			switchDeck(0);
			break;
		case 'buttons':
			radiogroup.selectedIndex = 2;
			switchDeck(2);
			break;
		case 'tabs':
			radiogroup.selectedIndex = 1;
			switchDeck(1);
			break;
	}
}

function popupKeyPress(evt)
{
	if ($('popup-container').getAttribute('_hidden'))
		return;
		
	switch (evt.keyCode)
	{
		// escape
		case 27:
			floatingPopup.hide();
			break;
		// enter
		case 13:
			var i = $('popup-container').firstChild.selectedIndex;
			floatingPopup.accept(parseInt(i));
			break;
	}
}

var bPreset =
{
	value: {},
	prefs: ['appmenu','tab','selectedtab','button'],
	customPresets: null,

	updatePref: function()
	{
		this.customPresets = prefBranch.getCharPref('customPresets');
	},
	
	importPreset: function()
	{
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, $('colorlicious-strings').getString('importPreset'), nsIFilePicker.modeOpen);
		fp.appendFilter($('colorlicious-strings').getString('fileDescription'), "*.json;");

		if (fp.show() != nsIFilePicker.returnOK)
			return;
			
		this.updatePref();
		var currentPref = this.customPresets;
		var file = fp.file;
	
		NetUtil.asyncFetch(file, function(inputStream, status)
		{
			if (!Components.isSuccessCode(status))
			{
				return;
			}
			
			try
			{
				var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				var data = JSON.parse(data);
				
			}
			catch(e)
			{
				var new_popup = new floatingPopupMessage($('colorlicious-strings').getString('importMessage'));
				return;
			}
			var newPref;
			
			if (currentPref)
			{
				newPref = JSON.parse(currentPref);
			
				for (var name in data)
				{
					for (var i in currentPref)
					{
						if (data[name] == newPref[name])
							break;
						
						newPref[name] = data[name];
					}
				}
			}
			else
			{
				newPref = data;
			}
			
			prefBranch.setCharPref('customPresets', JSON.stringify(newPref));
			topSettingPresets.init("settings-pane-presets", 100);
		});
	},
	
	exportPreset: function(data)
	{
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, $('colorlicious-strings').getString('exportPreset'), nsIFilePicker.modeSave);
		fp.appendFilter($('colorlicious-strings').getString('fileDescription'), "*.json;");
		fp.defaultExtension = 'json';
		fp.defaultString = 'my preset.json';

		if (fp.show() != nsIFilePicker.returnOK)
			return;
			
		this.updatePref();
		
		var file = fp.file;
		
		var ostream = FileUtils.openSafeFileOutputStream(file);

		var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
		var istream = converter.convertToInputStream(data);

		NetUtil.asyncCopy(istream, ostream, function(status) {
		  if (!Components.isSuccessCode(status)) {
			return;
		  }
		});
	},
	
	removePreset: function(_name)
	{
		this.updatePref();
		var pref = JSON.parse(bPreset.customPresets);

		delete pref[_name];
				
		if (JSON.stringify(pref) == '{}')
		{
			prefBranch.clearUserPref('customPresets');
		}
		else
		{
			prefBranch.setCharPref('customPresets', JSON.stringify(pref));
		}
	},
	newPreset: function()
	{
		this.updatePref();
		var pref;

		try
		{
			pref = JSON.parse(this.customPresets);
		}
		catch(e)
		{
			pref = {};
		}
		
		var PresetName = $('preset-name-textbox').value;
		
		if (pref[PresetName])
		{
			$('preset-warning').setAttribute('_hidden', false);
			return false;
		}
		else
		{
			var temp_pref = {};
			for (var i in this.prefs)
			{
				temp_pref[this.prefs[i]] = prefBranch.getCharPref(this.prefs[i]);
			}
			
			pref[PresetName] = temp_pref;
			
			prefBranch.setCharPref('customPresets', JSON.stringify(pref));
			
			topSettingPresets.init("settings-pane-presets", 100);
			
			return true;
		}
	},
};

function switchDeck(val)
{
	var deck = $('main-deck');
	deck.selectedIndex = val;
}

function colorPresets(args)
{
	var preference = args;

	var presetElements = new Array(18);
	
	var createElement = function(el_name)
	{
		return document.createElement(el_name);
	}
	
	var presetCommand = function(i)
	{
		var colors = [{"h":320,"s":67,"l":59},{"h":345,"s":75,"l":39},{"h":12,"s":69,"l":49},{"h":27,"s":100,"l":60},{"h":74,"s":100,"l":33},{"h":130,"s":100,"l":27},{"h":180,"s":97,"l":36},{"h":189,"s":100,"l":30},{"h":209,"s":100,"l":68},{"h":205,"s":100,"l":39},{"h":258,"s":77,"l":40},{"h":296,"s":100,"l":29},{"h":208,"s":100,"l":27},{"h":217,"s":100,"l":13},{"h":0,"s":100,"l":17},{"h":0,"s":100,"l":11},{"h":0,"s":0,"l":35},{"h":0,"s":0,"l":0}];
		var hsl = {};
		
		hsl.h = colors[i].h;
		hsl.s = colors[i].s;
		hsl.l = colors[i].l;
		hsl.a = 100;
		
		switch (args)
		{
			case 'appmenu':
				appmenu_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
			
			case 'tab':
				tab_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
			
			case 'selectedtab':
				selectedtab_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
			
			case 'button':
				button_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
		}
		
		var temp = JSON.stringify(hsl);
		
		prefBranch.setCharPref(args, temp);

	}
	
	this._init = function()
	{
		var _parent;
		
		switch (args)
		{
			case 'appmenu':
				_parent = 'appmenu-presets-container';
				break;
			case 'tab':
				_parent = 'tab-presets-container';
				break;
			case 'selectedtab':
				_parent = 'selectedtab-presets-container';
				break;
			case 'button':
				_parent = 'button-presets-container';
				break;
		}
		var containerBox = createElement('vbox');
		
		containerBox.className = 'color-presets-container';
		var firstBox = createElement('hbox');
		var secondBox = createElement('hbox');
		var thirdBox = createElement('hbox');
		containerBox.appendChild(firstBox);
		containerBox.appendChild(secondBox);
		containerBox.appendChild(thirdBox);
		
		for (var i = 0; i < 18; i++)
		{
			presetElements[i] = createElement('button');
			presetElements[i].className = 'color-preset color-preset-' + i;
			
			if (i < 6)
				firstBox.appendChild(presetElements[i]);
			else if ( i > 5 && i < 12)
				secondBox.appendChild(presetElements[i]);
			else
				thirdBox.appendChild(presetElements[i]);
				
			presetElements[i].setAttribute('_number', i);
				
			presetElements[i].addEventListener('command', function()
				{
					var i = this.getAttribute('_number');
					presetCommand(i);
				}, false);
		}
		
		document.getElementById(_parent).appendChild(containerBox);
	}
	
	this._init();
}

function hslToRgb(_h, _s, _l)
{
	this.r = null;
	this.g = null;
	this.b = null;
	
	var h = _h / 360;
	var s = _s / 100;
	var l = _l / 100;
	
	var hue2rgb = function(p, q, t)
	{
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if(t < 1/6) return p + (q - p) * 6 * t;
		if(t < 1/2) return q;
		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	}

	this._init = function()
	{
		var r,g,b;
		if (s == 0)
		{
			r = g = b = l;
		}
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
		
		this.r = Math.round(r * 255);
		this.g = Math.round(g * 255);
		this.b = Math.round(b * 255);
	}
	this._init();
}

function rgbToHsl(_r, _g, _b)
{
	var h, s, l;
	
	var r = _r;
	var g = _g;
	var b = _b;

	this._init = function()
	{
		r /= 255, g /= 255, b /= 255;
		
		var max = Math.max(r,g,b), min = Math.min(r,g,b);
		
		var h, s, l = (max + min) / 2;
		
		if (max == min)
			h = s = 0;
		else
		{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			
			switch (max)
			{
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}
		this.h = Math.round(h*360);
		this.s = Math.round(s*100);
		this.l = Math.round(l*100);
	}
	this._init();
}

function hexToRgb(hex)
{
	var r, g , b;
	
	this._init = function()
	{
		if (hex.length == 3)
		{
			hex = hex.substring(0,1) + hex.substring(0,1) + hex.substring(1,2) + hex.substring(1,2) + hex.substring(2,3) + hex.substring(2,3);
		}
		
		this.r = parseInt((hex.substring(0,2)),16);
		this.g = parseInt((hex.substring(2,4)),16);
		this.b = parseInt((hex.substring(4,6)),16);
	}
	this._init();
}

function rgbToHex(r,g,b)
{
	r = r.toString(16);
	g = g.toString(16);
	b = b.toString(16);
	
	while(r.length < 2)
		r = '0' + r;
	while(g.length < 2)
		g = '0' + g;
	while(b.length < 2)
		b = 0 + b;

	return (r + g + b);
}

function colorWidget(args)
{
	var preference = args;
	var pref_val = prefBranch.getCharPref(args);
	var vbox, reset_button, openpopup_button;
	var hsl = {};
	var rgb, brightness;
	var widgetStack;
	
	var picker;
	
	var onClick = function(evt)
	{	
		picker = new colorPicker(preference);
	}
	
	var invertState = function()
	{
		rgb = new hslToRgb(hsl.h, hsl.s, hsl.l);
		brightness =  Math.round((Math.sqrt(rgb.r * rgb.r * .241 + rgb.g * rgb.g * .691 + rgb.b * rgb.b * .068) / 255) * 100);

		vbox.setAttribute('inverted', brightness >= 50);
	}
	
	this.reset = function()
	{
		prefBranch.clearUserPref(preference);
		hsl.h = 0;
		hsl.s = 0;
		hsl.l = 100;
		updatePreview();
	}
	
	this.setHSL = function(h,s,l)
	{
		hsl.h = h;
		hsl.s = s;
		hsl.l = l;
		
		updatePreview();
	}
	
	this.hsl = function()
	{
		return hsl;
	}
	
	this.updatePref = function()
	{
		var _pref = prefBranch.getCharPref(args);
		if (!_pref)
			return;
		var _temp = JSON.parse(_pref);
		hsl.h = _temp.h;
		hsl.s = _temp.s;
		hsl.l = _temp.l;
		updatePreview();
	}
	
	var updatePreview = function()
	{
		openpopup_button.style.backgroundColor = 'hsl(' + hsl.h + ',' + hsl.s + '%,' + hsl.l +'%)';
		invertState();
		
		var currentButton;
		
		if (preference == 'appmenu')
			return;
		
		switch (preference)
		{
			case 'button':
				currentButton = $('topsettings-toolbarbuttons')
				break;
			case 'tab':
				currentButton = $('topsettings-tabs')
				break;
			case 'selectedtab':
				currentButton = $('topsettings-selectedtabs')
				break;
		}

		if (hsl.h == 0 && hsl.s == 0 && hsl.l == 100)
		{
			currentButton.style.backgroundColor = '';
			currentButton.setAttribute('inverted', false);	
		}
		else
		{
			currentButton.style.backgroundColor = 'hsl(' + hsl.h + ',' + hsl.s + '%,' + hsl.l +'%)';
			currentButton.setAttribute('inverted', brightness >= 50);
		}
	}
	
	this._init = function()
	{
		vbox = document.createElement('vbox');
		
		// open popup button
		openpopup_button = document.createElement('button');
		openpopup_button.addEventListener('command', onClick, false);
		openpopup_button.className = 'paintbucket-preview-button';
		
		widgetStack = document.createElement('stack');
		
		widgetStack.appendChild(openpopup_button);

		// color reset button
		reset_button = document.createElement('button');
		reset_button.className = 'button reset-button';
		reset_button.addEventListener('command', this.reset, false);
		reset_button.setAttribute('label', $('colorlicious-strings').getString('reset'));
		
		vbox.className = 'color-preset-paintbucket';

		vbox.appendChild(widgetStack);
		vbox.appendChild(reset_button);
		
		if (pref_val)
		{
			var _temp = JSON.parse(pref_val);
			hsl.h = _temp.h;
			hsl.s = _temp.s;
			hsl.l = _temp.l;
		}
		else
		{
			hsl.h = 0;
			hsl.s = 0;
			hsl.l = 100;
		}
		
		updatePreview();
		
		var _parent;
		
		switch (args)
		{
			case 'appmenu':
				_parent = 'appmenu-painbucket-container';
				break;
			case 'tab':
				_parent = 'tab-painbucket-container';
				break;
			case 'selectedtab':
				_parent = 'selectedtab-painbucket-container';
				break;
			case 'button':
				_parent = 'button-painbucket-container';
				break;
		}
		
		document.getElementById(_parent).appendChild(vbox);
	}
	
	this._init();
}

function colorPicker(args)
{
	
	var popupContainer = document.getElementById('popup-container-colorpicker');
	
	// elements here
	var hueHbox, satBox, satStack, preview, preview_container, hsl_textbox_container;
	var temp_container, title, title_container, hex_container, rgb_container, _spacer;
	
	// color input textboxes
	var hsl_boxes = new Array(3);
	var rgb_boxes = new Array(3);
	
	
	var parent = popupContainer;
	var container, indicator, stack;
	var satSlider, hexTextBox, opacityTextbox;
	var opacityStack, opacitySlider;
	
	// variables to hold the events so we can remove them later
	var hueEvents, satEvents, opacityEvents;
	
	var _rgb, _hsl;
	
	var hsl = {};
	
	var preference = prefBranch.getCharPref(args);
	
	var dlg_buttons_container;
	var dlg_buttons = new Array (2);
	
	this.getHSL = function()
	{
		return hsl;
	}
	
	var moveCursors = function()
	{
		if (isNaN(hsl.h) || isNaN(hsl.s) || isNaN(hsl.l) || isNaN(hsl.a))
			return;

		indicator.style.backgroundPosition = (parseInt(hsl.h)) + 'px ' + ((360 - parseInt(hsl.l) / .28) ) + 'px';
		satStack.style.backgroundPosition = 'center ' + ((360 - parseInt(hsl.s) / .28) + 2) + 'px';
		opacityStack.style.backgroundPosition = 'center ' + ((360 - parseInt(hsl.a) / .28) + 2) + 'px';
	}
	
	var updatePreview = function()
	{
		if (isNaN(hsl.h) || isNaN(hsl.s) || isNaN(hsl.l) || isNaN(hsl.a))
			return;

		preview.style.backgroundColor = '';
		preview.style.backgroundImage = '';
		
		if (parseInt(hsl.a) == 100)
		{
			preview.style.backgroundColor = 'hsl(' + hsl.h + ',' + hsl.s + '%,' + hsl.l +'%)';
		}
		else
		{
			preview.style.backgroundImage = 'linear-gradient(hsla(' + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%,' + (hsl.a / 100) +'), hsla(' + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%,' + (hsl.a / 100) +' )),url(chrome://colorlicious/skin/options/colorpicker/trans.png)';

		}

		satSlider.style.backgroundImage = 'linear-gradient(to top, hsl(' + hsl.h + ',0%,' + hsl.l +'%), hsl(' + hsl.h + ',100%,' + hsl.l + '%))';
		opacitySlider.style.backgroundImage = 'linear-gradient(hsl(' + hsl.h + ',' + hsl.s + '%,' + hsl.l +'%), hsla(' + hsl.h + ',100%,' + hsl.l + '%,0)),url(chrome://colorlicious/skin/options/colorpicker/trans.png)';
	}
	
	// a seperate class for the event listeners
	function mouseListeners(_target)
	{
		var target_el = _target;
		var target = target_el.className;
		var mouseDown = false;
		var mouseX, mouseY;
		
		var _mouseUp = function(evt)
		{
			indicator.hidden = false;
			satStack.removeAttribute('dragging');
			opacityStack.removeAttribute('dragging');

			if (!mouseDown)
				return;
			
			mouseDown = false;
		
			_updateMousePos(evt);
			if (target == 'colorPicker-hue')
			{
				indicator.style.backgroundPosition = (mouseX) + 'px ' + (mouseY) + 'px';
			}
		}
		
		var _mouseDown = function(evt)
		{
			if (evt.target.className != target)
				return;
			
			_updateMousePos(evt);

			if (evt.target == satStack)
				satStack.setAttribute('dragging', true);
				
			else if (evt.target == opacityStack)
				opacityStack.setAttribute('dragging', true);
			
			mouseDown = true;
		}
		
		var getMousePos = function(evt)
		{
			var rect = target_el.getBoundingClientRect();
			
			var _x, _y;
			
			_x = evt.clientX - rect.left;
			_y = evt.clientY - rect.top;
			
			if (_x < 0)
				_x = 0;
			if (_x > 360)
				_x = 360;
			
			if (_y < 0)
				_y = 0;
				
			if (_y > 358)
				_y = 358;
			
			mouseX = _x;
			mouseY = _y;
		}
		
		var _updateMousePos = function(evt)
		{
			getMousePos(evt);

			if (target == 'colorPicker-hue')
			{
			
				if(evt.target.className == 'colorPicker-hue')
				{
					indicator.hidden = true;
				}
				else
				{
					indicator.hidden = false;
					indicator.style.backgroundPosition = (mouseX) + 'px ' + (mouseY) + 'px';
				}
			
				hsl.h = mouseX;
				hsl.l = 100 - Math.round(mouseY * 0.28);
			}
			if (target == 'colorPicker-satStack')
			{
				satStack.style.backgroundPosition = 'center ' + (mouseY + 4) + 'px';
				
				hsl.s = 100 - Math.round(mouseY * 0.28);
			}
			else if (target == 'colorPicker-opacityStack')
			{
				opacityStack.style.backgroundPosition = 'center ' + (mouseY + 4) + 'px';
				
				hsl.a = 100 - Math.round(mouseY * 0.28);
				
				opacityTextbox.value = hsl.a;
			}
			
			// update textboxes
			
			hsl_boxes[0].value = hsl.h;
			hsl_boxes[1].value = hsl.s;
			hsl_boxes[2].value = hsl.l;
			
			_rgb = new hslToRgb(hsl.h, hsl.s, hsl.l);
			
			rgb_boxes[0].value = _rgb.r;
			rgb_boxes[1].value = _rgb.g;
			rgb_boxes[2].value = _rgb.b;
			
			hexTextBox.value = rgbToHex(_rgb.r, _rgb.g, _rgb.b);
			
			updatePreview();
			satOpacity();
		}
		
		var _mouseMove = function(evt)
		{
			if (!mouseDown)
				return;
				
			_updateMousePos(evt);
		}
		
		this._uninit = function()
		{
			window.removeEventListener('mouseup', _mouseUp, false);
			window.removeEventListener('mousedown', _mouseDown, false);
			window.removeEventListener('mousemove', _mouseMove, false);
		}
		
		var _init = function()
		{	
			window.addEventListener('mouseup', _mouseUp, false);
			window.addEventListener('mousedown', _mouseDown, false);
			window.addEventListener('mousemove', _mouseMove, false);
		}
		_init();
	}
	
	var satOpacity = function()
	{
		satBox.style.opacity = (100 - hsl.s) / 100;
		updatePreview();
	}
	
	var createElement = function(el)
	{
		return document.createElement(el);
	}
	
	var handleTextbox = function(evt)
	{
		var textbox = evt.target;
		var val = textbox.value;
		var max = val.max;
		
		if (val > max)
			val = max;
		
		switch (textbox.className)
		{
			case 'textbox opacity-textbox':
				hsl.a = opacityTextbox.value;
				break;
			case 'textbox hex-textbox':
				var RGB = new hexToRgb(val);
				
				rgb_boxes[0].value = RGB.r;
				rgb_boxes[1].value = RGB.g;
				rgb_boxes[2].value = RGB.b;
				
				var HSL = new rgbToHsl(RGB.r, RGB.g, RGB.b);
				hsl_boxes[0].value = HSL.h;
				hsl_boxes[1].value = HSL.s;
				hsl_boxes[2].value = HSL.l;
				
				hsl.h = HSL.h;
				hsl.s = HSL.s;
				hsl.l = HSL.l;
				break;

			case 'textbox combined hsl-h-textbox':
				hsl.h = val;
				break;
			case 'textbox combined hsl-s-textbox':
				hsl.s = val;
				break;
			case 'textbox combined hsl-l-textbox':
				hsl.l = val;
				break;
				
			case 'textbox combined rgb-r-textbox':
			case 'textbox combined rgb-g-textbox':
			case 'textbox combined rgb-b-textbox':
				var r = rgb_boxes[0].value;
				var g = rgb_boxes[1].value;
				var b = rgb_boxes[2].value;
				
				// update HSL textboxes
				var HSL = new rgbToHsl(r,g,b);
				hsl_boxes[0].value = HSL.h;
				hsl_boxes[1].value = HSL.s;
				hsl_boxes[2].value = HSL.l;
				
				hsl.h = HSL.h;
				hsl.s = HSL.s;
				hsl.l = HSL.l;
				
				
				// update hex textbox
				hexTextBox.value = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
				break;
		}
		
		if (textbox.className == 'textbox combined hsl-h-textbox' ||
			textbox.className == 'textbox combined hsl-s-textbox' ||
			textbox.className == 'textbox combined hsl-l-textbox')
		{
			var RGB = new hslToRgb(hsl.h, hsl.s, hsl.l);
			rgb_boxes[0].value = RGB.r;
			rgb_boxes[1].value = RGB.g;
			rgb_boxes[2].value = RGB.b;
			
			hexTextBox.value = rgbToHex(RGB.r, RGB.g, RGB.b);
		}
		
		moveCursors();
		updatePreview();
	}
	
	var updateCallbackWidget = function()
	{
		switch (args)
		{
			case 'appmenu':
				appmenu_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
			
			case 'tab':
				tab_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
			
			case 'selectedtab':
				selectedtab_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
			
			case 'button':
				button_widget.setHSL(hsl.h, hsl.s, hsl.l);
				break;
		}
	}
	
	var acceptDlg = function()
	{
		var temp = {};
		temp.h = Math.round(hsl.h);
		temp.s = Math.round(hsl.s);
		temp.l = Math.round(hsl.l);
		temp.a = Math.round(hsl.a);

		prefBranch.setCharPref(args, JSON.stringify(temp));
		
		updateCallbackWidget();
	}
	
	var _uninit = function()
	{
		hueEvents._uninit();
		satEvents._uninit();
		opacityEvents._uninit();
		
		dlg_buttons[0].removeEventListener('command', acceptDlg, false);
		dlg_buttons[1].removeEventListener('command', _uninit, false);
		hexTextBox.removeEventListener('input', handleTextbox, false);
		
		// remove event listeners for the textboxes
		for (var i = 0; i < 3; ++i)
		{
			
			hsl_boxes[i].removeEventListener('input', handleTextbox, false);
			rgb_boxes[i].removeEventListener('input', handleTextbox, false);
			
			hsl_boxes[i].parentNode.removeChild(hsl_boxes[i]);
			rgb_boxes[i].parentNode.removeChild(rgb_boxes[i]);
		}
		
		hexTextBox.parentNode.removeChild(hexTextBox);
		hsl_textbox_container.parentNode.removeChild(hsl_textbox_container);
		rgb_container.parentNode.removeChild(rgb_container);
		hex_container.parentNode.removeChild(hex_container);
		_spacer.parentNode.removeChild(_spacer);
		preview_container.removeChild(preview);
		dlg_buttons[0].parentNode.removeChild(dlg_buttons[0]);
		dlg_buttons[1].parentNode.removeChild(dlg_buttons[1]);
		dlg_buttons_container.parentNode.removeChild(dlg_buttons_container);
		preview_container.parentNode.removeChild(preview_container);

		
		temp_container.parentNode.removeChild(temp_container);
		
		popupContainer.setAttribute('_hidden', true);
		colorPickerOpen = false;

	}

	this._init = function()
	{
		if (colorPickerOpen)
			return;
	
		temp_container = createElement('vbox');

		// ensure that the popup is visible
		popupContainer.setAttribute('_hidden', false);
		
		// create the container element
		
		container = createElement('hbox');
		container.className = 'colorPicker-container';
		temp_container.appendChild(container);
		
		// create a stack to hold hue/lightness images
		stack = createElement('stack');
		container.appendChild(stack);
		
		stack.className = 'colorPicker-stack';
		

		// add container to parent element
		temp_container.appendChild(container);
		parent.appendChild(temp_container);
		// add the stack to the container

		// create a new hueHbox element
		hueHbox = createElement('hbox')
		hueHbox.className = 'colorPicker-hue';
		
		satBox = createElement('hbox')
		satBox.className = 'colorPicker-saturation';
		
		stack.appendChild(hueHbox);
		stack.appendChild(satBox);
		
		indicator = createElement('hbox');
		indicator.className = 'colorPicker-cursor';
		
		stack.appendChild(indicator);
		
		// saturation slider
		satStack = createElement('stack');
		satStack.className = 'colorPicker-satStack';
		
		satSlider = createElement('vbox');
		satSlider.className = 'colorPicker-saturation-slider';
		
		satStack.appendChild(satSlider);
		
		// opacity slider
		
		opacityStack = createElement('stack');
		opacityStack.className = 'colorPicker-opacityStack';
		
		opacitySlider = createElement('vbox');
		opacitySlider.className = 'colorPicker-opacity-slider';
		opacityStack.appendChild(opacitySlider);

		container.appendChild(satStack);
		container.appendChild(opacityStack);
		
		preview_container = createElement('vbox');
		preview_container.className = 'colorPicker-previewContainer';
		preview_container.setAttribute('pack', 'end');
		
		preview = createElement('hbox');
		preview.className = 'colorPicker-preview';
		
		// hex textbox
		hex_container = createElement('hbox');
		hex_container.className = 'colorPicker-hexContainer';
		hex_container.pack = 'end';
		hexTextBox = createElement('textbox');
		hexTextBox.className = 'textbox hex-textbox';
		hexTextBox.setAttribute('maxlength', 6);
		hexTextBox.addEventListener('input', handleTextbox, false);
		
		opacityTextbox = createElement('textbox');
		opacityTextbox.setAttribute('type', 'number');
		opacityTextbox.setAttribute('max', 100);
		opacityTextbox.className = 'textbox opacity-textbox';
		opacityTextbox.setAttribute('maxlength', 3);
		opacityTextbox.addEventListener('input', handleTextbox, false);
		
		hex_container.appendChild(opacityTextbox);
		var hex_opacity_spacer = createElement('spacer');
		//hex_opacity_spacer.flex = 1;
		hex_container.appendChild(hex_opacity_spacer);
		hex_container.appendChild(hexTextBox);
		preview_container.appendChild(hex_container);
		
		rgb_container = createElement('hbox');
		rgb_container.className = 'colorPicker-rgbContainer';
		rgb_container.setAttribute('pack', 'end');
		
		for (var i = 0; i < 3; ++i)
		{
			rgb_boxes[i] = createElement('textbox');
			rgb_boxes[i].setAttribute('type', 'number');
			rgb_boxes[i].setAttribute('max', 255);
			rgb_boxes[i].setAttribute('hidespinbuttons', true);
			rgb_boxes[i].addEventListener('input', handleTextbox, false);
			rgb_container.appendChild(rgb_boxes[i]);
		}
		
		rgb_boxes[0].className = 'textbox combined rgb-r-textbox';
		rgb_boxes[1].className = 'textbox combined rgb-g-textbox';
		rgb_boxes[2].className = 'textbox combined rgb-b-textbox';
		
		preview_container.appendChild(rgb_container);
		
		hsl_textbox_container = createElement('hbox');
		hsl_textbox_container.setAttribute('pack', 'end');
		
		for (var i = 0; i < 3; ++i)
		{
			hsl_boxes[i] = createElement('textbox');
			hsl_boxes[i].setAttribute('type', 'number');
			hsl_boxes[i].setAttribute('max', 100);
			hsl_boxes[i].setAttribute('hidespinbuttons', true);
			hsl_boxes[i].addEventListener('input', handleTextbox, false);
			hsl_textbox_container.appendChild(hsl_boxes[i]);
		}
		
		hsl_boxes[0].className = 'textbox combined hsl-h-textbox';
		hsl_boxes[0].setAttribute('max', 360);
		hsl_boxes[1].className = 'textbox combined hsl-s-textbox';
		hsl_boxes[2].className = 'textbox combined hsl-l-textbox';
	
	
		preview_container.appendChild(hsl_textbox_container);
		
		_spacer = createElement('spacer');
		_spacer.flex = 1;
		preview_container.appendChild(_spacer);
		
		preview_container.appendChild(preview);
		container.appendChild(preview_container);
		
		dlg_buttons_container = createElement('hbox');
		dlg_buttons_container.setAttribute('pack', 'end');
		dlg_buttons[0] = createElement('button');
		dlg_buttons[1] = createElement('button');
		
		dlg_buttons[0].className = 'button';
		dlg_buttons[1].className = 'button';
		
		dlg_buttons[0].setAttribute('label', $('colorlicious-strings').getString('apply'));
		dlg_buttons[0].setAttribute('default', true);
		dlg_buttons[1].setAttribute('label', $('colorlicious-strings').getString('close'));
		
		dlg_buttons[0].addEventListener('command', acceptDlg, false);
		dlg_buttons[1].addEventListener('command', _uninit, false);
		
		dlg_buttons_container.appendChild(dlg_buttons[0]);
		dlg_buttons_container.appendChild(dlg_buttons[1]);
		
		preview_container.appendChild(dlg_buttons_container);
		
		if (preference)
		{
			var _temp = JSON.parse(preference);
			hsl.h = _temp.h;
			hsl.s = _temp.s;
			hsl.l = _temp.l;
			hsl.a = _temp.a;
		}
		else
		{
			// default values
			
			hsl.h = 180;
			hsl.s = 50;
			hsl.l = 50;
			hsl.a = 100;
		}
		
		opacityTextbox.value = hsl.a;

		hsl_boxes[0].value = hsl.h;
		hsl_boxes[1].value = hsl.s;
		hsl_boxes[2].value = hsl.l;

		// update RGB texboxes
		
		_rgb = new hslToRgb(hsl.h, hsl.s, hsl.l);
		
		rgb_boxes[0].value = _rgb.r;
		rgb_boxes[1].value = _rgb.g;
		rgb_boxes[2].value = _rgb.b;
		
		hexTextBox.value = rgbToHex(_rgb.r, _rgb.g, _rgb.b);
		
		moveCursors();
		updatePreview();
		satOpacity();
		
		hueEvents = new mouseListeners(hueHbox);
		satEvents = new mouseListeners(satStack);
		opacityEvents = new mouseListeners(opacityStack);

		colorPickerOpen = true;
	}
	
	this._init();
}