/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

///////////////////////////////////
//////DUPLICATE AND INCREMENT//////
///////////////////////////////////


var sequenceLocation = app.project.rootItem.children[0];
var sequenceName = null;


function getSequenceID(){
    var seqID = app.project.activeSequence.projectItem.nodeId;
    return seqID;
}

function duplicateActive(){
	sequenceName = app.project.activeSequence.projectItem.name;
    findInProjectById(getSequenceID());
    app.project.activeSequence.clone();
    app.project.activeSequence.projectItem.name = incrementName(sequenceName);
    app.project.activeSequence.projectItem.moveBin(sequenceLocation);
}



function findInProjectById(id){
    sequenceLocation = app.project.rootItem;
    var checkEachProjectItem = function(element){
        for (var i = 0; i < element.children.numItems; i++){
            if (element.children[i].type === 2){
                checkEachProjectItem(element.children[i]);
            } else {
                if (element.children[i].nodeId === id){
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
function findOrCreateArchiveBin(sequenceBin){
	for (var i = 0; i < sequenceBin.children.numItems; i++){
		if (sequenceBin.children[i].name === "_OLD"){
			return sequenceBin.children[i];
		}
	}
	return sequenceBin.createBin("_OLD");
}

function incrementName(string){
	const numberSplitRegex = /^(.*?)(\d+)$/g;
	var digitNumber = null;
	var splitNameArray = numberSplitRegex.exec(string);
	newNumber = parseInt(splitNameArray[2], 10) + 1;
	if (newNumber.toString().length > splitNameArray[2].length){
		digitNumber = newNumber.toString().length;
	} else {
		digitNumber = splitNameArray[2].length;
	}
	newNumber = padNum(newNumber, digitNumber)
	return splitNameArray[1] + newNumber;
}


function padNum(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

///////////////////////////////////
//////////PROJECT BROWSER//////////
///////////////////////////////////

function getProjectsList() {
    return app.projects[0].name;
}

