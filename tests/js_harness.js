// Minimal jsPsych mock so experiment.js can be loaded in Node.
// Receives a JSON command on argv[2] and prints JSON results to stdout.

globalThis.window = { efVars: { group_index: 1 } };
globalThis.document = { body: {} };
globalThis.performance = { now: () => Date.now() };

globalThis.jsPsych = {
  randomization: {
    repeat: function (arr, reps) {
      var out = [];
      for (var r = 0; r < reps; r++) {
        out = out.concat(JSON.parse(JSON.stringify(arr)));
      }
      // Fisher-Yates shuffle
      for (var i = out.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
  },
  pluginAPI: {
    preloadImages: function () {},
  },
  data: {
    get: function () {
      return {
        last: function () {
          return { trials: [], values: function () { return [{}]; } };
        },
      };
    },
  },
};

// Stub plugin constructors so experiment.js doesn't error on reference
globalThis.jsPsychHtmlKeyboardResponse = 'jsPsychHtmlKeyboardResponse';
globalThis.jsPsychInstructions = 'jsPsychInstructions';
globalThis.jsPsychHtmlButtonResponse = 'jsPsychHtmlButtonResponse';
globalThis.jsPsychSurveyText = 'jsPsychSurveyText';
globalThis.jsPsychFullscreen = 'jsPsychFullscreen';
globalThis.jsPsychCallFunction = 'jsPsychCallFunction';
globalThis.jsPoldracklabStopSignal = 'jsPoldracklabStopSignal';
globalThis.jsPsychAttentionCheckRdoc = 'jsPsychAttentionCheckRdoc';
globalThis.jsPsychModule = {};
globalThis.initJsPsych = function () { return globalThis.jsPsych; };
globalThis.dataSync = function () {};

// Load experiment.js into the global context (var declarations become globals)
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const src = fs.readFileSync(path.resolve(__dirname, '..', 'experiment.js'), 'utf8');
vm.runInThisContext(src, { filename: 'experiment.js' });

// Dispatch command from argv
const cmd = JSON.parse(process.argv[2]);
let result;

switch (cmd.fn) {
  case 'createGoTrialTypes':
    result = createGoTrialTypes(cmd.args[0]);
    break;
  case 'createSimpleTrialTypes':
    result = createSimpleTrialTypes(cmd.args[0]);
    break;
  case 'createMemoryOnlyTrialTypes':
    result = createMemoryOnlyTrialTypes(cmd.args[0]);
    break;
  case 'createIntegratedTrialTypes':
    result = createIntegratedTrialTypes(cmd.args[0]);
    break;
  case 'repeatShuffle':
    result = repeatShuffle(cmd.args[0], cmd.args[1]);
    break;
  case 'shuffleArray':
    result = shuffleArray(cmd.args[0]);
    break;
  case 'buildSpatialLetterHTML':
    result = buildSpatialLetterHTML(cmd.args[0]);
    break;
  case 'generateProbeLetter': {
    lastShownLetters = cmd.args[1] || 'ABCD';
    result = generateProbeLetter(cmd.args[0]);
    break;
  }
  case 'getIntegratedSSD': {
    SSD_2 = cmd.args[1] || 250;
    SSD_4 = cmd.args[2] || 250;
    SSD_6 = cmd.args[3] || 250;
    result = getIntegratedSSD(cmd.args[0]);
    break;
  }
  case 'getKeyMappingForTask':
    getKeyMappingForTask(cmd.args[0]);
    result = possibleResponses;
    break;
  case 'getVars':
    result = {
      possibleMemoryLengths,
      stopSignalsConditions,
      shapes,
      possibleConditions,
      positionSets,
      goPracticeLen,
      simpleStopPracticeLen,
      memoryPracticeLen,
      integratedPracticeLen,
      numTrialsPerSimpleBlock,
      numTrialsPerIntegratedBlock,
      numSimpleTestBlocks,
      numIntegratedTestBlocks,
      practiceThresh,
      practiceAccuracyThresh,
      goCorrectPracticeThresh,
      memoryCorrectPracticeThresh,
    };
    break;
  default:
    result = { error: 'Unknown function: ' + cmd.fn };
}

process.stdout.write(JSON.stringify(result));
