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

	getSequenceID : function() {
		alert(app.project.activeSequence.projectItem.nodeId)
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
			if (parseFloat(app.version) >= 13){
				oldSeq.close();
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
			}
			app.setSDKEventMessage("Sequence " + oldSeq.name + " has been archived with the note: " + description, 'info')
		} else {
			app.setSDKEventMessage("No active sequence to snapshot", 'error')
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
		for (var k = 0; k < startingBin.children.numItems; k++){
			var currentChild = startingBin.children[k];
			if (currentChild){
				if (currentChild.type === ProjectItemType.BIN){
					$._PPRO_.setOfflineWhenProxied(currentChild);		// warning; recursion!
				} else if (currentChild.hasProxy()) {
					currentChild.setOffline()
					$._PPRO_.updateEventPanel("\'" + currentChild.name + "\' is now offline and using proxy media only");
				}
			}
		}
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
					currentChild.changeMediaPath(currentChild.getMediaPath(), true);
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
		alert("get size");
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

	
	// projectPanelSelectionChanged : function(projectItems, viewID) {
		
	// 	var remainingArgs 	= projectItems.length;
	// 	var message			= "";

	// 	if (remainingArgs){
	// 		var message 		= remainingArgs + " items selected: ";
	// 		var view 			= viewID;
			
	// 		// Concatenate selected project item names, into message. 
	// 		for (var i = 0; i < projectItems.length; i++) {
	// 			message += projectItems[i].name;
	// 			remainingArgs--;
	// 			if (remainingArgs > 1) {
	// 				message += ', ';
	// 			}
	// 			if (remainingArgs === 1){
	// 				message += ", and ";
	// 			} 
	// 			if (remainingArgs === 0) {
	// 				message += ".";
	// 			}
	// 		}
	// 	} else {
	// 		message = '0 items selected.';
	// 	}
	// 	app.setSDKEventMessage(message, 'info');
	// },

	// registerProjectPanelSelectionChangedFxn : function() {
	// 	var success = app.bind("onSourceClipSelectedInProjectPanel", $._PPRO_.projectPanelSelectionChanged);
	// },		

	openInSource : function() {
		var filterString = "";
		if (Folder.fs === 'Windows'){
			filterString = "All files:*.*";
		}
		var fileToOpen = File.openDialog (	"Choose file to open.", 
											filterString, 
											false);
		if (fileToOpen) {
			app.sourceMonitor.openFilePath(fileToOpen.fsName);
			app.sourceMonitor.play(1.73); // playback speed as float, 1.0 = normal speed forward
			var position = app.sourceMonitor.getPosition(); // new in 13.0
			$._PPRO_.updateEventPanel("Current Source monitor position: " + position.seconds + " seconds.");		
			fileToOpen.close(); 
		} else {
			$._PPRO_.updateEventPanel("No file chosen.");		
		}
	},

	createSequence : function(name) {
		var someID	= "xyz123";
		var seqName = prompt('Name of sequence?',	 '<<<default>>>', 'Sequence Naming Prompt');
		app.project.createNewSequence(seqName, someID);
	},

	modifyProjectMetadata : function () {
		var kPProPrivateProjectMetadataURI	= "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";

		var namefield	= "Column.Intrinsic.Name";
		var tapename	= "Column.Intrinsic.TapeName";
		var desc		= "Column.PropertyText.Description";
		var logNote    	= "Column.Intrinsic.LogNote";
		var newField	= "ExampleFieldName";

		if (app.isDocumentOpen()) {
			var projectItem	= app.project.rootItem.children[0]; // just grabs first projectItem.
			if (projectItem) {
				if (ExternalObject.AdobeXMPScript === undefined) {
					ExternalObject.AdobeXMPScript	= new ExternalObject('lib:AdobeXMPScript');
				}
				if (ExternalObject.AdobeXMPScript !== undefined) {	// safety-conscious!
					var projectMetadata		= projectItem.getProjectMetadata();
					var successfullyAdded	= app.project.addPropertyToProjectMetadataSchema(newField, "ExampleFieldLabel",	2);

					var xmp	= new XMPMeta(projectMetadata);
					var obj	= xmp.dumpObject();

					// var aliases = xmp.dumpAliases();

					var namespaces					= XMPMeta.dumpNamespaces();
					var found_name					= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, namefield);
					var found_tapename				= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, tapename);
					var found_desc					= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, desc);
					var found_custom				= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, newField);
					var foundLogNote       			= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, logNote);
					var oldLogValue        			= "";
					var appendThis          		= "This log note inserted by PProPanel.";
					var appendTextWasActuallyNew	= false;
					 
					 if(foundLogNote){
						var oldLogNote = xmp.getProperty(kPProPrivateProjectMetadataURI, logNote);
						if (oldLogNote){
							oldLogValue = oldLogNote.value;
						}
					 }

					xmp.setProperty(kPProPrivateProjectMetadataURI, tapename, 	"***TAPENAME***");
					xmp.setProperty(kPProPrivateProjectMetadataURI, desc, 		"***DESCRIPTION***");
					xmp.setProperty(kPProPrivateProjectMetadataURI, namefield, 	"***NEWNAME***");
					xmp.setProperty(kPProPrivateProjectMetadataURI, newField, 	"PProPanel set this, using addPropertyToProjectMetadataSchema().");


					var array	= [];
					array[0]	= tapename;
					array[1]	= desc;
					array[2]	= namefield;
					array[3]	= newField;

					var concatenatedLogNotes = "";

					if (oldLogValue != appendThis){ 		// if that value is not exactly what we were going to add
						if (oldLogValue.length > 0){		// if we have a valid value
							concatenatedLogNotes += "Previous log notes: " + oldLogValue + "    ||||    ";
						}
						concatenatedLogNotes += appendThis;
						xmp.setProperty(kPProPrivateProjectMetadataURI, logNote, concatenatedLogNotes);
						array[4]    = logNote;
					}

					var str = xmp.serialize();
					projectItem.setProjectMetadata(str, array);

					// test: is it in there?

					var newblob		= projectItem.getProjectMetadata();
					var newXMP		= new XMPMeta(newblob);
					var foundYet	= newXMP.doesPropertyExist(kPProPrivateProjectMetadataURI, newField);

					if (foundYet){
						$._PPRO_.updateEventPanel("PProPanel successfully added a field to the project metadata schema, and set a value for it.");
					}
				}
			} else {
				$._PPRO_.updateEventPanel("No project items found.");
			}
		}
	},

	updatePAR : function() {
		var item = app.project.rootItem.children[0]; 
		if (item) {
			if ((item.type == ProjectItemType.FILE) || (item.type == ProjectItemType.CLIP)){
				// If there is an item, and it's either a clip or file...
				item.setOverridePixelAspectRatio(185,  100); // anamorphic is BACK!	  ;)
			} else {
				$._PPRO_.updateEventPanel('You cannot override the PAR of bins or sequences.');
			}
		} else {
			$._PPRO_.updateEventPanel("No project items found.");
		}
	},
	
	updateEventPanel : function(message) {
		app.setSDKEventMessage(message, 'info');
		//app.setSDKEventMessage('Here is some information.', 'info');
		//app.setSDKEventMessage('Here is a warning.', 'warning');
		//app.setSDKEventMessage('Here is an error.', 'error');  // Very annoying; use sparingly.
	},

	onEncoderJobComplete : function (jobID, outputFilePath) {
		var eoName;

		if (Folder.fs == 'Macintosh') {
			eoName = "PlugPlugExternalObject";							
		} else {
			eoName = "PlugPlugExternalObject.dll";
		}
				
		var suffixAddedByPPro	= '_1'; // You should really test for any suffix.
		var withoutExtension	= outputFilePath.slice(0,-4); // trusting 3 char extension
		var lastIndex			= outputFilePath.lastIndexOf(".");
		var extension			= outputFilePath.substr(lastIndex + 1);

		if (outputFilePath.indexOf(suffixAddedByPPro)){
			$._PPRO_.updateEventPanel(" Output filename was changed: the output preset name may have been added, or there may have been an existing file with that name. This would be a good place to deal with such occurrences.");
		}
				
		var mylib		= new ExternalObject('lib:' + eoName);
		var eventObj	= new CSXSEvent();

		eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
		eventObj.data	= "Rendered Job " + jobID + ", to " + outputFilePath + ".";

		eventObj.dispatch();
	},

	onEncoderJobError : function (jobID, errorMessage) {
		var eoName; 

		if (Folder.fs === 'Macintosh') {
			eoName	= "PlugPlugExternalObject";							
		} else {
			eoName	= "PlugPlugExternalObject.dll";
		}
				
		var mylib		= new ExternalObject('lib:' + eoName);
		var eventObj	= new CSXSEvent();

		eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
		eventObj.data	= "Job " + jobID + " failed, due to " + errorMessage + ".";
		eventObj.dispatch();
	},
	
	onEncoderJobProgress : function (jobID, progress) {
		$._PPRO_.updateEventPanel('onEncoderJobProgress called. jobID = ' + jobID + '. progress = ' + progress + '.');
	},

	onEncoderJobQueued : function (jobID) {
		app.encoder.startBatch();
	},

	onEncoderJobCanceled : function (jobID) {
		$._PPRO_.updateEventPanel('OnEncoderJobCanceled called. jobID = ' + jobID +  '.');
	},

	extractFileNameFromPath : function (fullPath){
		var lastDot	= fullPath.lastIndexOf(".");
		var lastSep	= fullPath.lastIndexOf("/");

		if (lastDot > -1){
			return fullPath.substr( (lastSep +1), (fullPath.length - (lastDot + 1)));
		} else {
			return fullPath;
		}
	},

	onProxyTranscodeJobComplete : function (jobID, outputFilePath) {
		var suffixAddedByPPro	= '_1'; // You should really test for any suffix.
		var withoutExtension	= outputFilePath.slice(0,-4); // trusting 3 char extension
		var lastIndex			= outputFilePath.lastIndexOf(".");
		var extension			= outputFilePath.substr(lastIndex + 1);

		var wrapper		= [];
		wrapper[0]		= outputFilePath;
		
		var nameToFind	= 'Proxies generated by PProPanel';
		var targetBin	= $._PPRO_.getPPPInsertionBin();
		if (targetBin){
			app.project.importFiles(wrapper);
		}
	},

	onProxyTranscodeJobError : function  (jobID, errorMessage) {
			$._PPRO_.updateEventPanel(errorMessage);
	},

	onProxyTranscodeJobQueued : function (jobID) {
		 app.encoder.startBatch();
	},

	insertOrAppend : function() {
		var seq = app.project.activeSequence;
		if (seq){
			var first = app.project.rootItem.children[0];
			if (first){
				 var numVTracks = seq.videoTracks.numTracks;
				 var targetVTrack = seq.videoTracks[(numVTracks - 1)];
				if (targetVTrack){
					// If there are already clips in this track,
					// append this one to the end. Otherwise, 
					// insert at start time.

					if (targetVTrack.clips.numItems > 0){
						var lastClip = targetVTrack.clips[(targetVTrack.clips.numItems - 1)];
						if (lastClip){
							targetVTrack.insertClip(first, lastClip.end.seconds);
						}
					}else {
							targetVTrack.insertClip(first, '00;00;00;00');
					}
				} else {
					$._PPRO_.updateEventPanel("Could not find first video track.");
				}
			} else {
				$._PPRO_.updateEventPanel("Couldn't locate first projectItem.");
			}
		} else {
			$._PPRO_.updateEventPanel("no active sequence.");
		}
	},

	overWrite : function() {
		var seq = app.project.activeSequence;
		if (seq){
			var first = app.project.rootItem.children[0];
			if (first) {
				var vTrack1 = seq.videoTracks[0];
				if (vTrack1){
					var now = seq.getPlayerPosition();
					vTrack1.overwriteClip(first, now.seconds);
				} else {
					$._PPRO_.updateEventPanel("Could not find first video track.");
				}
			} else {
				$._PPRO_.updateEventPanel("Couldn't locate first projectItem.");
			}
		} else {
			$._PPRO_.updateEventPanel("no active sequence.");
		}
	},

	getPPPInsertionBin : function () {
		var nameToFind = "Here's where PProPanel puts things.";

		var targetBin	= $._PPRO_.searchForBinWithName(nameToFind);

		if (targetBin === undefined) {
			// If panel can't find the target bin, it creates it.
			app.project.rootItem.createBin(nameToFind);
			targetBin	= $._PPRO_.searchForBinWithName(nameToFind);
		}
		if (targetBin) {
			targetBin.select();
			return targetBin;
		}
	},

	importMoGRT : function () {
		var activeSeq = app.project.activeSequence;
		if (activeSeq) {
			var filterString = "";
			if (Folder.fs === 'Windows'){
				filterString = "Motion Graphics Templates:*.mogrt";
			}
			var mogrtToImport	= 	File.openDialog (  "Choose MoGRT", 	// title
														filterString,	// filter available files? 
														false);			// allow multiple?
			if (mogrtToImport){
				var targetTime		= activeSeq.getPlayerPosition();
				var vidTrackOffset  = 0;
				var audTrackOffset	= 0;
				var newTrackItem 	= activeSeq.importMGT(	mogrtToImport.fsName, 
															targetTime.ticks, 
															vidTrackOffset,
															audTrackOffset);
				if (newTrackItem){
					var moComp = newTrackItem.getMGTComponent();
					if (moComp){
						var params			= 	moComp.properties;
						for (var z = 0; z < params.numItems; z++){
						   var thisParam = params[0];
						}
						var srcTextParam	=	params.getParamForDisplayName("Main Title");
						if (srcTextParam){
							var val	= srcTextParam.getValue();
							srcTextParam.setValue("New value set by PProPanel!");
						}
					}
				}
			} else {
				app.setSDKEventMessage('Unable to import ' + mogrtToImport.fsName + '.', 'error');  
			}
		} else {
			app.setSDKEventMessage('No active sequence.');  
		}
	},

	reportCurrentProjectSelection : function() {
		var viewIDs = app.getProjectViewIDs(); // sample code optimized for a single open project
		viewSelection = app.getProjectViewSelection(viewIDs[0]);
		$._PPRO_.projectPanelSelectionChanged(viewSelection, viewIDs[0]);
	},

	setAllProjectItemsOnline : function(startingBin){
		for (var k = 0; k < startingBin.children.numItems; k++){
			var currentChild = startingBin.children[k];
			if (currentChild){
				if (currentChild.type === ProjectItemType.BIN){
					$._PPRO_.setAllProjectItemsOnline(currentChild);		// warning; recursion!
				} else if (currentChild.isOffline()){
					currentChild.changeMediaPath(currentChild.getMediaPath(), true);
                    if (currentChild.isOffline()){
                         $._PPRO_.updateEventPanel("Failed to bring \'" + currentChild.name + "\' online.");
                    } else {
                         $._PPRO_.updateEventPanel("\'" + currentChild.name + "\' is once again online.");
                    }
				}
			}
		}
	},

	setAllOnline : function(){
		var startingBin = app.project.rootItem;
		$._PPRO_.setAllProjectItemsOnline(startingBin);
	},

	setOffline : function() {
		var viewIDs = app.getProjectViewIDs();
        for (var a = 0; a < app.projects.numProjects; a++){
            var currentProject = app.getProjectFromViewID(viewIDs[a]);
            if (currentProject){
                if (currentProject.documentID === app.project.documentID){	// We're in the right project!
                    var selectedItems = app.getProjectViewSelection(viewIDs[a]);
                    for (var b = 0; b < selectedItems.length; b++){
                        var currentItem = selectedItems[b];
                        if (currentItem){
                            if ((!currentItem.isSequence()) && (currentItem.type !== ProjectItemType.BIN)){ // For every selected item which isn't a bin or sequence...
                                if (currentItem.isOffline()){
									$._PPRO_.updateEventPanel("\'" + currentItem.name + "\'was already offline.");
								} else {
									var result = currentItem.setOffline();
									$._PPRO_.updateEventPanel("\'" + currentItem.name + "\' is now offline.");
								}
                            }
                        }
                    }
                }
            }
        }
	},
	
	updateFrameRate : function() {
		var item = app.project.rootItem.children[0]; 
		if (item) {
			if ((item.type == ProjectItemType.FILE) || (item.type == ProjectItemType.CLIP)){
				// If there is an item, and it's either a clip or file...
				item.setOverrideFrameRate(23.976); 
			} else {
				$._PPRO_.updateEventPanel('You cannot override the frame rate of bins or sequences.');
			}
		} else {
			$._PPRO_.updateEventPanel("No project items found.");
		}
	},

	onItemAddedToProject : function(whichProject, addedProjectItem) {
		var msg = addedProjectItem.name + " was added to " + whichProject + "."
		$._PPRO_.updateEventPanel(msg);
	},

	registerItemAddedFxn : function() {
		app.onItemAddedToProjectSuccess = $._PPRO_.onItemAddedToProject;
	},

	// myOnProjectChanged : function(documentID){
	// 	var msg = 'Project with ID ' + documentID + ' Changed.';
	// 	// Commented out, as this happens a LOT.
	// 	$._PPRO_.updateEventPanel(msg);
	// },

	// registerProjectChangedFxn : function() {
	// 	app.bind('onProjectChanged', $._PPRO_.myOnProjectChanged);
	// },

	confirmPProHostVersion : function() {
		var version = parseFloat(app.version);
		if (version < 12.1){
			$._PPRO_.updateEventPanel("Note: PProPanel relies on features added in 12.1, but is currently running in " + version + ".");
		}
	},

	myActiveSequenceChangedFxn : function() {
		$._PPRO_.updateEventPanel("Active sequence is now " + app.project.activeSequence.name + ".");
	},

	myActiveSequenceSelectionChangedFxn : function() {
		var sel = app.project.activeSequence.getSelection();
		$._PPRO_.updateEventPanel('Current active sequence = ' + app.project.activeSequence.name + '.');
		$._PPRO_.updateEventPanel( sel.length + ' track items selected.');
		for(var i = 0; i < sel.length; i++){
			if (sel[i].name !== 'anonymous'){
				$._PPRO_.updateEventPanel('Selected item ' + (i+1) + ' == ' + sel[i].name + '.');
			}
		}	
	},

	// registerActiveSequenceChangedFxn : function() {
	// 	var success = app.bind("onActiveSequenceChanged", $._PPRO_.myActiveSequenceChangedFxn);
	// },

	// registerSequenceSelectionChangedFxn : function() {
	// 	var success = app.bind('onActiveSequenceSelectionChanged', $._PPRO_.myActiveSequenceSelectionChangedFxn);
	// },

	closeAllProjectsOtherThanActiveProject : function() {
		var viewIDs = app.getProjectViewIDs(); 
		var closeTheseProjects = [];
		for (var a = 0; a < viewIDs.length; a++){
			var thisProj = app.getProjectFromViewID(viewIDs[a]);
			if (thisProj.documentID !== app.project.documentID){
				closeTheseProjects[a] = thisProj;
			}       
		}
		// Why do this afterward? Because if we close projects in that loop, we change the active project. :)
		for (var b = 0; b < closeTheseProjects.length; b++){
			$._PPRO_.updateEventPanel("Closed " + closeTheseProjects[b].name);
			closeTheseProjects[b].closeDocument();
		}
	},

	closeAllSequences : function() {
		var seqList = app.project.sequences;
		for (var a = 0; a < seqList.numSequences; a++){
			var currentSeq = seqList[a];
			if (currentSeq){
				currentSeq.close();
			} else {
				$._PPRO_.updateEventPanel("No sequences from " + app.project.name + " were open.");
			}
		}
	},

	reinterpretFootage : function() {
		var viewIDs = app.getProjectViewIDs();
		if (viewIDs){
			for (var a = 0; a < app.projects.numProjects; a++){
				var currentProject = app.getProjectFromViewID(viewIDs[a]);
				if (currentProject){
					if (currentProject.documentID === app.project.documentID){	// We're in the right project!
						var selectedItems = app.getProjectViewSelection(viewIDs[a]);
						if (selectedItems){
							for (var b = 0; b < selectedItems.length; b++){
								var currentItem = selectedItems[b];
								if (currentItem){
									if ((currentItem.type !== ProjectItemType.BIN) &&
										(currentItem.isSequence() === false)){ 
										var interp = currentItem.getFootageInterpretation();
										if (interp) {
											// Note: I made this something terrible, so the change is apparent.
											interp.frameRate = 17.868;
											interp.pixelAspectRatio = 1.2121;
											currentItem.setFootageInterpretation(interp);
										} else {
											$._PPRO_.updateEventPanel("Unable to get interpretation for " + currentItem.name + ".");
										}
										var mapping = currentItem.getAudioChannelMapping;
										if (mapping){
											mapping.audioChannelsType = AUDIOCHANNELTYPE_Stereo; 
											mapping.audioClipsNumber = 1;
											mapping.setMappingForChannel(0, 4); // 1st param = channel index, 2nd param = source index
											mapping.setMappingForChannel(1, 5);
											currentItem.setAudioChannelMapping(mapping); // submit changed mapping object
										}
									}
								} else {
									$._PPRO_.updateEventPanel("No project item available.");
								}
							}
						} else {
							$._PPRO_.updateEventPanel("No items selected.");
						}
					}
				} else {
					$._PPRO_.updateEventPanel("No project available.");
				}
			}
		} else {
			$._PPRO_.updateEventPanel("No view IDs available.");
		}
	}, 

	selectAllRetimedClips : function() {
		var activeSeq = app.project.activeSequence;
		var numRetimedClips = 0;
		if (activeSeq){
			var trackGroups			= [ activeSeq.audioTracks, activeSeq.videoTracks ];
			var trackGroupNames		= [ "audioTracks", "videoTracks" ];
			var updateUI			= true;

			for(var gi = 0; gi<2; gi++)	{
				group	= trackGroups[gi];
				for(var ti=0; ti<group.numTracks; ti++){
					var track		= group[ti];
					var clips		= track.clips;
					for(var ci=0; ci<clips.numTracks; ci++){
						var clip	= clips[ci];
						if (clip.getSpeed() !== 1){
							clip.setSelected(true, updateUI);
							numRetimedClips++;
						}
					}
				}
			}			
			$._PPRO_.updateEventPanel(numRetimedClips + " retimed clips found.");
		} else {
			$._PPRO_.updateEventPanel("No active sequence.");
		}
	},

	selectReversedClips : function() {
		var sequence		= app.project.activeSequence;
		var numReversedClips = 0;
		if (sequence){
			var trackGroups			= [ sequence.audioTracks, sequence.videoTracks ];
			var trackGroupNames		= [ "audioTracks", "videoTracks" ];
			var updateUI			= true;

			for(var gi = 0; gi<2; gi++)	{
				for(var ti=0; ti<group.numTracks; ti++){
					for(var ci=0; ci < group[ti].clips.numTracks; ci++){
						var clip = group[ti].clips[ci];
						var isReversed = clip.isSpeedReversed();
						if (isReversed){
							clip.setSelected(isReversed, updateUI);
							numReversedClips++;
						}
					}
				}
			}
			$._PPRO_.updateEventPanel(numReversedClips + " reversed clips found.");
		} else {
			$._PPRO_.updateEventPanel("No active sequence.");
		}
	},

	stitch : function(presetPath) {
		var viewIDs = app.getProjectViewIDs();
		var allPathsToStitch = "";

        for (var a = 0; a < app.projects.numProjects; a++){
            var currentProject = app.getProjectFromViewID(viewIDs[a]);
            if (currentProject){
                if (currentProject.documentID === app.project.documentID){	// We're in the right project!
                    var selectedItems = app.getProjectViewSelection(viewIDs[a]);
					if (selectedItems.length){
						for (var b = 0; b < selectedItems.length; b++){
							var currentItem = selectedItems[b];
							if (currentItem){
								if ((!currentItem.isSequence()) && (currentItem.type !== ProjectItemType.BIN)){ // For every selected item which isn't a bin or sequence...
									allPathsToStitch += currentItem.getMediaPath();
										allPathsToStitch += ";";
								}
							}
						}

						var AMEString = "var fe = app.getFrontend(); fe.stitchFiles(\"" + allPathsToStitch + "\"";
						var addendum = ", \"H.264\", \"" + presetPath + "\", "  + "\"(This path parameter is never used)\");";

						AMEString += addendum; 

						// 3. Send Command to AME for Export //
						var bt      = new BridgeTalk();
						bt.target   = 'ame';
						bt.body = AMEString;
						bt.send();


						
					}
                }
            }
        }
	},
};
