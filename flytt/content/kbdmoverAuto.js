
function addElements(kbdmover,l,search) 
{
  
  var numslashes = 0;
  
  if (0 == search.length)  //Empty string?
    return;

  for (var j=0; j<search.length; j++)
    {
      if (search.charAt(j) == '/')
	numslashes++;
    }
  
  var result = Components.classes['@mozilla.org/autocomplete/results;1'].createInstance().QueryInterface(Components.interfaces.nsIAutoCompleteResults);
  
  
  var ignorecase = 0;
  var pref = Components.classes["@mozilla.org/preferences-service;1"].
             getService(Components.interfaces.nsIPrefBranch);

  try 
    {
      var cb = document.getElementById("ignorecase");
      kbdmover.ignorecase = cb.checked
      pref.setCharPref("kbdmover.ignorecase", kbdmover.ignorecase);
    }
  catch (except)
    {
      kbdmover.myDump("Failed while updating kbdmover.ignorecase pref");
    }


  var s = kbdmover.matchingFolders( search );

  result.defaultItemIndex = 0;
  result.param = null;

  var common = 0;
  var mindepth = numslashes;
  
  for (j=0; j<s.names.length; j++)
    {         
      for (var i=0;i<s.names.length; i++)
  	{
  	  var thisone = 0;
  
  	  if (i != j)
	    if (s.names[i] == s.names[j])
	      {
		// Same name, check paths
		thisone = 0;
		
		var p1 = s.paths[i].split('/').reverse();
		var p2 = s.paths[j].split('/').reverse();
		
		// Find how many common parts we have in the path.
		while (p1[thisone] == p2[thisone] )
		  thisone++;
		
		if (common < (thisone+1))
		  common = thisone+1;
	      }
  	}
    }

  if (mindepth<common)
    mindepth = common;



  for (var i=0; i<s.names.length; i++) 
    {

      var or = Components.classes['@mozilla.org/autocomplete/item;1'].createInstance().QueryInterface(Components.interfaces.nsIAutoCompleteItem);
      var prefix = '';



      if (mindepth > 0 )
	{
	  var a = s.paths[i].split('/').reverse();


	  for (j=0; j<mindepth; j++)
	    {
	      prefix = prefix +a[j] +'/';
	    }
	}

      or.value = prefix+s.names[i];
      or.comment = "Din kommentar "+i;
      kbdmover.myDump(s.paths+" pi:"+s.paths[i]);
      or.param = null; //s.paths[i];
      or.className = '';

      result.items.AppendElement(or);

    }
    
    result.searchString = search;

    l.onAutoComplete(result,Components.interfaces.nsIAutoCompleteStatus.matchFound);

 }



var completer = {
  onStartLookup : function(search, presult, l)
  {	
    
 
    var kbdmover = window.arguments[0];
    addElements(kbdmover,l,search);

  },


  onAutoComplete : function(s, presult, l)
  {	
    var kbdmover = window.arguments[0];   
    addElements(kbdmover,l,s);
  },

  onStopLookup : function()
  {
    // var kbdmover = window.arguments[0];

  }
};
