all: install.rdf
	rm -f chrome/kbdmover.jar && \
	zip -u chrome/kbdmover.jar content/*.xul && \
	zip -u chrome/kbdmover.jar content/*.rdf && \
	zip -u chrome/kbdmover.jar content/*.js && \
	zip -u chrome/kbdmover.jar content/*.png && \
	zip -u chrome/kbdmover.jar locale/* locale/*/*.dtd && \
	zip -u chrome/kbdmover.jar locale/*/*.rdf && \
	zip -u chrome/kbdmover.jar locale/*/*.properties && \
	zip -u chrome/kbdmover.jar defaults/* defaults/*/* && \
	rm -f ../kbdmover.xpi && \
	zip -u ../kbdmover.xpi install.rdf \
		chrome/kbdmover.jar \
		defaults/*/* defaults/*

