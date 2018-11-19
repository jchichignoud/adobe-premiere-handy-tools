/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

if (ExternalObject.AdobeXMPScript === undefined) {
	ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
}

var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/"

///////////////////////////////////
//////DUPLICATE AND INCREMENT//////
///////////////////////////////////


var sequenceLocation = app.project.rootItem.children[0];
var sequenceName = null;

function getSequenceID() {
	return app.project.activeSequence.projectItem.nodeId;
}

function duplicateActive() {
	if (app.project.activeSequence) {
		sequenceName = app.project.activeSequence.projectItem.name;
		findInProjectById(getSequenceID());
		app.project.activeSequence.clone();
		app.project.activeSequence.projectItem.name = incrementName(sequenceName);
		app.project.activeSequence.projectItem.moveBin(sequenceLocation);
	} else {
		alert ("No Active Sequence")
	}
}


function findInProjectById(id) {
	sequenceLocation = app.project.rootItem;
	var checkEachProjectItem = function (element) {
		for (var i = 0; i < element.children.numItems; i++) {
			if (element.children[i].type === 2) {
				checkEachProjectItem(element.children[i]);
			} else {
				if (element.children[i].nodeId === id) {
					sequenceLocation = element
					element.children[i].moveBin(findOrCreateArchiveBin(sequenceLocation))
					return
				}
			}
		}
	}
	return checkEachProjectItem(app.project.rootItem);
}


//returns location of the bin
function findOrCreateArchiveBin(sequenceBin) {
	for (var i = 0; i < sequenceBin.children.numItems; i++) {
		if (sequenceBin.children[i].name === "_OLD") {
			return sequenceBin.children[i];
		}
	}
	return sequenceBin.createBin("_OLD");
}

function incrementName(string) {
	const numberSplitRegex = /^(.*?)(\d+)$/g;
	var digitNumber = null;
	var splitNameArray = numberSplitRegex.exec(string);

	if (!splitNameArray) {
		// if there was no digit at the end of name, add _v2 to the new sequence name
		return string + "_v2"
	} else {
		newNumber = parseInt(splitNameArray[2], 10) + 1;
		if (newNumber.toString().length > splitNameArray[2].length) {
			digitNumber = newNumber.toString().length;
		} else {
			digitNumber = splitNameArray[2].length;
		}
		newNumber = padNum(newNumber, digitNumber)
		return splitNameArray[1] + newNumber;
	}
}


function padNum(num, size) {
	var s = "000000000" + num;
	return s.substr(s.length - size);
}

///////////////////////////////////
////////////SNAPSHOT///////////////
///////////////////////////////////


function snapshotSequence(date, description) {
	sequenceName = app.project.activeSequence.projectItem.name;
	findInProjectById_v2(getSequenceID());
	app.project.activeSequence.clone();
	app.project.activeSequence.projectItem.name = date + "_" + sequenceName;
	addNotes(app.project.activeSequence, description);
	app.project.activeSequence.projectItem.moveBin(findOrCreateSnapshotsBin(sequenceLocation));
}


function findOrCreateSnapshotsBin(sequenceBin) {
	for (var i = 0; i < sequenceBin.children.numItems; i++) {
		if (sequenceBin.children[i].name === "_SNAPSHOTS") {
			return sequenceBin.children[i];
		}
	}
	return sequenceBin.createBin("_SNAPSHOTS");
}

function findInProjectById_v2(id) {
	sequenceLocation = app.project.rootItem;
	var checkEachProjectItem = function (element) {
		for (var i = 0; i < element.children.numItems; i++) {
			if (element.children[i].type === 2) {
				checkEachProjectItem(element.children[i]);
			} else {
				if (element.children[i].nodeId === id) {
					sequenceLocation = element;
					element.children[i].moveBin(sequenceLocation)
					return
				}
			}
		}
	}
	return checkEachProjectItem(app.project.rootItem);
}


function addNotes(activeSeq, note) {
	var xmp = new XMPMeta(activeSeq.projectItem.getProjectMetadata());
	xmp.setProperty(kPProPrivateProjectMetadataURI, 'Column.PropertyText.Description', note);
	var xmpAsString = xmp.serialize()
	activeSeq.projectItem.setProjectMetadata(xmpAsString, ['Column.PropertyText.Description']);
}

///////////////////////////////////
////////////FILL FRAME/////////////
///////////////////////////////////

function fillFrame() {
	var seq = app.project.activeSequence;
	var seqSize = getSize(seq);
	for (var tr = 0; tr < seq.videoTracks.numTracks; tr++) {
		var trackClips = seq.videoTracks[tr].clips;
		for (var cl = 0; cl < trackClips.numItems; cl++) {
			var clip = trackClips[cl]
			if (clip.isSelected()) {
				var clipSize = getSize(clip);
				var scale = clip.components[1].properties[1]
				if (clipSize.ratio > seqSize.ratio) {
					// clip is wider than sequence, should fit based on height
					scale.setValue((seqSize.height / clipSize.height * 100));
				} else {
					// clip is taller, should fit based on width
					scale.setValue((seqSize.width / clipSize.width * 100))
				}
			}
		}
	}
}


// takes in the active sequence or a sequence clip, returns object with width, height and ratio properties of the item
function getSize(item) {
	var xmp = new XMPMeta(item.projectItem.getProjectMetadata())
	var sizeInfo = xmp.getProperty(kPProPrivateProjectMetadataURI, 'Column.Intrinsic.VideoInfo').toString().split(' ');
	var width = sizeInfo[0];
	var height = sizeInfo[2]
	return ({
		'width': width,
		'height': height,
		'ratio': (width / height)
	})
}