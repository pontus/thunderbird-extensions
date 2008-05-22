
function addElements(kbdmover,l,search) 
{
  kbdmover.myDump( "addelements1" );
  
  var numslashes = 0;
  
  if (0 == search.length)  //Empty string?
    return;

  for (var j=0; j<search.length; j++)
    {
      if (search.charAt(j) == '/')
	numslashes++;
    }
  

  kbdmover.myDump( numslashes+" /" );

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

  kbdmover.myDump( "addelements2" );

  var s = kbdmover.matchingFolders( search );

  kbdmover.myDump( "addelements3 numsl: "+numslashes );
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
		kbdmover.myDump( "addelements equal:" + s.names[i]+' i: '+i+' j:'+j );
		// Same name, check paths
		thisone = 0;
		
		var p1 = s.paths[i].split('/').reverse();
		var p2 = s.paths[j].split('/').reverse();
		
		// Find how many common parts we have in the path.
		while (p1[thisone] == p2[thisone] )
		  thisone++;
		
		kbdmover.myDump( "thisone: "+thisone);

		if (common < (thisone+1))
		  common = thisone+1;
	      }
  	}
    }

  if (mindepth<common)
    mindepth = common;

      kbdmover.myDump( "addelements3 slash/:" + mindepth );

  for (var i=0; i<s.names.length; i++) 
    {
      kbdmover.myDump( "addelements3 slash/:" + mindepth );
      var or = Components.classes['@mozilla.org/autocomplete/item;1'].createInstance().QueryInterface(Components.interfaces.nsIAutoCompleteItem);
      var prefix = '';

      kbdmover.myDump( "addelements4" );

      if (mindepth > 0 )
	{
	  var a = s.paths[i].split('/').reverse();

	  kbdmover.myDump( "a: "+a );
	  for (j=0; j<mindepth; j++)
	    {
	      kbdmover.myDump('adding segment '+j+' val '+a[j]);
	      prefix = prefix +a[j] +'/';
	    }
	}

      or.value = prefix+s.names[i];
      or.comment = "Din kommentar "+i;
      kbdmover.myDump(s.paths+" pi:"+s.paths[i]);
      or.param = null; //s.paths[i];
      or.className = '';
      kbdmover.myDump( "addelements5" );
      result.items.AppendElement(or);
      kbdmover.myDump( "addelements6" );
    }
    
    result.searchString = search;

    l.onAutoComplete(result,Components.interfaces.nsIAutoCompleteStatus.matchFound);

 }



var completer = {
  onStartLookup : function(search, presult, l)
  {	
    
 
    var kbdmover = window.arguments[0];
    kbdmover.myDump( "onStartLookup s:"+search+" r:"+presult+" l:"+l );
 
    // l.onStatus("Seeking..");

    addElements(kbdmover,l,search);
    kbdmover.myDump( "Added elements.");
  },


  onAutoComplete : function(s, presult, l)
  {	
    var kbdmover = window.arguments[0];
    kbdmover.myDump( "onAutoComplete s:"+s+" r:"+presult+" l:"+l );
    
    try 
    {
      
    }
    catch (except)
    {
    }

    addElements(l);
  },

  onStopLookup : function()
  {
    var kbdmover = window.arguments[0];
    kbdmover.myDump( "onStopLookup");

  }
};
