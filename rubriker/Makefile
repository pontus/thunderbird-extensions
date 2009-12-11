all: install.rdf
	rm -rf chrome/*; mkdir -p chrome/locale && cp -pR content/* chrome/; cp -pR locale/* chrome/locale/ && rm -f ../headers-toggle.xpi && zip -9 -r ../headers-toggle.xpi  install.rdf chrome.manifest chrome defaults

