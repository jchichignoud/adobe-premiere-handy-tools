/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe. 
**************************************************************************/
#include "PPro_API_Constants.jsx"

$._PPRO_={

	rootFolder: undefined,

	getSequenceID : function() {
		return app.project.activeSequence.projectItem.nodeId;
	},

	getVersionInfo : function() {
		return 'PPro ' + app.version + 'x' + app.build;
	},

	getUserName : function() {
		var	homeDir		= new File('~/');
		var	userName	= homeDir.displayName;
		homeDir.close();
		return userName;
	},

	getSep : function() {
		if (Folder.fs == 'Macintosh') {
			return '/';
		} else {
			return '\\';
		}
	},

	saveProject : function() {
		app.project.save();
	},

	///////////////////////////
	////DUPLICATE ACTIVE//////
	/////////////////////////

	duplicateActive : function() {
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
			if (parseFloat(app.version) >= 13){
				oldSeq.close();
				$._PPRO_.lockAllSequenceTracks(oldSeq);
			}
			app.setSDKEventMessage(oldSeq.name + " has been duplicated and renamed to: " + newSeq.name, 'info')
		} else {
			app.setSDKEventMessage("No active sequence to duplicate", 'error')
		}
	},

	snapshotSequence : function (date) {
		var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
		if (ExternalObject.AdobeXMPScript === undefined) {
			ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		}

		var addNotes = function(activeSeq, note) {
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
			if (parseFloat(app.version) >= 13){
					newSeq.close();
					$._PPRO_.lockAllSequenceTracks(newSeq);
			}
			app.setSDKEventMessage("Sequence " + oldSeq.name + " has been archived with the note: " + description, 'info')
		} else {
			app.setSDKEventMessage("No active sequence to snapshot", 'error')
		}
	},

	snapshotNavigator : function () {
		prompt('Recent Snapshots of "TRT_BrandEdit" \n************\n(01) Version to client (3h ago)\n(02) New track (6h ago)\n(03) Added VO (2d ago)\n************\n\n Enter digits to open Snapshot',	 '', 'Sequence Naming Prompt');
	},

	lockAllSequenceTracks : function(sequence) {
		for ( var a=0; a < sequence.videoTracks.numTracks; a++){
			sequence.videoTracks[a].setLocked()
		};
		for ( var b=0; b < sequence.audioTracks.numTracks; b++){
			sequence.audioTracks[b].setLocked()
		}
	},

	// takes in id, returns containing bin
	findContainingBin : function(id) {
		var binLocation = undefined;
		var checkEachProjectItem = function (container) {
			if (container.children) {
				for (var i = 0; i < container.children.numItems; i++) {
					if (container.children[i].nodeId === id) {
						binLocation = container;
						return
					} else if (container.children[i].children){
						checkEachProjectItem(container.children[i])
					}
				}
			}
		};

		checkEachProjectItem(app.project.rootItem);
		return binLocation;
	},

	//returns location of the bin (whether it exists or has been specifically created)
	findOrCreateSubBin : function(sequenceBin, subBinName) {
		for (var i = 0; i < sequenceBin.children.numItems; i++) {
			if (sequenceBin.children[i].name === subBinName) {
				return sequenceBin.children[i];
			}
		}
		return sequenceBin.createBin(subBinName);
	},

	setOfflineWhenProxied : function(startingBin){
		var total = 0;
		var checkAllForProxies = function (start) {
			for (var k = 0; k < start.children.numItems; k++){
				var currentChild = start.children[k];
				if (currentChild){
					if (currentChild.type === ProjectItemType.BIN){
						checkAllForProxies(currentChild);		// warning; recursion!
					} else if (currentChild.hasProxy()) {
						currentChild.setOffline()
						total ++;
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

	setAllProjectItemsOnline : function(startingBin){
		for (var k = 0; k < startingBin.children.numItems; k++){
			var currentChild = startingBin.children[k];
			if (currentChild){
				if (currentChild.type === ProjectItemType.BIN){
					$._PPP_.setAllProjectItemsOnline(currentChild);		// warning; recursion!
				} else if (currentChild.isOffline()){
					currentChild.changeMediaPath(currentChild.getMediaPath(), false);
                    if (currentChild.isOffline()){
                         $._PPP_.updateEventPanel("Failed to bring \'" + currentChild.name + "\' online.");
                    } else {
                         $._PPP_.updateEventPanel("\'" + currentChild.name + "\' is once again online.");
                    }
				}
			}
		}
		return false
	},

	fillFrame : function() {
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
	getSize : function(item) {
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

	///////////////////////////
	////IMPORT MONITORING/////
	/////////////////////////

	onItemAddedToProject : function(whichProject, addedProjectItem) {
		var folder = $._PPRO_.rootFolder.fsName;
		var file = addedProjectItem.getMediaPath();
		if (file.indexOf(folder) != 0) {
			app.setSDKEventMessage(addedProjectItem.name + " isn't stored within your selected root folder (" + folder + ")", 'warning')
		}
	},

	registerItemAddedFxn : function() {
		$._PPRO_.rootFolder = Folder.selectDialog("Which root folder should contain all assets for this project?");
		app.onItemAddedToProjectSuccess = $._PPRO_.onItemAddedToProject;
		return true
	}	
};
