
function trim(s)
{
  // Stolen from CustomHeaders.js

  if (!s) return "";
  return s.replace(/(^\s+)|(\s+$)/g, '');
}

function extractEmail(s)
{

  var start = s.indexOf('<');
  var end = s.indexOf('>');

  if (-1 == start) // Just an e-mail address
    return s;

  if (-1 == end && start != -1) // Faulty
    return s.substring(start+1,s.length)

  return s.substring(start+1,end);
}

function searchFolder(k, name)
{
  k.myDump("searchfolder "+name);

  if (!name.length)
    return "";

  var ret;
  var casestore = k.ignorecase;

  k.ignorecase = false;
  ret = k.matchingFolders( name );
  k.ignorecase = casestore;

  if (ret.complete)
    return ret.completedName;

  k.ignorecase = true;
  ret = k.matchingFolders( name );
  k.ignorecase = casestore;

  if (ret.complete)
    return ret.completedName;

  // Found nothing
  return "";
}

function refresh()
{
  var kbdmover = window.arguments[0];
  kbdmover.clear();
  kbdmover.myDump("Rescanning");
  kbdmover.scanFolders();
  kbdmover.rescanned = true;
}


function init()
{
  var gDBView = window.arguments[3];
  var kbdmover = window.arguments[0];
  var action = window.arguments[4];

  var bundle = document.getElementById("kbdmoverDialogbundle");

  
  var labelTxt;

  switch (action) 
    {
      case 'goto':
	labelTxt =  bundle.getString( "GotoFolder" );
	break;

    case 'copy':
	labelTxt =  bundle.getString( "CopyMessageTo" );
	break;

    case 'move':
	labelTxt =  bundle.getString( "MoveMessageTo" );
	break;
      
    }
//  document.getElementById("kbdmoverDest").addSession(AutoCompleteSession);
  document.getElementById("kbdmoverDest").addSession(completer);
 

  if (!kbdmover.rescanned)
    {
      // Things aren't properly initialised the first time.

      kbdmover.clear();
      kbdmover.myDump("Rescanning");
      kbdmover.scanFolders();
      kbdmover.rescanned = true;
    }

  if (gDBView && gDBView.numSelected != 1)
    {
    if (action == 'copy')
      labelTxt = bundle.getFormattedString( "CopyMessagesTo", [gDBView.numSelected] );
    if (action == 'move')
      labelTxt = bundle.getFormattedString( "MoveMessagesTo", [gDBView.numSelected] );
    }

  var e = document.getElementById("textboxLabel");
  e.value = labelTxt;

  
  document.title = labelTxt;

  var e = document.getElementById("caption");
  e.setAttribute('label', labelTxt);

  // TODO: Setup completion.

  var f = document.getElementById("kbdmoverDest");
  var pref = Components.classes["@mozilla.org/preferences-service;1"].
             getService(Components.interfaces.nsIPrefBranch);

  try 
    {
      // Handle lack of settings.
      var igncase = pref.getCharPref("kbdmover.ignorecase");

      var cb = document.getElementById("ignorecase");
      cb.checked = igncase;
    }
  catch (except)
    {
      kbdmover.myDump("Didn't find preference kbdmover.ignorecase, ignoring.");
    }

  // Fill in suggested value, branches may return, so this should be the last part of init.

  var abook = Components.classes["@mozilla.org/abmanager;1"].
                  getService(Components.interfaces.nsIAbManager);

  var dirs = abook.directories.getService(Components.Interfaces.nsISimpleEnumerator);

  var database = 0;

  if (dirs.hasMoreElements())
      database = dirs.getNext().getService(Components.Interfaces.nsIAbDirectory);
 
  var hdr;

  var s = "";

  try 
    {
      // Handle lack of settings.
      s = pref.getCharPref("kbdmover.suggest");
    }
  catch (except)
    {
      kbdmover.myDump("Didn't find preference kbdmover.suggest, skipping suggestions.");
    }


  var abchecks = [ 'nick', 'nickName',
		   'category', 'category',
		   'company', 'company',
		   'screenname', 'aimScreenName',
		   'custom1', 'custom1',
		   'custom2', 'custom2',
		   'custom3', 'custom3',
		   'custom4', 'custom4',
		   'department', 'department',
		   'displayname', 'displayName',
		   'familyname', 'familyName',
		   'firstname', 'firstName',
		   'homecity', 'homeCity',
		   'homecountry', 'homeCountry',
		   'homestate', 'homeState',
		   'jobtitle', 'jobTitle',
		   'lastname', 'lastName',
		   'notes', 'notes',
		   'phoneticfirstname', 'phoneticFirstName',
		   'phoneticlastname', 'phoneticLastName',
		   'spousename', 'spouseName',
		   'workcity', 'workCity',
		   'workcountry', 'workCountry',
		   'workstate', 'workState'
  ];

  if (s)
    {
      var a = s.split(',');
      for (var i = 0; i != a.length; i++)
	{
	  var current = trim(a[i]);
	  
	  if (gDBView && gDBView.numSelected == 1)
	    {
	      // Just one message - we can do things based on header.
	      
	      hdr = gDBView.hdrForFirstSelectedMessage;
	      
	      kbdmover.myDump("hdr.author "+hdr.author);

	      // Check the sender first.
	      
	      var sc = database.getCardFromAttribute(dir, "PrimaryEmail", trim(hdr.author), true);
	      
	      if (!sc)
		sc =  database.getCardFromAttribute(dir, "PrimaryEmail", trim(extractEmail(hdr.author)), true);
	      
	      if (!sc)
		sc =  database.getCardFromAttribute(dir, "SecondEmail", trim(hdr.author), true);
	  
	      if (!sc)
		sc =  database.getCardFromAttribute(dir, "SecondEmail", trim(extractEmail(hdr.author)), true);

	      if (!sc)
		kbdmover.myDump( "Failed to find address book card for sender "+hdr.author+ 
				 " (tried "+hdr.author+" and "+extractEmail(hdr.author)+")" );

	      if (sc)
		for (var j = 0; j < abchecks.length; j = j+2)
		  {
		    if ('sender'+abchecks[j] == current.toLowerCase())
		      {
			  kbdmover.myDump( "Doing check "+abchecks[j]+" for sender "+hdr.author +" value: "+sc[abchecks[j+1]] );
			f.value = searchFolder(kbdmover,sc[abchecks[j+1]]);
			if (f.value)
			  return;	        
		      }
		  }
	      
	  
	      var recpt = (hdr.recipients+hdr.ccList).split(',');
	      
	      for (var k = 0; k < recpt.length; k++)
		{
		  sc = database.getCardFromAttribute(dir, "PrimaryEmail", trim(recpt[k]), true);
	      
		  if (!sc)
		    sc =  database.getCardFromAttribute(dir, "PrimaryEmail", trim(extractEmail(recpt[k])), true);
		  
		  if (!sc)
		    sc =  database.getCardFromAttribute(dir, "SecondEmail", trim(recpt[k]), true);
		  
		  if (!sc)
		    sc =  database.getCardFromAttribute(dir, "SecondEmail", trim(extractEmail(recpt[k])), true);
		  
	   if (!sc)
                kbdmover.myDump( "Failed to find address book card for reciever "+recpt[k]);


		  if (sc)		      
		    for (j = 0; j < abchecks.length; j = j+2)
		      {
			if ('receiver'+abchecks[j] == current.toLowerCase())
			  {
                          kbdmover.myDump( "Doing check "+abchecks[j]+" for reciever "+recpt[k] +" value: "+sc[abchecks[j+1]] );

			    f.value = searchFolder(kbdmover,sc[abchecks[j+1]]);
			    if (f.value)
			      return;	        
			  }
		      }		  
		}
	    }
	    
	    // Check things we can do without the headers
	    
	    if (current &&   // String to suggest
		current.charAt(0) == '"' &&
		current.charAt(current.length-1) == '"')
	    {
	      f.value = current.substr(1, current.length-3);
	      return;
	    }
	    
	    switch (current.toLowerCase())
	    {
	      case "last":
	      f.value = kbdmover.last;
	      return;
	    }	    
	  }      
    }
}

function handleKey(e)
{
  if (e && e.type == 'keypress' && e.keyCode == 13) // Return pressed?
	document.getElementById("kbdmoverDialog").acceptDialog();
     
}

function doIdle()
{
  var kbdmover = window.arguments[0];

  var ambig = document.getElementById("ambig");
  var bundle = document.getElementById("kbdmoverDialogbundle");

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

  var e = document.getElementById("kbdmoverDest");
  
  if (!e.value)
    return;

  var s = kbdmover.matchingFolders( e.value );
  kbdmover.p = 0;

  if (!s.complete) 
   {
     if (s.completedName.length > e.value.length)  // If the completion is longer, it's better!
       e.value = s.completedName;

     ambig.value = bundle.getString("AmbigComp");
     return false;
   }
  else
    {
      if (s.unique)
	{
	  // One single possible completion

	  e.value = s.completedName;
	  kbdmover.last = s.completedName;

 	  kbdmover.p = new Object();
	  kbdmover.p.uri = s.uris[0];
	  kbdmover.p.folder = s.folders[0];
	  kbdmover.p.gDBView = window.arguments[3];

	  ambig.value = bundle.getFormattedString("MovingTo",[s.names[0]]);
	}
      else
	{
	  // Multiple possible completions

	  var exactMatches = new Array();
	  var nextExactMatches = new Array();
	  var origValue = e.value;
	  var origNamepart = origValue;
	  var nextNamepart = s.completedName;

	  if (origNamepart.lastIndexOf("/") != -1)
	    origNamepart = origValue.substring(origValue.lastIndexOf("/")+1);

	  if (nextNamepart.lastIndexOf("/") != -1)
	    nextNamepart = s.completedName.substring(s.completedName.lastIndexOf("/")+1);

	  for (var i=0; i < s.names.length; i++)
	    {
	      if (s.names[i] == origNamepart)
		exactMatches.push([s.names[i],s.folders[i],i]);
	      if (s.names[i] == nextNamepart)
		nextExactMatches.push([s.names[i],s.folders[i],i]);
	    }

	  e.value = s.completedName;

	  if (exactMatches.length == 1)
	    {
	      i = exactMatches[0][2];
	      // Only one exact match
	      kbdmover.last = s.completedName;

	      kbdmover.p = new Object();
	      kbdmover.p.uri = s.uris[i];
	      kbdmover.p.folder = s.folders[i];
	      kbdmover.p.gDBView = window.arguments[3];
	      ambig.value = bundle.getFormattedString("MovingTo",[s.names[i]]);

	    }
	  else
	    {
	      if(nextExactMatches.length != 1)
		ambig.value = bundle.getFormattedString("AmbigName", [s.completedName]);
	      else
		ambig.value = bundle.getFormattedString("AmbigNameNext", [s.completedName]);

	      return false;
	    }
    
	}
    }


}

function doOK()
{
  var kbdmover = window.arguments[0];

  var ambig = document.getElementById("ambig");
  var bundle = document.getElementById("kbdmoverDialogbundle");

  var e = document.getElementById("kbdmoverDest");
  var s = kbdmover.matchingFolders( e.value );

  doIdle();
  if (kbdmover.p == 0)
    return false;
  else
    window.arguments[2](kbdmover.p);

  return true;
}

function doCancel()
{

  return true;
}

