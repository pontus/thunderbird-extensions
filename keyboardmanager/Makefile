all: install.rdf
	rm -f chrome/keyboardmanager.jar && zip -u chrome/keyboardmanager.jar content/* locale/* locale/*/* locale/*/*/* defaults/* defaults/*/* && rm -f ../keyboardmanager.xpi && zip -u ../keyboardmanager.xpi  install.rdf chrome/keyboardmanager.jar defaults/*/* defaults/*

