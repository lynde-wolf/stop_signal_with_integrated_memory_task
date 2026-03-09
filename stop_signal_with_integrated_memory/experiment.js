/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
var meanITI = 0.5;

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

const getExpStage = () => expStage;

const getCurrAttentionCheckQuestion = () =>
  `${currentAttentionCheckData.Q} <div class=block-text>This screen will advance automatically in 1 minute. Do not press shift.</div>`;

const getCurrAttentionCheckAnswer = () => currentAttentionCheckData.A;

var attentionCheckData = [
  { Q: "<p class='block-text'>Press the q key</p>", A: 81 },
  { Q: "<p class='block-text'>Press the p key</p>", A: 80 },
  { Q: "<p class='block-text'>Press the r key</p>", A: 82 },
  { Q: "<p class='block-text'>Press the s key</p>", A: 83 },
  { Q: "<p class='block-text'>Press the t key</p>", A: 84 },
  { Q: "<p class='block-text'>Press the j key</p>", A: 74 },
  { Q: "<p class='block-text'>Press the k key</p>", A: 75 },
  { Q: "<p class='block-text'>Press the e key</p>", A: 69 },
  { Q: "<p class='block-text'>Press the m key</p>", A: 77 },
  { Q: "<p class='block-text'>Press the i key</p>", A: 73 },
  { Q: "<p class='block-text'>Press the u key</p>", A: 85 },
  {
    Q: "<p class='block-text'>Press the key for the first letter of the English alphabet.</p>",
    A: 65,
  },
  {
    Q: "<p class='block-text'>Press the key for the second letter of the English alphabet.</p>",
    A: 66,
  },
  {
    Q: "<p class='block-text'>Press the key for the third letter of the English alphabet.</p>",
    A: 67,
  },
  {
    Q: "<p class='block-text'>Press the key for the third to last letter of the English alphabet.</p>",
    A: 88,
  },
  {
    Q: "<p class='block-text'>Press the key for the second to last letter of the English alphabet.</p>",
    A: 89,
  },
  {
    Q: "<p class='block-text'>Press the key for the last letter of the English alphabet.</p>",
    A: 90,
  },
];
attentionCheckData = shuffleArray(attentionCheckData);
var currentAttentionCheckData = attentionCheckData.shift();

const getInstructFeedback =
  () => `<div class = centerbox><p class = center-block-text>
    ${feedbackInstructText}
    </p></div>`;

const getFeedback =
  () => `<div class = bigbox><div class = picture_box><p class = block-text><font color="white">
    ${feedbackText}
    </font></p></div></div>`;

/* ---- Trial Type Generators ---- */

function repeatShuffle(arr, len) {
  var reps = Math.ceil(len / arr.length);
  var expanded = jsPsych.randomization.repeat(arr, reps);
  return expanded.slice(0, len);
}

var createGoTrialTypes = function (len) {
  var goStims = [];
  for (var j = 0; j < shapes.length; j++) {
    goStims.push({
      stopStim: shapes[j],
      stop_correct_response: possibleResponses[j][1],
      stop_condition: 'go',
    });
  }
  return repeatShuffle(goStims, len);
};

var createSimpleTrialTypes = function (len) {
  var simpleStims = [];
  for (var j = 0; j < shapes.length; j++) {
    for (var x = 0; x < stopSignalsConditions.length; x++) {
      simpleStims.push({
        stopStim: shapes[j],
        stop_correct_response: possibleResponses[j][1],
        stop_condition: stopSignalsConditions[x],
      });
    }
  }
  return repeatShuffle(simpleStims, len);
};

var createMemoryOnlyTrialTypes = function (len) {
  var memStims = [];
  for (var y = 0; y < possibleMemoryLengths.length; y++) {
    for (var z = 0; z < possibleConditions.length; z++) {
      memStims.push({
        memoryStimLength: possibleMemoryLengths[y],
        memory_condition: possibleConditions[z],
        memory_correct_response: possibleResponses[z + 2][1],
      });
    }
  }
  return repeatShuffle(memStims, len);
};

var createIntegratedTrialTypes = function (len) {
  var intStims = [];
  for (var x = 0; x < stopSignalsConditions.length; x++) {
    for (var y = 0; y < possibleMemoryLengths.length; y++) {
      for (var z = 0; z < possibleConditions.length; z++) {
        intStims.push({
          stop_condition: stopSignalsConditions[x],
          memoryStimLength: possibleMemoryLengths[y],
          memory_condition: possibleConditions[z],
          memory_correct_response: possibleResponses[z + 2][1],
        });
      }
    }
  }
  return repeatShuffle(intStims, len);
};

/* ---- Stimulus Functions ---- */

var getStopStim = function () {
  return preFileType + 'stopSignal' + postFileType;
};

var getGoStim = function () {
  var stim = goStims.shift();
  shape = stim.stopStim;
  correct_response = stim.stop_correct_response;
  condition = stim.stop_condition;
  stimData = {
    stim: shape,
    condition: condition,
    correct_response: correct_response,
  };
  return (
    '<div class = centerbox><div class = cue-text>' +
    preFileType +
    shape +
    postFileType +
    '</div></div>'
  );
};

var getSimpleStim = function () {
  var stim = stims_simple.shift();
  shape = stim.stopStim;
  correct_response = stim.stop_correct_response;
  condition = stim.stop_condition;
  stimData = {
    stim: shape,
    condition: condition,
    correct_response: condition === 'go' ? correct_response : null,
  };
  return (
    '<div class = centerbox><div class = cue-text>' +
    preFileType +
    shape +
    postFileType +
    '</div></div>'
  );
};

var lastShownLetters = '';
var lastPhase1Stim = null;

var positionSets = {
  2: [
    { x: -10, y: 0 },
    { x: 10, y: 0 },
  ],
  4: [
    { x: 0, y: -10 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
    { x: -10, y: 0 },
  ],
  6: [
    { x: 0, y: -10 },
    { x: 8.66, y: -5 },
    { x: 8.66, y: 5 },
    { x: 0, y: 10 },
    { x: -8.66, y: 5 },
    { x: -8.66, y: -5 },
  ],
};

var buildSpatialLetterHTML = function (selectedLetters) {
  var n = selectedLetters.length;
  var positions = positionSets[n];
  var stimuliHTML = "<div class='container'>";
  for (var i = 0; i < n; i++) {
    var px = positions[i].x;
    var py = positions[i].y;
    stimuliHTML +=
      `<div class="stimulus" style="transform: translate(calc(-50% + ${px}vw), calc(-50% + ${py}vw));">` +
      selectedLetters.charAt(i) +
      '</div>';
  }
  stimuliHTML += '</div>';
  return stimuliHTML;
};

var getMemoryOnlyPresentationStim = function () {
  var stim = memoryOnlyStims.shift();
  lastPhase1Stim = stim;
  var stimLength = stim.memoryStimLength;

  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var selectedLetters = '';
  for (var i = 0; i < stimLength; i++) {
    var randomIndex = Math.floor(Math.random() * letters.length);
    selectedLetters += letters[randomIndex];
    letters = letters.slice(0, randomIndex) + letters.slice(randomIndex + 1);
  }
  lastShownLetters = selectedLetters;

  stimData = {
    stim: selectedLetters,
    stimLength: stimLength,
    condition: 'Presentation',
    selectedLetters: selectedLetters,
    correct_response: null,
  };
  return buildSpatialLetterHTML(selectedLetters);
};

var getMemoryOnlyProbeStim = function () {
  var stim = lastPhase1Stim;
  var memCondition = stim.memory_condition;
  correct_response = stim.memory_correct_response;

  var recognitionLetter = generateProbeLetter(memCondition);

  stimData = {
    stim: recognitionLetter,
    stimLength: stim.memoryStimLength,
    condition: memCondition,
    recognitionLetter: recognitionLetter,
    selectedLetters: lastShownLetters,
    correct_response: correct_response,
  };
  return (
    "<div class='centerbox'><div class='letter-text'>" +
    recognitionLetter +
    '</div></div>'
  );
};

var getIntegratedPresentationStim = function () {
  var stim = stims_integrated[0];
  var stimLength = stim.memoryStimLength;

  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var selectedLetters = '';
  for (var i = 0; i < stimLength; i++) {
    var randomIndex = Math.floor(Math.random() * letters.length);
    selectedLetters += letters[randomIndex];
    letters = letters.slice(0, randomIndex) + letters.slice(randomIndex + 1);
  }
  lastShownLetters = selectedLetters;

  stimData = {
    stim: selectedLetters,
    stimLength: stimLength,
    condition: 'Presentation',
    selectedLetters: selectedLetters,
    correct_response: null,
  };
  return buildSpatialLetterHTML(selectedLetters);
};

var getIntegratedProbeStim = function () {
  var stim = stims_integrated.shift();
  condition = stim.stop_condition;
  var memCondition = stim.memory_condition;
  correct_response = stim.memory_correct_response;

  var recognitionLetter = generateProbeLetter(memCondition);

  stimData = {
    stim: recognitionLetter,
    stimLength: stim.memoryStimLength,
    stop_condition: condition,
    memory_condition: memCondition,
    recognitionLetter: recognitionLetter,
    selectedLetters: lastShownLetters,
    correct_response: condition === 'go' ? correct_response : null,
  };
  return (
    "<div class='centerbox'><div class='cue-text'><div class='probe-letter'>" +
    recognitionLetter +
    '</div></div></div>'
  );
};

function generateProbeLetter(memCondition) {
  if (memCondition === 'in memory set') {
    var randomIndex = Math.floor(Math.random() * lastShownLetters.length);
    return lastShownLetters[randomIndex];
  } else {
    var allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var remainingLetters = allLetters.split('').filter(function (l) {
      return !lastShownLetters.includes(l);
    });
    var randomIndex = Math.floor(Math.random() * remainingLetters.length);
    return remainingLetters[randomIndex];
  }
}

const getCurrBlockNum = () =>
  getExpStage() === 'practice' ? practiceCount : testCount;

var getSimpleSSD = () => SSD_simple;

var getIntegratedSSD = function (stimLength) {
  switch (stimLength) {
    case 2: return SSD_2;
    case 4: return SSD_4;
    case 6: return SSD_6;
    default: return SSD_2;
  }
};

const getCondition = () => condition;
const getCorrectResponse = () => correct_response;

/* ---- Data Recording Functions ---- */

var appendGoTrialData = function (data) {
  data.stim = stimData.stim;
  data.current_trial = currentTrial;
  data.condition = stimData.condition;
  data.block_num = getExpStage() == 'practice' ? practiceCount : testCount;
  data.correct_response = stimData.correct_response;
};

var appendSimpleStopData = function (data) {
  currentTrial += 1;
  data.stim = stimData.stim;
  data.correct_response = correct_response;
  data.current_trial = currentTrial;
  data.condition = stimData.condition;
  data.block_num = getExpStage() == 'practice' ? practiceCount : simpleTestCount;

  if (data.condition === 'stop') {
    data.correct_trial = data.response === null ? 1 : 0;
    if (data.response == null && SSD_simple < maxSSD) {
      SSD_simple += 50;
    } else if (data.response != null && SSD_simple > minSSD) {
      SSD_simple -= 50;
    }
  } else {
    data.correct_trial = data.response === data.correct_response ? 1 : 0;
  }
};

var appendMemoryPresentationData = function (data) {
  data.stim = stimData.stim;
  data.current_trial = currentTrial;
  data.stimLength = stimData.stimLength;
  data.condition = 'Presentation';
  data.selectedLetters = stimData.selectedLetters;
  data.block_num = getExpStage() == 'practice' ? practiceCount : integratedTestCount;
  data.correct_response = null;
};

var appendMemoryOnlyProbeData = function (data) {
  currentTrial += 1;
  data.stim = stimData.stim;
  data.stimLength = stimData.stimLength;
  data.condition = stimData.condition;
  data.recognitionLetter = stimData.recognitionLetter;
  data.selectedLetters = stimData.selectedLetters;
  data.correct_response = stimData.correct_response;
  data.current_trial = currentTrial;
  data.block_num = practiceCount;
  data.correct_trial = data.response === data.correct_response ? 1 : 0;
};

var appendIntegratedProbeData = function (data, presentationData) {
  currentTrial += 1;
  data.stim = stimData.stim;
  data.stimLength = stimData.stimLength;
  data.condition = stimData.stop_condition;
  data.memory_condition = stimData.memory_condition;
  data.recognitionLetter = stimData.recognitionLetter;
  data.selectedLetters = stimData.selectedLetters;
  data.correct_response = stimData.correct_response;
  data.current_trial = currentTrial;
  data.block_num = getExpStage() == 'practice' ? practiceCount : integratedTestCount;

  var stimLength = presentationData.stimLength;

  if (data.condition === 'stop') {
    data.correct_trial = data.response === null ? 1 : 0;
    if (data.response === null) {
      if (stimLength === 2 && SSD_2 < maxSSD) SSD_2 += 50;
      else if (stimLength === 4 && SSD_4 < maxSSD) SSD_4 += 50;
      else if (stimLength === 6 && SSD_6 < maxSSD) SSD_6 += 50;
    } else {
      if (stimLength === 2 && SSD_2 > minSSD) SSD_2 -= 50;
      else if (stimLength === 4 && SSD_4 > minSSD) SSD_4 -= 50;
      else if (stimLength === 6 && SSD_6 > minSSD) SSD_6 -= 50;
    }
  } else {
    data.correct_trial = data.response === data.correct_response ? 1 : 0;
  }
};

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var possibleResponses;

function getKeyMappingForTask(group_index) {
  if (group_index <= 1) {
    if (group_index % 2 === 0) {
      possibleResponses = [
        ['right hand index finger', ',', 'comma key (,)'],
        ['right hand middle finger', '.', 'period key (.)'],
        ['left hand index finger', 'x', 'X key'],
        ['left hand middle finger', 'z', 'Z key'],
      ];
    } else {
      possibleResponses = [
        ['right hand index finger', ',', 'comma key (,)'],
        ['right hand middle finger', '.', 'period key (.)'],
        ['left hand middle finger', 'z', 'Z key'],
        ['left hand index finger', 'x', 'X key'],
      ];
    }
  } else {
    if (group_index % 2 === 0) {
      possibleResponses = [
        ['right hand middle finger', '.', 'period key (.)'],
        ['right hand index finger', ',', 'comma key (,)'],
        ['left hand index finger', 'x', 'X key'],
        ['left hand middle finger', 'z', 'Z key'],
      ];
    } else {
      possibleResponses = [
        ['right hand middle finger', '.', 'period key (.)'],
        ['right hand index finger', ',', 'comma key (,)'],
        ['left hand middle finger', 'z', 'Z key'],
        ['left hand index finger', 'x', 'X key'],
      ];
    }
  }
}

var group_index =
  typeof window.efVars !== 'undefined' ? window.efVars.group_index : 1;

getKeyMappingForTask(group_index);

const stopChoices = [possibleResponses[0][1], possibleResponses[1][1]];
const letterChoices = [possibleResponses[2][1], possibleResponses[3][1]];

var endText = `
  <div class="centerbox">
    <p class="center-block-text">Thanks for completing this task!</p>
    <p class="center-block-text">Press <i>enter</i> to continue.</p>
  </div>
`;

var feedbackInstructText = `
  <p class="center-block-text">
    Welcome! This experiment will take around 40 minutes.
  </p>
  <p class="center-block-text">
    To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) active and in fullscreen mode for the whole duration of each task.
  </p>
  <p class="center-block-text"> Press <i>enter</i> to begin.</p>
`;

var practiceStage = 'go_only';
var expStage = 'practice';

const stimStimulusDuration = 1000;
const stimTrialDuration = 1500;

var sumInstructTime = 0;
var instructTimeThresh = 1;
var runAttentionChecks = true;

var goPracticeLen = 10;
var simpleStopPracticeLen = 10;
var memoryPracticeLen = 10;
var integratedPracticeLen = 10;
var numTrialsPerSimpleBlock = 30;
var numTrialsPerIntegratedBlock = 36;
var numSimpleTestBlocks = 6;
var numIntegratedTestBlocks = 6;

var practiceThresh = 3;
var accuracyThresh = 0.8;
var practiceAccuracyThresh = 0.75;
var goCorrectPracticeThresh = 0.75;
var goOmissionPracticeThresh = 0.4;
var memoryCorrectPracticeThresh = 0.75;
var memoryOmissionPracticeThresh = 0.2;
var missedResponseThresh = 0.2;
var rtThresh = 1000;
var letterRtThresh = 1250;

var SSD_simple = 250;
var SSD_2 = 250;
var SSD_4 = 250;
var SSD_6 = 250;

var maxSSD = 1000;
var minSSD = 0;

var currentTrial = 0;
var correct_response = null;
var stimData = null;
var condition = null;
var shape = null;

var maxStopCorrect = 0.75;
var minStopCorrect = 0.25;
var maxStopCorrectPractice = 1;
var minStopCorrectPractice = 0;

var stopSignalsConditions = ['go', 'go', 'stop'];
var shapes = ['circle', 'square'];
var recognition = ['in memory set', 'not in memory set'];
var possibleMemoryLengths = [2, 4, 6];
var possibleConditions = ['in memory set', 'not in memory set'];

/* Image paths */
// local
// var pathSource = '/static/experiments/stop_signal_with_integrated_memory/images/';
// expfactory deploy
var pathSource =
  '/deployment/repo/stop_signal_wm_experiment/ad17d3ae41c163fc0fa6889becd5e74a04d76f73/stop_signal_wm_task/images/';
var postFileType = ".png'></img>";
var preFileType = "<img class = center src='" + pathSource;
var images = [pathSource + 'stopSignal.png'];
for (var i = 0; i < shapes.length; i++) {
  images.push(pathSource + shapes[i] + '.png');
}

/* ---- Prompt Text ---- */

var goPromptTextList = `
  <ul style="text-align:left;">
    <li>${
      possibleResponses[0][0] == 'right hand index finger'
        ? shapes[0] : shapes[1]
    }: comma key (,)</li>
    <li>${
      possibleResponses[1][0] == 'right hand middle finger'
        ? shapes[1] : shapes[0]
    }: period key (.)</li>
  </ul>
`;

var simpleStopPromptTextList = `
  <ul style="text-align:left;">
    <li>${
      possibleResponses[0][0] == 'right hand index finger'
        ? shapes[0] : shapes[1]
    }: comma key (,)</li>
    <li>${
      possibleResponses[1][0] == 'right hand middle finger'
        ? shapes[1] : shapes[0]
    }: period key (.)</li>
    <li>Do not respond if a star appears.</li>
  </ul>
`;

var memoryPromptTextList = `
  <ul style="text-align:left;">
    <li>${
      possibleResponses[2][0] == 'left hand index finger'
        ? recognition[0] : recognition[1]
    }: X key</li>
    <li>${
      possibleResponses[3][0] == 'left hand middle finger'
        ? recognition[1] : recognition[0]
    }: Z key</li>
  </ul>
`;

var integratedPromptTextList = `
  <ul style="text-align:left;">
    <li>${
      possibleResponses[2][0] == 'left hand index finger'
        ? recognition[0] : recognition[1]
    }: X key</li>
    <li>${
      possibleResponses[3][0] == 'left hand middle finger'
        ? recognition[1] : recognition[0]
    }: Z key</li>
    <li>Do not respond if a star appears around the letter.</li>
  </ul>
`;

var goPromptText = `
  <div class="prompt_box">
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[0][0] == 'right hand index finger' ? shapes[0] : shapes[1]
    }: comma key (,)</p>
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[1][0] == 'right hand middle finger' ? shapes[1] : shapes[0]
    }: period key (.)</p>
  </div>
`;

var simpleStopPromptText = `
  <div class="prompt_box">
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[0][0] == 'right hand index finger' ? shapes[0] : shapes[1]
    }: comma key (,)</p>
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[1][0] == 'right hand middle finger' ? shapes[1] : shapes[0]
    }: period key (.)</p>
    <p class="center-block-text" style="font-size:16px; line-height:80%;">Do not respond if a star appears.</p>
  </div>
`;

var memoryPromptText = `
  <div class="prompt_box">
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[2][0] == 'left hand index finger'
        ? recognition[0] : recognition[1]
    }: X key</p>
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[3][0] == 'left hand middle finger'
        ? recognition[1] : recognition[0]
    }: Z key</p>
  </div>
`;

var integratedPromptText = `
  <div class="prompt_box">
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[2][0] == 'left hand index finger'
        ? recognition[0] : recognition[1]
    }: X key</p>
    <p class="center-block-text" style="font-size:16px; line-height:80%;">${
      possibleResponses[3][0] == 'left hand middle finger'
        ? recognition[1] : recognition[0]
    }: Z key</p>
    <p class="center-block-text" style="font-size:16px; line-height:80%;">Do not respond if a star appears.</p>
  </div>
`;

var speedReminder =
  '<p class = block-text>Try to respond as quickly and accurately as possible.</p>';

/* ---- Instruction Pages ---- */

var goInstruct = [
  `
  <div class="centerbox">
    <p class="block-text">Place your <b>right hand index finger</b> on the <b>comma key (,)</b> and your <b>right hand middle finger</b> on the <b>period key (.)</b></p>
  </div>
  `,
  `
  <div class="centerbox">
    <p class="block-text">In this experiment, there are two types of blocks you will complete. First, we will practice the shape task.</p>
    <p class="block-text">During this task, you will see shapes appear on the screen one at a time.</p>
    <p class="block-text">If the shape is a <b>${
      possibleResponses[0][0] == 'right hand index finger' ? shapes[0] : shapes[1]
    }</b>, press your <b>right hand index finger (comma key (,))</b>.</p>
    <p class="block-text">If the shape is a <b>${
      possibleResponses[1][0] == 'right hand middle finger' ? shapes[1] : shapes[0]
    }</b>, press your <b>right hand middle finger (period key (.))</b>.</p>
    <p class="block-text">You should respond as quickly and accurately as possible.</p>
  </div>
  `,
  `
  <div class="centerbox">
    <p class="block-text">Let's start a practice round. During practice, you will receive feedback. Press enter to begin.</p>
  </div>
  `,
];

var simpleStopInstruct = [
  `
  <div class="centerbox">
    <p class="block-text">On some trials, a star will appear around the shape, shortly after the shape appears.</p>
    <p class="block-text">If you see the star, please try your best to <b>withhold your response</b> on that trial.</p>
    <p class="block-text">If the star appears and you try your best to withhold your response, you will find that you will be able to stop sometimes, but not always.</p>
    <p class="block-text">Please <b>do not</b> slow down your responses in order to wait for the star.</p>
  </div>
  `,
  `
  <div class="centerbox">
    <p class="block-text">Let's practice the shape task with the star. Press enter to begin.</p>
  </div>
  `,
];

var memoryInstruct = [
  `
  <div class="centerbox">
    <p class="block-text">Now place your <b>left hand index finger</b> on the <b>X key</b> and your <b>left hand middle finger</b> on the <b>Z key.</b></p>
  </div>
  `,
  `
  <div class="centerbox">
    <p class="block-text">Now we will practice the memory task.</p>
    <p class="block-text">On each trial, you will see 2, 4, or 6 letters appear on the screen. Remember all the letters.</p>
    <p class="block-text">After the letters disappear, a single letter will appear.</p>
    <p class="block-text">If the single letter was <b>${
      possibleResponses[2][0] == 'left hand index finger'
        ? recognition[0] : recognition[1]
    }</b>, press your <b>left hand index finger (X key)</b>.</p>
    <p class="block-text">If the single letter was <b>${
      possibleResponses[3][0] == 'left hand middle finger'
        ? recognition[1] : recognition[0]
    }</b>, press your <b>left hand middle finger (Z key)</b>.</p>
  </div>
  `,
  `
  <div class="centerbox">
    <p class="block-text">Let's practice the memory task. Press enter to begin.</p>
  </div>
  `,
];

var integratedInstruct = [
  `
  <div class="centerbox">
    <p class="block-text">Now we will practice the memory task with the stop signal.</p>
    <p class="block-text">You will see letters to remember, then a probe letter will appear. On some trials, a star will appear around the probe letter.</p>
    <p class="block-text">If you see the star, please try your best to <b>withhold your response</b>.</p>
    <p class="block-text">Please <b>do not</b> slow down your responses to wait for the star.</p>
  </div>
  `,
  `
  <div class="centerbox">
    <p class="block-text">Remember:</p>
    <p class="block-text">If the probe letter was <b>${
      possibleResponses[2][0] == 'left hand index finger'
        ? recognition[0] : recognition[1]
    }</b>, press your <b>left hand index finger (X key)</b>.</p>
    <p class="block-text">If the probe letter was <b>${
      possibleResponses[3][0] == 'left hand middle finger'
        ? recognition[1] : recognition[0]
    }</b>, press your <b>left hand middle finger (Z key)</b>.</p>
    <p class="block-text">If you see a star, <b>withhold your response</b>.</p>
    <p class="block-text">Press enter to begin practice.</p>
  </div>
  `,
];

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */
var attentionCheckBlock = {
  type: jsPsychAttentionCheckRdoc,
  data: {
    trial_id: 'test_attention_check',
    trial_duration: 60000,
    timing_post_trial: 200,
    exp_stage: 'test',
  },
  question: getCurrAttentionCheckQuestion,
  key_answer: getCurrAttentionCheckAnswer,
  response_ends_trial: true,
  timing_post_trial: 200,
  trial_duration: 60000,
  on_finish: (data) => (data['block_num'] = testCount),
};

var attentionNode = {
  timeline: [attentionCheckBlock],
  conditional_function: function () {
    return runAttentionChecks;
  },
};

var feedbackInstructBlock = {
  type: jsPsychHtmlKeyboardResponse,
  choices: ['Enter'],
  data: { trial_id: 'instruction_feedback', trial_duration: 180000 },
  stimulus: getInstructFeedback,
  post_trial_gap: 0,
  trial_duration: 180000,
};

var goInstructionsBlock = {
  type: jsPsychInstructions,
  data: { trial_id: 'instructions', trial_duration: null, stimulus: goInstruct },
  pages: goInstruct,
  allow_keys: false,
  show_clickable_nav: true,
  post_trial_gap: 0,
};

var simpleStopInstructionsBlock = {
  type: jsPsychInstructions,
  data: { trial_id: 'instructions', trial_duration: null, stimulus: simpleStopInstruct },
  pages: simpleStopInstruct,
  allow_keys: false,
  show_clickable_nav: true,
  post_trial_gap: 0,
};

var memoryInstructionsBlock = {
  type: jsPsychInstructions,
  data: { trial_id: 'instructions', trial_duration: null, stimulus: memoryInstruct },
  pages: memoryInstruct,
  allow_keys: false,
  show_clickable_nav: true,
  post_trial_gap: 0,
};

var integratedInstructionsBlock = {
  type: jsPsychInstructions,
  data: { trial_id: 'instructions', trial_duration: null, stimulus: integratedInstruct },
  pages: integratedInstruct,
  allow_keys: false,
  show_clickable_nav: true,
  post_trial_gap: 0,
};

var fixationBlock = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
  choices: ['NO_KEYS'],
  data: {
    trial_id: 'test_fixation',
    trial_duration: 250,
    stimulus_duration: 250,
    exp_stage: 'test',
  },
  post_trial_gap: 0,
  stimulus_duration: 250,
  trial_duration: 250,
  on_finish: (data) => (data['block_num'] = testCount),
};

var practiceFixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
  choices: ['NO_KEYS'],
  data: {
    trial_id: 'practice_fixation',
    trial_duration: 250,
    stimulus_duration: 250,
    exp_stage: 'practice',
  },
  post_trial_gap: 0,
  stimulus_duration: 250,
  trial_duration: 250,
  on_finish: (data) => (data['block_num'] = practiceCount),
  prompt: function () {
    if (practiceStage === 'go_only') return goPromptText;
    if (practiceStage === 'simple_stop') return simpleStopPromptText;
    if (practiceStage === 'memory_only') return memoryPromptText;
    if (practiceStage === 'full_integrated') return integratedPromptText;
    return;
  },
};

var feedbackText =
  '<div class = centerbox><p class = center-block-text>Press <i>enter</i> to begin practice.</p></div>';

var goPracticeFirstLoop = true;
var simpleStopPracticeFirstLoop = true;
var memoryPracticeFirstLoop = true;
var integratedPracticeFirstLoop = true;

function setFeedbackTextIfFirstLoop(flag) {
  if (flag) {
    feedbackText =
      "<div class='centerbox'><p class='center-block-text'>Press <i>enter</i> to begin practice.</p></div>";
  }
}

const setupGoPracticeFeedback = {
  type: jsPsychCallFunction,
  func: function () { setFeedbackTextIfFirstLoop(goPracticeFirstLoop); goPracticeFirstLoop = false; },
};
const setupSimpleStopPracticeFeedback = {
  type: jsPsychCallFunction,
  func: function () { setFeedbackTextIfFirstLoop(simpleStopPracticeFirstLoop); simpleStopPracticeFirstLoop = false; },
};
const setupMemoryPracticeFeedback = {
  type: jsPsychCallFunction,
  func: function () { setFeedbackTextIfFirstLoop(memoryPracticeFirstLoop); memoryPracticeFirstLoop = false; },
};
const setupIntegratedPracticeFeedback = {
  type: jsPsychCallFunction,
  func: function () { setFeedbackTextIfFirstLoop(integratedPracticeFirstLoop); integratedPracticeFirstLoop = false; },
};

var feedbackBlock = {
  type: jsPsychHtmlKeyboardResponse,
  data: function () {
    return {
      trial_id: getExpStage() == 'practice' ? 'practice_feedback' : 'test_feedback',
      exp_stage: getExpStage(),
      trial_duration: 60000,
      block_num: getExpStage() == 'practice' ? practiceCount : testCount,
    };
  },
  stimulus: getFeedback,
  post_trial_gap: 0,
  trial_duration: 60000,
  choices: ['Enter'],
  response_ends_trial: true,
};

var ITIBlock = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
  is_html: true,
  choices: ['NO_KEYS'],
  data: function () {
    return {
      trial_id: getExpStage() == 'practice' ? 'practice_ITI' : 'test_ITI',
      block_num: getExpStage() == 'practice' ? practiceCount : testCount,
      exp_stage: getExpStage(),
    };
  },
  post_trial_gap: 0,
  trial_duration: 250,
  stimulus_duration: 250,
  on_finish: function (data) {
    data['trial_duration'] = 250;
    data['stimulus_duration'] = 250;
  },
  prompt: function () {
    if (expStage === 'test') return;
    if (practiceStage === 'go_only') return goPromptText;
    if (practiceStage === 'simple_stop') return simpleStopPromptText;
    if (practiceStage === 'memory_only') return memoryPromptText;
    if (practiceStage === 'full_integrated') return integratedPromptText;
    return;
  },
};

/** ******************************************/
/*       PRACTICE 1: Go-Only (Shapes)        */
/** ******************************************/
var goPracticeCount = 0;
var goPracticeTrials = [];
for (var i = 0; i < goPracticeLen; i++) {
  var practiceGoTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getGoStim,
    data: { trial_id: 'practice_go_trial', exp_stage: 'practice', trial_duration: stimTrialDuration, stimulus_duration: stimStimulusDuration },
    choices: stopChoices,
    stimulus_duration: stimStimulusDuration,
    trial_duration: stimTrialDuration,
    response_ends_trial: false,
    post_trial_gap: 0,
    on_finish: function (data) { appendGoTrialData(data); },
    prompt: goPromptText,
  };
  var goFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    data: function () { return { exp_stage: 'practice', trial_id: 'practice_feedback', trial_duration: 500, stimulus_duration: 500, block_num: practiceCount }; },
    choices: ['NO_KEYS'],
    stimulus: function () {
      var last = jsPsych.data.get().last(1).trials[0];
      if (last.response === last.correct_response) return '<div class=center-box><div class=center-text><font size = 20>Correct!</font></div></div>' + goPromptText;
      if (last.response === null) return '<div class=center-box><div class=center-text><font size = 20>Respond Faster!</font></div></div>' + goPromptText;
      return '<div class=center-box><div class=center-text><font size = 20>Incorrect</font></div></div>' + goPromptText;
    },
    post_trial_gap: 0, stimulus_duration: 500, trial_duration: 500, response_ends_trial: false,
  };
  goPracticeTrials.push(practiceFixation, practiceGoTrial, goFeedback, ITIBlock);
}

var goPracticeNode = {
  timeline: [setupGoPracticeFeedback, feedbackBlock].concat(goPracticeTrials),
  loop_function: function (data) {
    goPracticeCount += 1;
    var correct = 0, total = 0, missed = 0;
    for (var i = 0; i < data.trials.length; i++) {
      if (data.trials[i].trial_id == 'practice_go_trial') {
        total++; if (data.trials[i].response == data.trials[i].correct_response) correct++;
        if (data.trials[i].response == null) missed++;
      }
    }
    if (goPracticeCount == practiceThresh || (correct / total >= goCorrectPracticeThresh && missed / total <= goOmissionPracticeThresh)) {
      practiceStage = 'simple_stop'; return false;
    }
    feedbackText = `<div class=centerbox><p class=block-text>Please take this time to read your feedback!</p>`;
    if (correct / total < goCorrectPracticeThresh) feedbackText += `<p class=block-text>Your accuracy is too low. Remember:</p>${goPromptTextList}`;
    if (missed / total > goOmissionPracticeThresh) feedbackText += `<p class=block-text>You have been responding too slowly.</p>${speedReminder}`;
    feedbackText += `<p class=block-text>We are now going to repeat the practice round.</p><p class=block-text>Press <i>enter</i> to begin.</p></div>`;
    goStims = createGoTrialTypes(goPracticeLen);
    return true;
  },
};

/** ******************************************/
/*   PRACTICE 2: Simple Stop (Shapes+Star)   */
/** ******************************************/
var simpleStopPracticeCount = 0;
var simpleStopPracticeTrials = [];
for (var i = 0; i < simpleStopPracticeLen; i++) {
  var practiceSimpleStopTrial = {
    type: jsPoldracklabStopSignal,
    stimulus: getSimpleStim,
    SS_stimulus: getStopStim,
    SS_trial_type: getCondition,
    data: { trial_id: 'practice_simple_stop_trial', exp_stage: 'practice', trial_duration: stimTrialDuration, stimulus_duration: stimStimulusDuration },
    choices: stopChoices,
    correct_choice: getCorrectResponse,
    stimulus_duration: stimStimulusDuration,
    trial_duration: stimTrialDuration,
    response_ends_trial: false,
    SSD: getSimpleSSD,
    SS_duration: 500,
    post_trial_gap: 0,
    on_finish: function (data) { appendSimpleStopData(data); },
    prompt: simpleStopPromptText,
  };
  var simpleStopFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    data: function () { return { exp_stage: 'practice', trial_id: 'practice_feedback', trial_duration: 500, stimulus_duration: 500, block_num: practiceCount }; },
    choices: ['NO_KEYS'],
    stimulus: function () {
      var last = jsPsych.data.get().last(1).trials[0];
      if (last.condition == 'stop') {
        return last.response === null
          ? '<div class=center-box><div class=center-text><font size = 20>Correct!</font></div></div>' + simpleStopPromptText
          : '<div class=center-box><div class=center-text><font size = 20>There was a star</font></div></div>' + simpleStopPromptText;
      }
      if (last.response === null) return '<div class=center-box><div class=center-text><font size = 20>Respond Faster!</font></div></div>' + simpleStopPromptText;
      if (last.response === last.correct_response) return '<div class=center-box><div class=center-text><font size = 20>Correct!</font></div></div>' + simpleStopPromptText;
      return '<div class=center-box><div class=center-text><font size = 20>Incorrect</font></div></div>' + simpleStopPromptText;
    },
    post_trial_gap: 0, stimulus_duration: 500, trial_duration: 500, response_ends_trial: false,
  };
  simpleStopPracticeTrials.push(practiceFixation, practiceSimpleStopTrial, simpleStopFeedback, ITIBlock);
}

var simpleStopPracticeNode = {
  timeline: [setupSimpleStopPracticeFeedback, feedbackBlock].concat(simpleStopPracticeTrials),
  loop_function: function (data) {
    simpleStopPracticeCount += 1;
    var goLen = 0, goCorrect = 0, goRT = 0, goResp = 0, stopLen = 0, stopResp = 0;
    for (var i = 0; i < data.trials.length; i++) {
      if (data.trials[i].trial_id == 'practice_simple_stop_trial') {
        if (data.trials[i].condition == 'go') {
          goLen++; if (data.trials[i].response != null) { goResp++; goRT += data.trials[i].rt; if (data.trials[i].response == data.trials[i].correct_response) goCorrect++; }
        } else if (data.trials[i].condition == 'stop') {
          stopLen++; if (data.trials[i].response != null) stopResp++;
        }
      }
    }
    var avgRT = goRT / goResp, missed = (goLen - goResp) / goLen, acc = goCorrect / goLen, stopRate = stopResp / stopLen;
    if (simpleStopPracticeCount == practiceThresh || (acc > practiceAccuracyThresh && avgRT <= rtThresh && missed <= missedResponseThresh && stopRate > minStopCorrectPractice && stopRate < maxStopCorrectPractice)) {
      practiceStage = 'memory_only'; return false;
    }
    feedbackText = '<div class=centerbox><p class=block-text>Please take this time to read your feedback!</p>';
    if (acc <= practiceAccuracyThresh) feedbackText += `<p class=block-text>Your accuracy is low. Remember:</p>${simpleStopPromptTextList}`;
    if (avgRT > rtThresh) feedbackText += `<p class=block-text>You have been responding too slowly.</p>${speedReminder}`;
    if (stopRate === maxStopCorrectPractice) feedbackText += `<p class=block-text>You have not been stopping when stars are present. Please try to stop.</p>`;
    if (stopRate === minStopCorrectPractice) feedbackText += `<p class=block-text>Please do not slow down and wait for the star.</p>`;
    feedbackText += `<p class=block-text>We are now going to repeat the practice.</p><p class=block-text>Press <i>enter</i> to begin.</p></div>`;
    stims_simple = createSimpleTrialTypes(simpleStopPracticeLen);
    return true;
  },
};

/** ******************************************/
/*     PRACTICE 3: Memory-Only (Letters)     */
/** ******************************************/
var memoryPracticeCount = 0;
var memoryPracticeTrials = [];
for (var i = 0; i < memoryPracticeLen; i++) {
  var memPresentation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getMemoryOnlyPresentationStim,
    data: { trial_id: 'practice_memory_trial', exp_stage: 'practice', trial_duration: 2000, stimulus_duration: 2000 },
    choices: ['NO_KEYS'], stimulus_duration: 2000, trial_duration: 2000, response_ends_trial: false, post_trial_gap: 500,
    on_finish: function (data) { appendMemoryPresentationData(data); },
    prompt: memoryPromptText,
  };
  var memProbe = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getMemoryOnlyProbeStim,
    data: { trial_id: 'practice_memory_recognition', exp_stage: 'practice', trial_duration: 1500, stimulus_duration: 1000 },
    choices: letterChoices, stimulus_duration: 1000, trial_duration: 1500, response_ends_trial: false, post_trial_gap: 0,
    on_finish: function (data) { appendMemoryOnlyProbeData(data); },
    prompt: memoryPromptText,
  };
  var memFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    data: function () { return { exp_stage: 'practice', trial_id: 'practice_recognition_feedback', trial_duration: 500, stimulus_duration: 500, block_num: practiceCount }; },
    choices: ['NO_KEYS'],
    stimulus: function () {
      var last = jsPsych.data.get().last(1).trials[0];
      if (last.response === last.correct_response) return '<div class=center-box><div class=center-text><font size = 20>Correct!</font></div></div>' + memoryPromptText;
      if (last.response === null) return '<div class=center-box><div class=center-text><font size = 20>Respond Faster!</font></div></div>' + memoryPromptText;
      return '<div class=center-box><div class=center-text><font size = 20>Incorrect</font></div></div>' + memoryPromptText;
    },
    post_trial_gap: 0, stimulus_duration: 500, trial_duration: 500, response_ends_trial: false,
  };
  memoryPracticeTrials.push(practiceFixation, memPresentation, memProbe, memFeedback, ITIBlock);
}

var memoryPracticeNode = {
  timeline: [setupMemoryPracticeFeedback, feedbackBlock].concat(memoryPracticeTrials),
  loop_function: function (data) {
    memoryPracticeCount += 1;
    var correct = 0, total = 0, missed = 0;
    for (var i = 0; i < data.trials.length; i++) {
      if (data.trials[i].trial_id == 'practice_memory_recognition') {
        total++; if (data.trials[i].response == data.trials[i].correct_response) correct++;
        if (data.trials[i].response == null) missed++;
      }
    }
    if (memoryPracticeCount == practiceThresh || (correct / total >= memoryCorrectPracticeThresh && missed / total <= memoryOmissionPracticeThresh)) {
      practiceStage = 'full_integrated'; return false;
    }
    feedbackText = `<div class=centerbox><p class=block-text>Please take this time to read your feedback!</p>`;
    if (correct / total < memoryCorrectPracticeThresh) feedbackText += `<p class=block-text>Your accuracy is too low. Remember:</p>${memoryPromptTextList}`;
    if (missed / total > memoryOmissionPracticeThresh) feedbackText += `<p class=block-text>You have been responding too slowly.</p>${speedReminder}`;
    feedbackText += `<p class=block-text>We are now going to repeat the practice.</p><p class=block-text>Press <i>enter</i> to begin.</p></div>`;
    memoryOnlyStims = createMemoryOnlyTrialTypes(memoryPracticeLen);
    return true;
  },
};

/** ******************************************/
/*  PRACTICE 4: Full Integrated (Mem+Stop)   */
/** ******************************************/
var integratedPracticeTrials = [];
for (var i = 0; i < integratedPracticeLen; i++) {
  if (i == 0) integratedPracticeTrials.push(practiceFixation);

  var intPresentation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getIntegratedPresentationStim,
    data: { trial_id: 'practice_memory_trial', exp_stage: 'practice', trial_duration: 2500, stimulus_duration: 2000 },
    choices: ['NO_KEYS'], stimulus_duration: 2000, trial_duration: 2500, response_ends_trial: false, post_trial_gap: 0,
    on_finish: function (data) { appendMemoryPresentationData(data); },
    prompt: integratedPromptText,
  };
  var intProbe = {
    type: jsPoldracklabStopSignal,
    stimulus: getIntegratedProbeStim,
    SS_stimulus: getStopStim,
    SS_trial_type: getCondition,
    data: { trial_id: 'practice_integrated_probe_trial', exp_stage: 'practice', trial_duration: stimTrialDuration, stimulus_duration: stimStimulusDuration },
    choices: letterChoices,
    correct_choice: getCorrectResponse,
    stimulus_duration: stimStimulusDuration,
    trial_duration: stimTrialDuration,
    response_ends_trial: false,
    SSD: function () {
      var pres = jsPsych.data.get().last(1).values()[0];
      return getIntegratedSSD(pres.stimLength);
    },
    SS_duration: 500,
    post_trial_gap: 0,
    on_finish: function (data) {
      var pres = jsPsych.data.get().last(2).values()[0];
      appendIntegratedProbeData(data, pres);
    },
    prompt: integratedPromptText,
  };
  var intFeedback = {
    type: jsPsychHtmlKeyboardResponse,
    data: function () { return { exp_stage: 'practice', trial_id: 'practice_feedback', trial_duration: 500, stimulus_duration: 500, block_num: practiceCount }; },
    choices: ['NO_KEYS'],
    stimulus: function () {
      var last = jsPsych.data.get().last(1).trials[0];
      if (last.condition == 'stop') {
        return last.response === null
          ? '<div class=center-box><div class=center-text><font size = 20>Correct!</font></div></div>' + integratedPromptText
          : '<div class=center-box><div class=center-text><font size = 20>There was a star</font></div></div>' + integratedPromptText;
      }
      if (last.response == null) return '<div class=center-box><div class=center-text><font size = 20>Respond Faster!</font></div></div>' + integratedPromptText;
      if (last.response === last.correct_response) return '<div class=center-box><div class=center-text><font size = 20>Correct!</font></div></div>' + integratedPromptText;
      return '<div class=center-box><div class=center-text><font size = 20>Incorrect</font></div></div>' + integratedPromptText;
    },
    post_trial_gap: 0, stimulus_duration: 500, trial_duration: 500, response_ends_trial: false,
  };
  integratedPracticeTrials.push(practiceFixation, intPresentation, intProbe, intFeedback, ITIBlock);
}

var practiceCount = 0;
var integratedPracticeNode = {
  timeline: [setupIntegratedPracticeFeedback, feedbackBlock].concat(integratedPracticeTrials),
  loop_function: function (data) {
    practiceCount += 1;
    var goLen = 0, goCorrect = 0, goRT = 0, goResp = 0, stopLen = 0, stopResp = 0;
    for (var i = 0; i < data.trials.length; i++) {
      if (data.trials[i].trial_id == 'practice_integrated_probe_trial') {
        if (data.trials[i].condition == 'go') {
          goLen++; if (data.trials[i].response != null) { goResp++; goRT += data.trials[i].rt; if (data.trials[i].response == data.trials[i].correct_response) goCorrect++; }
        } else if (data.trials[i].condition == 'stop') {
          stopLen++; if (data.trials[i].response != null) stopResp++;
        }
      }
    }
    var avgRT = goRT / goResp, missed = (goLen - goResp) / goLen, acc = goCorrect / goLen, stopRate = stopResp / stopLen;
    if (practiceCount == practiceThresh || (acc > practiceAccuracyThresh && avgRT <= letterRtThresh && missed <= missedResponseThresh && stopRate > minStopCorrectPractice && stopRate < maxStopCorrectPractice)) {
      feedbackText = `<div class="centerbox"><p class="block-text">We will now begin the test portion.</p><p class="block-text">Keep both hands on the keys.</p><p class="block-text">Press <i>enter</i> to continue.</p></div>`;
      expStage = 'test';
      return false;
    }
    feedbackText = '<div class=centerbox><p class=block-text>Please take this time to read your feedback!</p>';
    if (acc <= practiceAccuracyThresh) feedbackText += `<p class=block-text>Your accuracy is low. Remember:</p>${integratedPromptTextList}`;
    if (avgRT > letterRtThresh) feedbackText += `<p class=block-text>You have been responding too slowly.</p>${speedReminder}`;
    if (missed > missedResponseThresh) feedbackText += `<p class=block-text>You have missed trials. Respond as quickly and accurately as possible.</p>`;
    if (stopRate === maxStopCorrectPractice) feedbackText += `<p class=block-text>You have not been stopping when stars are present.</p>`;
    if (stopRate === minStopCorrectPractice) feedbackText += `<p class=block-text>Please do not slow down and wait for the star.</p>`;
    feedbackText += `<p class=block-text>We are now going to repeat the practice.</p><p class=block-text>Press <i>enter</i> to begin.</p></div>`;
    stims_integrated = createIntegratedTrialTypes(integratedPracticeLen);
    return true;
  },
};

/** ******************************************/
/*     TEST: Simple Stop Signal Blocks       */
/** ******************************************/
var simpleTestTrials = [];
simpleTestTrials.push(attentionNode);
for (var i = 0; i < numTrialsPerSimpleBlock; i++) {
  if (i == 0) simpleTestTrials.push(fixationBlock);
  var testSimpleStopTrial = {
    type: jsPoldracklabStopSignal,
    stimulus: getSimpleStim,
    SS_stimulus: getStopStim,
    SS_trial_type: getCondition,
    data: { trial_id: 'test_simple_stop_trial', exp_stage: 'test', trial_duration: stimTrialDuration, stimulus_duration: stimStimulusDuration },
    choices: stopChoices,
    correct_choice: getCorrectResponse,
    stimulus_duration: stimStimulusDuration,
    trial_duration: stimTrialDuration,
    response_ends_trial: false,
    SSD: getSimpleSSD,
    SS_duration: 500,
    post_trial_gap: 0,
    on_finish: function (data) { appendSimpleStopData(data); },
  };
  simpleTestTrials.push(fixationBlock, testSimpleStopTrial, ITIBlock);
}

var simpleTestCount = 0;
var testCount = 0;
var simpleTestNode = {
  timeline: [feedbackBlock].concat(simpleTestTrials),
  loop_function: function (data) {
    currentTrial = 0;
    simpleTestCount += 1;
    testCount += 1;

    var goLen = 0, goCorrect = 0, goRT = 0, goResp = 0, stopLen = 0, stopResp = 0;
    SSDs = [];
    for (var i = 0; i < data.trials.length; i++) {
      if (data.trials[i].trial_id == 'test_simple_stop_trial') {
        SSDs.push(data.trials[i].SSD);
        if (data.trials[i].condition == 'go' && data.trials[i].block_num == simpleTestCount - 1) {
          goLen++; if (data.trials[i].rt != null) { goResp++; goRT += data.trials[i].rt; if (data.trials[i].response == data.trials[i].correct_response) goCorrect++; }
        } else if (data.trials[i].condition == 'stop' && data.trials[i].block_num == simpleTestCount - 1) {
          stopLen++; if (data.trials[i].rt != null) stopResp++;
        }
      }
    }
    var avgRT = goRT / goResp, missed = (goLen - goResp) / goLen, acc = goCorrect / goLen, stopRate = stopResp / stopLen;

    currentAttentionCheckData = attentionCheckData.shift();

    if (simpleTestCount == numSimpleTestBlocks) {
      feedbackText = `<div class=centerbox><p class=block-text>Done with the shape blocks.</p><p class=block-text>Now you will complete the memory blocks.</p><p class=block-text>Use your <b>left hand</b>: X key and Z key.</p><p class=block-text>Press <i>enter</i> to continue.</p></div>`;
      return false;
    }
    feedbackText = '<div class=centerbox><p class=block-text>Please take this time to read your feedback!</p>';
    feedbackText += `<p class=block-text>You have completed ${simpleTestCount} out of ${numSimpleTestBlocks} shape blocks.</p>`;
    if (acc <= accuracyThresh) feedbackText += `<p class=block-text>Your accuracy is low. Remember:</p>${simpleStopPromptTextList}`;
    if (avgRT > rtThresh) feedbackText += `<p class=block-text>You have been responding too slowly.</p>${speedReminder}`;
    if (missed > missedResponseThresh) feedbackText += `<p class=block-text>You have missed trials. Respond as quickly and accurately as possible.</p>`;
    if (stopRate <= minStopCorrect) feedbackText += `<p class=block-text>You have not been stopping when stars are present. Please try to stop.</p>`;
    if (stopRate >= maxStopCorrect) feedbackText += `<p class=block-text>Please do not slow down and wait for the star.</p>`;
    feedbackText += '<p class=block-text>Press <i>enter</i> to continue.</p></div>';

    stims_simple = createSimpleTrialTypes(numTrialsPerSimpleBlock);
    return true;
  },
};

/** ******************************************/
/*     TEST: Integrated Memory Blocks        */
/** ******************************************/
var integratedTestTrials = [];
integratedTestTrials.push(attentionNode);
for (var i = 0; i < numTrialsPerIntegratedBlock; i++) {
  if (i == 0) integratedTestTrials.push(fixationBlock);
  var testIntPresentation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getIntegratedPresentationStim,
    data: { trial_id: 'test_memory_trial', exp_stage: 'test', trial_duration: 2000, stimulus_duration: 2000 },
    choices: ['NO_KEYS'], stimulus_duration: 2000, trial_duration: 2000, response_ends_trial: false, post_trial_gap: 500,
    on_finish: function (data) { appendMemoryPresentationData(data); },
  };
  var testIntProbe = {
    type: jsPoldracklabStopSignal,
    stimulus: getIntegratedProbeStim,
    SS_stimulus: getStopStim,
    SS_trial_type: getCondition,
    data: { trial_id: 'test_integrated_probe_trial', exp_stage: 'test', trial_duration: stimTrialDuration, stimulus_duration: stimStimulusDuration },
    choices: letterChoices,
    correct_choice: getCorrectResponse,
    stimulus_duration: stimStimulusDuration,
    trial_duration: stimTrialDuration,
    response_ends_trial: false,
    SSD: function () {
      var pres = jsPsych.data.get().last(1).values()[0];
      return getIntegratedSSD(pres.stimLength);
    },
    SS_duration: 500,
    post_trial_gap: 0,
    on_finish: function (data) {
      var pres = jsPsych.data.get().last(2).values()[0];
      appendIntegratedProbeData(data, pres);
    },
  };
  integratedTestTrials.push(fixationBlock, testIntPresentation, testIntProbe, ITIBlock);
}

var integratedTestCount = 0;
var integratedTestNode = {
  timeline: [feedbackBlock].concat(integratedTestTrials),
  loop_function: function (data) {
    currentTrial = 0;
    integratedTestCount += 1;
    testCount += 1;

    var goLen = 0, goCorrect = 0, goRT = 0, goResp = 0, stopLen = 0, stopResp = 0;
    SSDs = [];
    for (var i = 0; i < data.trials.length; i++) {
      if (data.trials[i].trial_id == 'test_integrated_probe_trial') {
        SSDs.push(data.trials[i].SSD);
        if (data.trials[i].condition == 'go' && data.trials[i].block_num == integratedTestCount - 1) {
          goLen++; if (data.trials[i].rt != null) { goResp++; goRT += data.trials[i].rt; if (data.trials[i].response == data.trials[i].correct_response) goCorrect++; }
        } else if (data.trials[i].condition == 'stop' && data.trials[i].block_num == integratedTestCount - 1) {
          stopLen++; if (data.trials[i].rt != null) stopResp++;
        }
      }
    }
    var avgRT = goRT / goResp, missed = (goLen - goResp) / goLen, acc = goCorrect / goLen, stopRate = stopResp / stopLen;
    var SSD_0_percentage = SSDs.filter(function (x) { return x == 0; }).length / SSDs.length;

    currentAttentionCheckData = attentionCheckData.shift();

    if (integratedTestCount == numIntegratedTestBlocks) {
      feedbackText = `<div class=centerbox><p class=block-text>Done with this task.</p><p class=centerbox>Press <i>enter</i> to continue.</p></div>`;
      return false;
    }
    feedbackText = '<div class=centerbox><p class=block-text>Please take this time to read your feedback!</p>';
    feedbackText += `<p class=block-text>You have completed ${integratedTestCount} out of ${numIntegratedTestBlocks} memory blocks.</p>`;
    if (acc <= accuracyThresh) feedbackText += `<p class=block-text>Your accuracy is low. Remember:</p>${integratedPromptTextList}`;
    if (avgRT > letterRtThresh) feedbackText += `<p class=block-text>You have been responding too slowly.</p>${speedReminder}`;
    if (missed > missedResponseThresh) feedbackText += `<p class=block-text>You have missed trials. Respond as quickly and accurately as possible.</p>`;
    if (stopRate >= maxStopCorrect) feedbackText += `<p class=block-text>You have not been stopping when stars are present. Please try to stop.</p>`;
    if (stopRate <= minStopCorrect || SSD_0_percentage < 0.5) feedbackText += `<p class=block-text>Please do not slow down and wait for the star.</p>`;
    feedbackText += '<p class=block-text>Press <i>enter</i> to continue.</p></div>';

    stims_integrated = createIntegratedTrialTypes(numTrialsPerIntegratedBlock);
    return true;
  },
  on_timeline_finish: function () {
    window.dataSync();
  },
};

/* ************************************ */
/*          Post-task & Setup           */
/* ************************************ */

var postTaskQuestion =
  'Do you have any comments, concerns, or issues pertaining to this task?';

var postTaskBlock = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: `<h1 class=block-text>${postTaskQuestion}</h1>`,
      name: postTaskQuestion,
      required: false,
      rows: 20,
      columns: 80,
    },
  ],
  response_ends_trial: true,
  data: { trial_id: 'post_task_feedback' },
  on_finish: function (data) {
    data.question = postTaskQuestion;
    data.response = data.response[postTaskQuestion];
  },
};

var fullscreen = { type: jsPsychFullscreen, fullscreen_mode: true };
var exitFullscreen = { type: jsPsychFullscreen, fullscreen_mode: false };

var expID = 'stop_signal_with_integrated_memory';

var endBlock = {
  type: jsPsychHtmlKeyboardResponse,
  data: { trial_id: 'end', exp_id: expID, trial_duration: 180000 },
  trial_duration: 180000,
  stimulus: endText,
  choices: ['Enter'],
  post_trial_gap: 0,
};

/* ************************************ */
/*         Experiment Timeline          */
/* ************************************ */
var stop_signal_with_integrated_memory_experiment = [];
var stop_signal_with_integrated_memory_init = () => {
  jsPsych.pluginAPI.preloadImages(images);

  stop_signal_with_integrated_memory_experiment.push(fullscreen);

  // Practice 1: Go-only shapes
  stop_signal_with_integrated_memory_experiment.push({
    timeline: [feedbackInstructBlock, goInstructionsBlock],
  });
  stop_signal_with_integrated_memory_experiment.push({
    type: jsPsychCallFunction,
    func: function () { goStims = createGoTrialTypes(goPracticeLen); },
  });
  stop_signal_with_integrated_memory_experiment.push(goPracticeNode);

  // Practice 2: Simple stop (shapes + star)
  stop_signal_with_integrated_memory_experiment.push({
    timeline: [simpleStopInstructionsBlock],
  });
  stop_signal_with_integrated_memory_experiment.push({
    type: jsPsychCallFunction,
    func: function () { stims_simple = createSimpleTrialTypes(simpleStopPracticeLen); },
  });
  stop_signal_with_integrated_memory_experiment.push(simpleStopPracticeNode);

  // Practice 3: Memory-only (letters + probe)
  stop_signal_with_integrated_memory_experiment.push({
    timeline: [memoryInstructionsBlock],
  });
  stop_signal_with_integrated_memory_experiment.push({
    type: jsPsychCallFunction,
    func: function () { memoryOnlyStims = createMemoryOnlyTrialTypes(memoryPracticeLen); },
  });
  stop_signal_with_integrated_memory_experiment.push(memoryPracticeNode);

  // Practice 4: Full integrated (letters + probe + star)
  stop_signal_with_integrated_memory_experiment.push({
    timeline: [integratedInstructionsBlock],
  });
  stop_signal_with_integrated_memory_experiment.push({
    type: jsPsychCallFunction,
    func: function () { stims_integrated = createIntegratedTrialTypes(integratedPracticeLen); },
  });
  stop_signal_with_integrated_memory_experiment.push(integratedPracticeNode);

  // Test: Simple stop signal blocks
  stop_signal_with_integrated_memory_experiment.push({
    type: jsPsychCallFunction,
    func: function () { stims_simple = createSimpleTrialTypes(numTrialsPerSimpleBlock); },
  });
  stop_signal_with_integrated_memory_experiment.push(simpleTestNode);

  // Test: Integrated memory blocks
  stop_signal_with_integrated_memory_experiment.push({
    type: jsPsychCallFunction,
    func: function () { stims_integrated = createIntegratedTrialTypes(numTrialsPerIntegratedBlock); },
  });
  stop_signal_with_integrated_memory_experiment.push(integratedTestNode);

  stop_signal_with_integrated_memory_experiment.push(postTaskBlock);
  stop_signal_with_integrated_memory_experiment.push(endBlock);
  stop_signal_with_integrated_memory_experiment.push(exitFullscreen);
};
