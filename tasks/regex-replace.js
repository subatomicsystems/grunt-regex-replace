/*
 * grunt-regex-replace
 * https://github.com/bomsy/grunt-regex-replace
 *
 * Copyright (c) 2012 Hubert Boma Manilla
 * Licensed under the MIT license.
 *
 */

module.exports = function(grunt) {
  "use strict";
  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================
  grunt.registerMultiTask('regex-replace', 'find & replace content of a file based regex patterns', function(){
    var files = grunt.file.expand(this.files[0].src),
      actions = this.data.actions,
      arrString = "[object Array]",
      regexString = "[object RegExp]",
      toString = Object.prototype.toString,
      GLOBAL = 'g',
      options = null,
      srchAction = null,
      rplAction = null,
      matchAction = null,
      originalContent,
      updatedContent;
      for(var i = 0; i< files.length; i++){
        if(toString.call(actions) === arrString){
          updatedContent = grunt.file.read(files[i]);
          originalContent = updatedContent;
          for(var j = 0; j < actions.length; j++){
            srchAction = actions[j].search,
            rplAction = actions[j].replace; 
            matchAction = actions[j].match;
            options = actions[j].flags;
            if(typeof options === 'undefined'){
              options = GLOBAL;
            }
            if( (typeof srchAction !== 'string' && toString.call(srchAction) !== regexString ) 
              || typeof options !== 'string' ){
              grunt.warn('An error occured while processing (Invalid type passed for \'search\' or \'replace\' or \'flags\', only strings accepted.)' );
            }
            if(typeof srchAction === 'string'){
              srchAction = grunt.template.process(srchAction);
            }
            if(typeof rplAction === 'string'){
              rplAction = grunt.template.process(rplAction);
            }

            if(typeof matchAction !== 'undefined' && typeof matchAction !== 'function' ) {
              grunt.fail.fatal("Invalid type passed for \'match\': only functions accepted");
            }
            if(typeof matchAction === 'function') {
              regexMatch(updatedContent, srchAction, matchAction, options);
              if (typeof rplAction !== 'undefined') {
                grunt.warn('Both \'match\' and \'replace\' actions were specified, but only one at a time is supported, so \'match\' was executed');
              }
            } else if (typeof rplAction !== 'undefined') {
              updatedContent = regexReplace( updatedContent, srchAction, rplAction , options, j, actions[j].name);
            }
          }
          if(updatedContent !== originalContent) {
            grunt.file.write(files[i], updatedContent);  
          }
          if(this.errorCount){
            return false;
          } 
          grunt.log.writeln('File \'' + files[i] + '\' replace complete.');
        }
      }
  });
  // ==========================================================================
  // HELPERS
  // ==========================================================================
 var regexMatch = function(src, regex, onMatch, options) {

   if(typeof onMatch !== 'function') {
    return;
   }
    var regExp = null, matches;

    if(typeof regex ===  'string'){ 
      regExp = new RegExp(regex , options); //regex => string
    } else {
      regExp = regex; //regex => RegExp object
    }
    matches = String(src).match(regExp);
    for(var i in matches) {
      if(matches[i]!== null) {
        onMatch(matches[i]);
      }
    }
    index = typeof index === 'undefined' ? '' : index;
    

 };
 
 var regexReplace = function(src, regex, substr, options, index, actionName){
    //takes the src content and changes the content
    var regExp = null,
        updatedSrc;
    if(typeof regex ===  'string'){ 
      regExp = new RegExp(regex , options); //regex => string
    } else {
      regExp = regex; //regex => RegExp object
    }
    updatedSrc = String(src).replace(regExp, substr); //note: substr can be a function
    index = typeof index === 'undefined' ? '' : index;
    if(!actionName){
      grunt.log.writeln(index + 1 + ' \'replace\' action(s) completed.');
    } else {
      grunt.log.writeln(actionName + ' \'replace\' action completed.');
    }
    return updatedSrc;
  };

};
