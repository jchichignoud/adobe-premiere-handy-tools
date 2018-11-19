# PREMIERE HANDY TOOLS

## INTRODUCTION/WARNING

> This is a minimalist Premiere extension panel designed to be tucked away in a corner of your workspace and give you quick access to a few useful shortcuts. My plan is to add any new function to it I can come up with, within the limitations of the Adobe API, and of my own coding skills.
> 
> Please note I am not a professional developer and can't guarantee perfect experience with this panel. I have created it to help my own workflow and am sharing it (for free) because it might help people as much as it's been helping me. It is functional and reliable aside from the known issues listed below, but I can't take responsibility if it is used wrong. Always back up your project before having a play :) 

---

## HOW TO INSTALL (QUICK GUIDE)
- Enable unsigned extensions on your computer
- Download [ZIP](https://github.com/jchichignoud/adobe-premiere-handy-tools/archive/master.zip)
- Place unzipped folder in the Adobe extensions folder
 
## HOW TO INSTALL (FULL GUIDE)
For detailed instructions, follow steps 2 and 3 on [this page](https://github.com/Adobe-CEP/Samples/tree/master/PProPanel)

---

## SEQUENCE NEW VERSION

> One-Click option for something all editors do at least 10 times a day: duplicate a sequence and increment the version number (from "Edit 01" to "Edit 02" for example)

### INSTRUCTIONS
- Load sequence in Timeline (needs to be active, it won't work with a selected sequence in the Project Browser because of API limitations)
- Press "Duplicate Sequence +1" button
- Name of the sequence should end with a number, which will be automatically incremented, otherwise " v2" will be added to the end
- Original sequence will be placed in a sub-bin called "_OLD", which will be created if it doesn't exist
- New sequence becomes active
- [NEW] Old sequence is closed (Premiere 2019 only)

### RECENT FIXES
- Handling "No active sequence" scenario with an alert
- Automatically adding "_v2" to the end of sequence names that can't be incremented (when they don't end with a digit)
- Old sequence is closed (Premiere 2019 only)

### KNOWN ISSUES
- No known issues

--- 

## SEQUENCE SNAPSHOT

> Inspired by FCPX's Snapshots (down to stealing the name outright), the automatically creates a timestamped duplicate of the active sequence, and asks the user for a quick comment that is added to the Description metadata column, for easy referencing (and searching)

### INSTRUCTIONS
- Load sequence in Timeline (needs to be active, it won't work with a selected sequence in the Project Browser because of API limitations)
- Press "Sequence Snapshot" button
- Add a comment about the snapshot (version to client, music option #1, etc..)
- New sequence will be created, with the date and time of creation as prefix (in YYYYMMDD_HHmm format) and placed in a "_SNAPSHOTS" Subfolder (which will be created if it doesn't exist)
- Comment will be added to the Description metadata field, [NEW] preceded by username
- [NEW] Snapshot sequence is closed (Premiere 2019 only)

### KNOWN ISSUES
- On Premiere 2018, the Snapshot sequence becomes the focus. It should ideally be closed/locked, and not touched by the user.
- Some special characters, such as apostrophes, will break the code when input in the notes dialog box. It'll trigger an error message and the duplication will fail 

--- 

## FILL FRAME

> In Premiere, Set and Scale to frame size are very useful shortcuts for adjusting the size of one or more shots to the timeline, but when the shot and sequence have a different aspect ratios, it creates letter/pillarbox, which is rarely what you want it to do.
> 
> This shortcut scales any selected shot to fully fill the frame, cropping any extra vertical/horizontal resolution.

### INSTRUCTIONS
- Select one or more shots on the timeline
- Press button to have each shot fill the frame perfectly (will overwrite existing scaling)

### KNOWN ISSUES
- No way to "Undo". Save project before using the function and quit without saving if you need to revert, or duplicate the sequence beforehand
- No effect if the scale is already keyframed
- Doesn't account for discrepancies in pixel ratio between the timeline and the clips
- UI doesn't refresh immediately. Scrub the timeline to see the Scaling update

--- 

## PLANNED FEATURES
- Add support for selected sequences in Project window to be duplicated rather than Active Sequence
- Function to easily import feedback from an email as sequence markers
- Proxies-Only mode, automatically making hi-res media offline when proxies are attached, to force exports to use Proxies (faster renders)
- export CSV of selected files in the Project Browser
- User settings to hide buttons, turn features on/off, or customise some behaviours
- Media alert when adding items that are not stored on the same drive as the project