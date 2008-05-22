all: install.rdf
	rm -f chrome/kbdmover.jar && zip -u chrome/kbdmover.jar content/*.{xul,rdf,js,png} locale/* locale/*/*.{dtd,rdf,properties} defaults/* defaults/*/* && rm -f ../kbdmover.xpi && zip -u ../kbdmover.xpi  install.rdf chrome/kbdmover.jar defaults/*/* defaults/*

