
function MsgViewToggleHeaders()
{
    if (!gDBView)
	gDBView = GetDBView();

    var currentheaders = gPrefBranch.getIntPref("mail.show_headers");
    var includeno = gPrefBranch.getBoolPref("headers-toggle.include_no_header");
    var newheaders;
    
    switch (currentheaders)
    {
    case 0:

	newheaders=1;
	var header = document.getElementById("messagePane").contentDocument.getElementById("headingwrapper");

	if (header)
	    header.style.display = "";
	break;

    case 1:
	newheaders=2;
	break;

    case 2:
	if (includeno)
 	{
	    newheaders=0;

	    hideHeaderView(gExpandedHeaderView);
	    var header = document.getElementById("messagePane").contentDocument.getElementById("headingwrapper");
	    if (header)
		header.style.display = "none";
	}
	else
	    newheaders=1;

	break;
    }

    gPrefBranch.setIntPref("mail.show_headers",newheaders);
    gPrefBranch.setIntPref("extensions.enigmail.show_headers",newheaders);

    if (gDBView)
	gDBView.reloadMessage();
    
    return true;
}
