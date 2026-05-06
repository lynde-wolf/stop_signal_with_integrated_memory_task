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
const src = fs.readFileSync(path.resolve(__dirname, '..', 'stop_signal_with_integrated_memory', 'experiment.js'), 'utf8');
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
  case 'shuffleArrayWithMutationCheck': {
    var inputBefore = JSON.parse(JSON.stringify(cmd.args[0]));
    var output = shuffleArray(cmd.args[0]);
    result = { inputBefore: inputBefore, inputAfter: cmd.args[0], output: output };
    break;
  }
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
      maxSSD,
      minSSD,
      stimStimulusDuration,
      stimTrialDuration,
      accuracyThresh,
      rtThresh,
      letterRtThresh,
      omissionResponseThresh,
      maxStopCorrect,
      minStopCorrect,
    };
    break;
  case 'appendSimpleStopData': {
    // args: [data, stimDataOverride, ssd_simple_init, conditionOverride, correctResponseOverride]
    var data = cmd.args[0];
    stimData = cmd.args[1];
    SSD_simple = cmd.args[2] !== undefined ? cmd.args[2] : 250;
    condition = cmd.args[1].condition;
    correct_response = cmd.args[4] !== undefined ? cmd.args[4] : cmd.args[1].correct_response;
    expStage = cmd.args[5] || 'practice';
    appendSimpleStopData(data);
    result = { data: data, SSD_simple: SSD_simple };
    break;
  }
  case 'appendIntegratedProbeData': {
    // args: [data, stimDataOverride, presentationData, ssd2, ssd4, ssd6]
    var data = cmd.args[0];
    stimData = cmd.args[1];
    var presentationData = cmd.args[2];
    SSD_2 = cmd.args[3] !== undefined ? cmd.args[3] : 250;
    SSD_4 = cmd.args[4] !== undefined ? cmd.args[4] : 250;
    SSD_6 = cmd.args[5] !== undefined ? cmd.args[5] : 250;
    condition = cmd.args[1].stop_condition;
    correct_response = cmd.args[1].correct_response;
    expStage = cmd.args[6] || 'practice';
    appendIntegratedProbeData(data, presentationData);
    result = { data: data, SSD_2: SSD_2, SSD_4: SSD_4, SSD_6: SSD_6 };
    break;
  }
  case 'appendGoTrialData': {
    var data = cmd.args[0];
    stimData = cmd.args[1];
    correct_response = cmd.args[1].correct_response;
    condition = cmd.args[1].condition;
    expStage = cmd.args[2] || 'practice';
    appendGoTrialData(data);
    result = data;
    break;
  }
  case 'appendMemoryOnlyProbeData': {
    var data = cmd.args[0];
    stimData = cmd.args[1];
    correct_response = cmd.args[1].correct_response;
    appendMemoryOnlyProbeData(data);
    result = data;
    break;
  }
  case 'appendMemoryPresentationData': {
    var data = cmd.args[0];
    stimData = cmd.args[1];
    expStage = cmd.args[2] || 'practice';
    appendMemoryPresentationData(data);
    result = data;
    break;
  }
  case 'getMemoryOnlyPresentationStim': {
    memoryOnlyStims = [cmd.args[0]];
    var html = getMemoryOnlyPresentationStim();
    result = { html: html, selectedLetters: lastShownLetters };
    break;
  }
  case 'getIntegratedPresentationStim': {
    stims_integrated = [cmd.args[0]];
    var html = getIntegratedPresentationStim();
    result = { html: html, selectedLetters: lastShownLetters };
    break;
  }
  case 'integratedHandoff': {
    stims_integrated = [cmd.args[0]];
    var presHtml = getIntegratedPresentationStim();
    var presStimData = JSON.parse(JSON.stringify(stimData));
    var presLetters = lastShownLetters;
    var probeHtml = getIntegratedProbeStim();
    var probeStimData = JSON.parse(JSON.stringify(stimData));
    result = {
      presHtml: presHtml,
      presStimData: presStimData,
      presLetters: presLetters,
      probeHtml: probeHtml,
      probeStimData: probeStimData,
      stimsRemainingLength: stims_integrated.length,
    };
    break;
  }
  default:
    result = { error: 'Unknown function: ' + cmd.fn };
}

process.stdout.write(JSON.stringify(result));
