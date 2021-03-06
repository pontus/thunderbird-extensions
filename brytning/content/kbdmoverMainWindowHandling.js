
function runAfterLoad (e) {

  var pref = Components.classes["@mozilla.org/preferences-service;1"].
             getService(Components.interfaces.nsIPrefBranch);

  var funcs = new Array('move', 'copy', 'goto');
 
  for (var i=0; i<funcs.length; i++)
    {
      var which = funcs[i];
      try 
	{
	  var k = document.getElementById("key_kbdmover_"+which);
	  
	  // Handle lack of settings.
	  var key = pref.getCharPref("kbdmover."+which+".key");
	  var mods = pref.getCharPref("kbdmover."+which+".mods");
	  
	  if (key.length == 1)
	    k.setAttribute('key', key);
	  else
	    {
	      k.removeAttribute('key');
	      k.setAttribute('keycode',key);
	    }
	  k.setAttribute('modifiers',mods);
	  
	  
	}
      catch (except)
	{
	  kbdmover.myDump("No pref for "+which+" key, ignoring.");
	}
      
    }
}

window.addEventListener('load', runAfterLoad, false);


