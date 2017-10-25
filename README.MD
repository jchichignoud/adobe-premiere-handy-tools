# PREMIERE HANDY TOOLS

## HOW TO INSTALL
- Enable unsigned extensions on your computer
- Download zip: https://github.com/jchichignoud/adobe-premiere-handy-tools/archive/master.zip
- Place unzipped folder in the Adobe extensions folder

For detailed instructions, follow steps 2 and 3 on this page: https://github.com/Adobe-CEP/Samples/tree/master/PProPanel

---

## DUPLICATE
### INSTRUCTIONS
- load sequence in Timeline (needs to be active, it won't work with a selected sequence in the Project Browser)
- press "duplicate" button
- the name of the sequence needs to end with a number, which will be automatically incremented
- the original sequence will be placed in a sub-bin called "_OLD", which will be created if it doesn't exist

### RECENT FIXES
- fixed "duplicate" firing twice on first use

### KNOWN ISSUES
- obscure error message if no sequence is active
- obscure error message if the sequence name doesn't end with a number, which means new sequence won't be renamed or moved to the right folder

---