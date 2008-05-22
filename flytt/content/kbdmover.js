


var kbdmover = {

  names : new Array(),
  uris : new Array(),
  paths : new Array(),
  folders : new Array(),
  rescanned: false,
  ignorecase: false,
  last: "",

  myDump: function (aMessage) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
    .getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("kbdmover: " + aMessage);
  },
  
  
  clear: function() 
  {
    this.names = new Array();
    this.uris = new Array();
    this.paths = new Array();
    this.folders = new Array();
  },
  
  scanFolders: function()
  {
    
    if (this.names.length != 0)  // Already have our structures?
    return;

    this.ignorelist = '';

    try 
    {
      // Handle lack of settings.
      this.ignorelist = pref.getCharPref("kbdmover.ignorelist");
    }
    catch (except)
    {
      this.myDump("Didn't find preference kbdmover.ignorelist, ignoring.");
    }

  
    this.myDump("Scanning...");

    var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
    .getService(Components.interfaces.nsIMsgAccountManager);

    var allServers = accountManager.allServers;
    var seenServers = new Array();

    for (var i=0;i<allServers.Count();i++)
    {
      var currentServer = allServers.GetElementAt(i)
	.QueryInterface(Components.interfaces.nsIMsgIncomingServer);


      if ( seenServers.indexOf(currentServer.rootFolder.URI) == -1)
      {
	// Only do if not in ignorelist
	seenServers.push(currentServer.rootFolder.URI);
	this.mapFolder(currentServer.rootFolder, "");
      }
    }

  },

 mapFolder: function(folder, path)
  {

    if (-1 != this.ignorelist.indexOf(folder.URI))
    return;
    

    // this.myDump("Checking " + folder.name+ " uri: "+folder.URI);
    this.names.push( folder.name );
    this.uris.push( folder.URI ); 
    this.paths.push( path );
    this.folders.push( folder );
  
    if( folder.hasSubFolders )
    { 
      var en = folder.GetSubFolders();
      
      try
	{
	  while ( ! en.isDone() )
	    { 
	      var next = en.currentItem();
	      if (next)
		{
		  var nf = next.QueryInterface(Components.interfaces.nsIMsgFolder);
		  
		  this.mapFolder(nf, path+"/"+folder.name);	
		}
	      en.next();
	    }
	  
	} 
      catch (except) 
	{	
	}
    }
  
  },


 longestCommonString: function(v)
  {
    var s = "";

    if (0 == v.length)
    return "";

    var longestCommon = Infinity;
    for (var i=0; i<v.length; i++)
    {
      for (var j=0; j<v.length; j++)
	{
	  var loopTo = Math.min( Math.min(longestCommon, 
					  v[i].length),
				 v[j].length );

	  longestCommon = loopTo;

	  for (var k=0; k<=loopTo; k++)
	    {
	      if( v[i].length > k &&
		  v[j].length > k)
		{
		  var x = v[i][k];
		  var y = v[j][k];

		  if (this.ignorecase)
		    {
		      x = x.toLowerCase();
		      y = y.toLowerCase();
		    }
		  
		  if (x != y)
		    {
		      longestCommon = k;
		      break;
		    }
		}
	      else
		{
		  longestCommon = k;
		  break;
		}
	    }
	  
	}
    }

    return v[0].substring(0, longestCommon);
   
  },



  matchingFolders: function(s)
  {
      var ret = new Object();
      ret.unique = 0;
      ret.complete = 0;
      ret.names = new Array();
      ret.uris = new Array();
      ret.folders = new Array();
      ret.paths = new Array();
      ret.fullpaths = new Array();
      
      var flag = '';

      if (this.ignorecase)
        flag = 'i';

      var re = new RegExp("/"+s.replace("/","[^/]*/","g")+"[^/]*$",flag);


      for (var i=0; i<this.paths.length; i++)
      {
	var p = this.paths[i]+"/"+this.names[i];
	if (re.test(p))
	  {
	    ret.names.push( this.names[i] );
	    ret.uris.push( this.uris[i] );
	    ret.folders.push( this.folders[i] );
	    ret.paths.push( this.paths[i] );
	    ret.fullpaths.push( p );
	  }
      }
      
      // Need to recalculate completedName
      
      ret.completedName = "";

      // First create a vector of vectors with 
      var tmpv = new Array();
      var common;
      var n = 0;

      for (i=0; i<s.length; i++) // Count number of slashes in s
      if (s.charAt(i) == '/')
      n++;

      for (i=0; i<ret.paths.length; i++)
      {
	var v = ret.paths[i].split("/");
	v.push(ret.names[i]);
	v.reverse();
	v = v.slice(0, n+1);
	v.reverse();

	tmpv.push(v);
      }


      for (i=0; i<=n; i++)
      {
	var tmpq = new Array();
	for (j=0; j<tmpv.length; j++)
	  if (tmpv[j][i])
	    tmpq.push(tmpv[j][i]);


	common = this.longestCommonString(tmpq); 
	ret.completedName = ret.completedName + "/" + common;

	if (i == n) // Last part of name?
	  for (j=0; j<ret.names.length; j++)
	    if (ret.names[j] == common)
 	      ret.complete = 1;


      }
      
      ret.completedName = ret.completedName.substring(1);


      if (ret.paths.length == 1)
      {
	ret.unique = 1;
	ret.complete = 1;
      }

      return ret;
  },



}


kbdmover.scanFolders();


function kbdretWrapper(ret) {
  this.uri = ret.uri;
  this.k = ret.k;
}

kbdretWrapper.prototype.getAttribute = function(name) {
    return this.uri;
}

kbdretWrapper.prototype.toString = function() {
    return this.uri;
}

function kbdmoverMoveCallback(ret)
{
  var a = new kbdretWrapper(ret);
  kbdmover.myDump( "Moving to "+ret.uri );
  
  MsgMoveMessage( a );
}

function kbdmoverCopyCallback(ret)
{

  var a = new kbdretWrapper(ret);
  kbdmover.myDump( "Copying to "+ret.uri ); 
  MsgCopyMessage( a );
}

function kbdmoverGotoCallback(ret)
{
  var a = new kbdretWrapper(ret);
  kbdmover.myDump( "Going to "+ret.uri );
  SelectFolder(ret.uri);  
}




function kbdmoverMoveMail()
{
  var ret = new Object();

  var w =  window.openDialog("chrome://kbdmover/content/kbdmoverDialog.xul",
			 "kbdmover",
			 "chrome", 
			 kbdmover, ret, kbdmoverMoveCallback, gDBView,'move');

}

function kbdmoverCopyMail()
{
  var ret = new Object();

  var w =  window.openDialog("chrome://kbdmover/content/kbdmoverDialog.xul",
			 "kbdmover",
			 "chrome", 
			 kbdmover, ret, kbdmoverCopyCallback, gDBView,'copy');

}

function kbdmoverGoto()
{
  var ret = new Object();

  var w =  window.openDialog("chrome://kbdmover/content/kbdmoverDialog.xul",
			 "kbdmover",
			 "chrome", 
			 kbdmover, ret, kbdmoverGotoCallback, gDBView,'goto');

}
