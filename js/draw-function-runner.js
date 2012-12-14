/*jslint maxerr: 200, browser: true, devel: true, bitwise: true */


var createDrawFunctionRunner = function () {

    'use strict';

    var DrawFunctionRunner = {},
        // this array is used to keep track of all the instances of "doOnce" in the code
        // we need to keep this so we can put the ticks next to doOnce once that doOnce
        // block has run.
        doOnceOccurrencesLineNumbers = [];

    DrawFunctionRunner.drawFunction = "";
    DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
    DrawFunctionRunner.lastStableProgram = "";

    // This is the function called from the compiled code to add the doOnce line
    window.addDoOnce = DrawFunctionRunner.addDoOnce = function (lineNum) {
        doOnceOccurrencesLineNumbers.push(lineNum);
    };

    DrawFunctionRunner.setDrawFunction = function (drawFunc) {
        if (drawFunc) {
        	DrawFunctionRunner.drawFunction = drawFunc;
        }
    };

    DrawFunctionRunner.resetTrackingOfDoOnceOccurrences = function () {
				doOnceOccurrencesLineNumbers = [];
    }


    DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun = function (editor, CodeTransformer) {
        if (doOnceOccurrencesLineNumbers.length !== 0) {
           DrawFunctionRunner.setDrawFunction(
             CodeTransformer.addCheckMarksAndRegisterCode(editor, CodeTransformer, doOnceOccurrencesLineNumbers)
           );
        }
    }


    DrawFunctionRunner.runDrawFunction = function () {
				// this invokation below could be throwing an error,
				// in which case the lines afterwards are not executed
				// and the exception is propagated to the callee of this function,
				// which is the main animation loop.
				DrawFunctionRunner.drawFunction();
				
				// if we are here it means that the draw function didn't generate
				// any runtime errors, so we increment a counter that tells how long
				// this program has been stable for.
				// Beyond 5 frames, we consider this program as "stable" and we save
				// it in a special variable.
				// This "stability" counter is obviously reset anytime the program is changed
				// so the new version too gets an opportunity to be tested and saved.
				DrawFunctionRunner.consecutiveFramesWithoutRunTimeError += 1;
				if (DrawFunctionRunner.consecutiveFramesWithoutRunTimeError === 5) {
						DrawFunctionRunner.lastStableProgram = DrawFunctionRunner.drawFunction;
				}

    };


    DrawFunctionRunner.reinstateLastWorkingProgram = function () {
            // mark the program as flawed and register the previous stable one.
            DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
            DrawFunctionRunner.drawFunction = DrawFunctionRunner.lastStableProgram;
    }



    return DrawFunctionRunner;

};