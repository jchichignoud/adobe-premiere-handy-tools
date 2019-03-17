import { id } from "../shared";

// function showAlert() {
//   alert(`Alert from Extendscript.\n${new Date().toString()}`);
// }

// function getInfo() {
//   return JSON.stringify({
//     id,
//     name: app.getAppPrefPath,
//     version: app.version
//   });
// }

// $.global[id] = {
//   showAlert,
//   getInfo
// };

$._HELPERS_ = {

	//takes in string, returns a new string with incremented name
	incrementName: function (string) {
		const numberSplitRegex = /^(.*?)(\d+)$/g;
		var digitNumber = null;
		var splitNameArray = numberSplitRegex.exec(string);

		if (!splitNameArray) {
			// if there was no digit at the end of name, add _v2 to the new sequence name
			return string + "_v2"
		} else {
			let newNumber = parseInt(splitNameArray[2], 10) + 1;
			if (newNumber.toString().length > splitNameArray[2].length) {
				digitNumber = newNumber.toString().length;
			} else {
				digitNumber = splitNameArray[2].length;
			}
			newNumber = $._HELPERS_.padNum(newNumber, digitNumber)
			return splitNameArray[1] + newNumber;
		}
	},

	padNum: function (num, size) {
		var s = "000000000" + num;
		return s.substr(s.length - size);
	},

	getSep: function () {
		if (Folder.fs == 'Macintosh') {
			return '/';
		} else {
			return '\\';
		}
	},
};


$._PPRO_ = {
	
	getProjectNotes: function () {
		var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
		var fieldName = "HandyToolsProjectNotes";

		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}
		var xmp = new XMPMeta(app.project.rootItem.getProjectMetadata());
		// alert(JSON.stringify(app.project.rootItem.getProjectMetadata()))
		var editorState =  xmp.getProperty(kPProPrivateProjectMetadataURI, fieldName);
		return editorState
	},

	setProjectNotes: function (data) {
		var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
		var fieldName = "HandyToolsProjectNotes";

		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}

		var xmp = new XMPMeta(app.project.rootItem.getProjectMetadata());

		if(!xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, fieldName)) {
			app.project.addPropertyToProjectMetadataSchema(fieldName, "Handy Tools Project Notes",	2);
		}

		xmp.setProperty(kPProPrivateProjectMetadataURI, fieldName, JSON.stringify(data));
		var xmpAsString = xmp.serialize()
		app.project.rootItem.setProjectMetadata(xmpAsString, [fieldName]);
	},


	buttonClick: function () {
		alert("you clicked a button!")
	},

	rootFolder: undefined,

	getSequenceID: function () {
		return app.project.activeSequence.projectItem.nodeId;
	},

	getVersionInfo: function () {
		return 'PPro ' + app.version + 'x' + app.build;
	},

	getUserName: function () {
		var homeDir = new File('~/');
		var userName = homeDir.displayName;
		homeDir.close();
		return userName;
	},

	saveProject: function () {
		app.project.save();
	},

	///////////////////////////
	////DUPLICATE ACTIVE//////
	/////////////////////////

	duplicateActive: function () {
		var oldSeq = app.project.activeSequence;
		var newSeq = undefined;
		if (oldSeq) {
			var sequenceLocation = $._PPRO_.findContainingBin(oldSeq.projectItem.nodeId);
			oldSeq.clone();
			newSeq = app.project.activeSequence;
			newSeq.projectItem.name = $._HELPERS_.incrementName(oldSeq.name);
			newSeq.projectItem.moveBin(sequenceLocation);
			oldSeq.projectItem.moveBin($._PPRO_.findOrCreateSubBin(sequenceLocation, "_OLD"));

			// extra functions for Premiere 2019
			if (parseFloat(app.version) >= 13) {
				oldSeq.close();
				$._PPRO_.lockAllSequenceTracks(oldSeq);
			}
			app.setSDKEventMessage(oldSeq.name + " has been duplicated and renamed to: " + newSeq.name, 'info')
		} else {
			app.setSDKEventMessage("No active sequence to duplicate", 'error')
		}
	},

	snapshotSequence: function (date) {
		var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}

		var addNotes = function (activeSeq, note) {
			var xmp = new XMPMeta(activeSeq.projectItem.getProjectMetadata());
			xmp.setProperty(kPProPrivateProjectMetadataURI, 'Column.PropertyText.Description', $._PPRO_.getUserName() + ": " + note);
			var xmpAsString = xmp.serialize()
			activeSeq.projectItem.setProjectMetadata(xmpAsString, ['Column.PropertyText.Description']);
		}

		var oldSeq = app.project.activeSequence;
		if (oldSeq) {
			var sequenceLocation = $._PPRO_.findContainingBin(oldSeq.projectItem.nodeId);
			var newSeq = undefined;

			var description = prompt("Your notes for " + oldSeq.name, "") || "no notes";

			oldSeq.clone();
			newSeq = app.project.activeSequence;
			newSeq.projectItem.name = date + "_" + oldSeq.name;
			addNotes(newSeq, description);
			newSeq.projectItem.moveBin($._PPRO_.findOrCreateSubBin(sequenceLocation, "_SNAPSHOTS"));
			if (parseFloat(app.version) >= 13) {
				newSeq.close();
				$._PPRO_.lockAllSequenceTracks(newSeq);
			}
			app.setSDKEventMessage("Sequence " + oldSeq.name + " has been archived with the note: " + description, 'info')
		} else {
			app.setSDKEventMessage("No active sequence to snapshot", 'error')
		}
	},

	snapshotNavigator: function () {
		prompt('Recent Snapshots of "TRT_BrandEdit" \n************\n(01) Version to client (3h ago)\n(02) New track (6h ago)\n(03) Added VO (2d ago)\n************\n\n Enter digits to open Snapshot', '', 'Sequence Naming Prompt');
	},

	lockAllSequenceTracks: function (sequence) {
		for (var a = 0; a < sequence.videoTracks.numTracks; a++) {
			sequence.videoTracks[a].setLocked()
		};
		for (var b = 0; b < sequence.audioTracks.numTracks; b++) {
			sequence.audioTracks[b].setLocked()
		}
	},

	// takes in id, returns containing bin
	findContainingBin: function (id) {
		var binLocation = undefined;
		var checkEachProjectItem = function (container) {
			if (container.children) {
				for (var i = 0; i < container.children.numItems; i++) {
					if (container.children[i].nodeId === id) {
						binLocation = container;
						return
					} else if (container.children[i].children) {
						checkEachProjectItem(container.children[i])
					}
				}
			}
		};

		checkEachProjectItem(app.project.rootItem);
		return binLocation;
	},

	//returns location of the bin (whether it exists or has been specifically created)
	findOrCreateSubBin: function (sequenceBin, subBinName) {
		for (var i = 0; i < sequenceBin.children.numItems; i++) {
			if (sequenceBin.children[i].name === subBinName) {
				return sequenceBin.children[i];
			}
		}
		return sequenceBin.createBin(subBinName);
	},

	setOfflineWhenProxied: function (startingBin) {
		var total = 0;
		var checkAllForProxies = function (start) {
			for (var k = 0; k < start.children.numItems; k++) {
				var currentChild = start.children[k];
				if (currentChild) {
					if (currentChild.type === ProjectItemType.BIN) {
						checkAllForProxies(currentChild);		// warning; recursion!
					} else if (currentChild.hasProxy()) {
						currentChild.setOffline()
						total++;
						$._PPRO_.updateEventPanel("\'" + currentChild.name + "\' is now offline and using proxy media only");
					}
				}
			}
		}
		checkAllForProxies(startingBin)
		alert(total + " items have been offlined and are now using Proxies only \nUse 'Link Media' to set them back online")
		// telling Javascript the function is on so button can be updated
		return true
	},

	setAllProjectItemsOnline: function (startingBin) {
		for (var k = 0; k < startingBin.children.numItems; k++) {
			var currentChild = startingBin.children[k];
			if (currentChild) {
				if (currentChild.type === ProjectItemType.BIN) {
					$._PPP_.setAllProjectItemsOnline(currentChild);		// warning; recursion!
				} else if (currentChild.isOffline()) {
					currentChild.changeMediaPath(currentChild.getMediaPath(), false);
					if (currentChild.isOffline()) {
						$._PPP_.updateEventPanel("Failed to bring \'" + currentChild.name + "\' online.");
					} else {
						$._PPP_.updateEventPanel("\'" + currentChild.name + "\' is once again online.");
					}
				}
			}
		}
		return false
	},

	fillFrame: function () {
		var seq = app.project.activeSequence;
		var seqSize = $._PPRO_.getSize(seq);

		for (var tr = 0; tr < seq.videoTracks.numTracks; tr++) {
			var trackClips = seq.videoTracks[tr].clips;
			for (var cl = 0; cl < trackClips.numItems; cl++) {
				var clip = trackClips[cl]
				if (clip.isSelected()) {
					var clipSize = $._PPRO_.getSize(clip);
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
	},


	// takes in the active sequence or a sequence clip, returns object with width, height and ratio properties of the item
	getSize: function (item) {
		var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}
		var xmp = new XMPMeta(item.projectItem.getProjectMetadata())
		var sizeInfo = xmp.getProperty(kPProPrivateProjectMetadataURI, 'Column.Intrinsic.VideoInfo').toString().split(' ');
		var width = sizeInfo[0];
		var height = sizeInfo[2];
		return ({
			'width': width,
			'height': height,
			'ratio': (width / height)
		})
	},
}