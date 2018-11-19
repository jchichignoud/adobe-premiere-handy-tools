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
      newNumber = parseInt(splitNameArray[2], 10) + 1;
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
};

// this file should contain jsx-code that can run in all apps
// like polyfills of e.g. JSON
