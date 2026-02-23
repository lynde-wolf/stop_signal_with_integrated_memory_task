"""Tests for stop_signal_with_integrated_memory experiment.js functions.

Run with:
    cd stop_signal_with_integrated_memory
    uv run pytest -v

Interactive exploration:
    uv run ipython
    >>> from tests.test_experiment import call_js
    >>> call_js('getVars')
    >>> call_js('createSimpleTrialTypes', 12)
"""

from __future__ import annotations

import json
import subprocess
from collections import Counter
from pathlib import Path

import pytest

HARNESS = Path(__file__).parent / 'js_harness.js'


def call_js(fn: str, *args) -> dict | list:
    """Execute a JS function via the Node harness and return parsed JSON."""
    cmd = json.dumps({'fn': fn, 'args': list(args)})
    result = subprocess.run(
        ['node', str(HARNESS), cmd],
        capture_output=True,
        text=True,
        timeout=10,
    )
    if result.returncode != 0:
        raise RuntimeError(f'Node error:\n{result.stderr}')
    return json.loads(result.stdout)


# ---------------------------------------------------------------
# Experiment variables
# ---------------------------------------------------------------

class TestExperimentVariables:
    """Verify configuration constants are set correctly."""

    @pytest.fixture(autouse=True)
    def _load_vars(self):
        self.vars = call_js('getVars')

    def test_memory_lengths_even_only(self):
        assert self.vars['possibleMemoryLengths'] == [2, 4, 6]

    def test_stop_conditions_ratio(self):
        conds = self.vars['stopSignalsConditions']
        assert conds.count('go') == 2
        assert conds.count('stop') == 1

    def test_shapes(self):
        assert set(self.vars['shapes']) == {'circle', 'square'}

    def test_position_sets_keys(self):
        assert set(self.vars['positionSets'].keys()) == {'2', '4', '6'}

    def test_position_sets_counts(self):
        for size_str, positions in self.vars['positionSets'].items():
            assert len(positions) == int(size_str)

    def test_practice_lengths(self):
        assert self.vars['goPracticeLen'] == 10
        assert self.vars['simpleStopPracticeLen'] == 10
        assert self.vars['memoryPracticeLen'] == 10
        assert self.vars['integratedPracticeLen'] == 10

    def test_test_block_sizes(self):
        assert self.vars['numTrialsPerSimpleBlock'] == 30
        assert self.vars['numTrialsPerIntegratedBlock'] == 36

    def test_practice_thresholds(self):
        assert self.vars['practiceThresh'] == 3
        assert self.vars['practiceAccuracyThresh'] == 0.75
        assert self.vars['goCorrectPracticeThresh'] == 0.75
        assert self.vars['memoryCorrectPracticeThresh'] == 0.75


# ---------------------------------------------------------------
# Trial type generators
# ---------------------------------------------------------------

class TestCreateGoTrialTypes:
    def test_returns_correct_length(self):
        trials = call_js('createGoTrialTypes', 10)
        assert len(trials) == 10

    def test_all_go_condition(self):
        trials = call_js('createGoTrialTypes', 10)
        assert all(t['stop_condition'] == 'go' for t in trials)

    def test_both_shapes_present(self):
        trials = call_js('createGoTrialTypes', 10)
        shapes = {t['stopStim'] for t in trials}
        assert shapes == {'circle', 'square'}


class TestCreateSimpleTrialTypes:
    def test_exact_length(self):
        trials = call_js('createSimpleTrialTypes', 30)
        assert len(trials) == 30

    def test_non_divisible_length(self):
        trials = call_js('createSimpleTrialTypes', 10)
        assert len(trials) == 10

    def test_stop_go_ratio_in_full_block(self):
        trials = call_js('createSimpleTrialTypes', 30)
        go = sum(1 for t in trials if t['stop_condition'] == 'go')
        stop = sum(1 for t in trials if t['stop_condition'] == 'stop')
        assert go == 20
        assert stop == 10

    def test_both_shapes(self):
        trials = call_js('createSimpleTrialTypes', 30)
        shapes = {t['stopStim'] for t in trials}
        assert shapes == {'circle', 'square'}


class TestCreateMemoryOnlyTrialTypes:
    def test_exact_length(self):
        trials = call_js('createMemoryOnlyTrialTypes', 10)
        assert len(trials) == 10

    def test_only_even_memory_lengths(self):
        trials = call_js('createMemoryOnlyTrialTypes', 12)
        lengths = {t['memoryStimLength'] for t in trials}
        assert lengths <= {2, 4, 6}
        assert 3 not in lengths
        assert 5 not in lengths

    def test_both_memory_conditions(self):
        trials = call_js('createMemoryOnlyTrialTypes', 12)
        conds = {t['memory_condition'] for t in trials}
        assert conds == {'in memory set', 'not in memory set'}


class TestCreateIntegratedTrialTypes:
    def test_exact_length(self):
        trials = call_js('createIntegratedTrialTypes', 36)
        assert len(trials) == 36

    def test_non_divisible_length(self):
        trials = call_js('createIntegratedTrialTypes', 10)
        assert len(trials) == 10

    def test_only_even_memory_lengths(self):
        trials = call_js('createIntegratedTrialTypes', 36)
        lengths = {t['memoryStimLength'] for t in trials}
        assert lengths == {2, 4, 6}

    def test_all_conditions_present(self):
        trials = call_js('createIntegratedTrialTypes', 36)
        stop = {t['stop_condition'] for t in trials}
        mem = {t['memory_condition'] for t in trials}
        assert stop == {'go', 'stop'}
        assert mem == {'in memory set', 'not in memory set'}

    def test_unique_combos_balanced_in_full_block(self):
        trials = call_js('createIntegratedTrialTypes', 36)
        combos = Counter(
            (t['stop_condition'], t['memoryStimLength'], t['memory_condition'])
            for t in trials
        )
        # 2 unique stop × 3 sizes × 2 memory = 12 unique combos
        # go appears 2x in conditions → go combos get 4, stop combos get 2
        assert len(combos) == 12
        for key, count in combos.items():
            if key[0] == 'go':
                assert count == 4
            else:
                assert count == 2


# ---------------------------------------------------------------
# Spatial layout
# ---------------------------------------------------------------

class TestBuildSpatialLetterHTML:
    @pytest.mark.parametrize('letters', ['AB', 'ABCD', 'ABCDEF'])
    def test_contains_all_letters(self, letters):
        html = call_js('buildSpatialLetterHTML', letters)
        for ch in letters:
            assert f'>{ch}<' in html

    @pytest.mark.parametrize('letters', ['AB', 'ABCD', 'ABCDEF'])
    def test_contains_container_div(self, letters):
        html = call_js('buildSpatialLetterHTML', letters)
        assert "class='container'" in html

    def test_inline_transforms(self):
        html = call_js('buildSpatialLetterHTML', 'AB')
        assert 'translate(calc(-50% + -10vw)' in html or 'translate(calc(-50% + 10vw)' in html


# ---------------------------------------------------------------
# Probe letter generation
# ---------------------------------------------------------------

class TestGenerateProbeLetter:
    def test_in_memory_set(self):
        for _ in range(20):
            letter = call_js('generateProbeLetter', 'in memory set', 'ABCD')
            assert letter in 'ABCD'

    def test_not_in_memory_set(self):
        for _ in range(20):
            letter = call_js('generateProbeLetter', 'not in memory set', 'ABCD')
            assert letter not in 'ABCD'
            assert letter.isalpha() and letter.isupper()


# ---------------------------------------------------------------
# SSD lookup
# ---------------------------------------------------------------

class TestGetIntegratedSSD:
    def test_returns_correct_ssd_per_load(self):
        assert call_js('getIntegratedSSD', 2, 100, 200, 300) == 100
        assert call_js('getIntegratedSSD', 4, 100, 200, 300) == 200
        assert call_js('getIntegratedSSD', 6, 100, 200, 300) == 300

    def test_default_fallback(self):
        result = call_js('getIntegratedSSD', 99, 100, 200, 300)
        assert result == 100  # falls back to SSD_2


# ---------------------------------------------------------------
# Key mapping
# ---------------------------------------------------------------

class TestKeyMapping:
    @pytest.mark.parametrize('group', [0, 1, 2, 3])
    def test_returns_four_mappings(self, group):
        resp = call_js('getKeyMappingForTask', group)
        assert len(resp) == 4

    @pytest.mark.parametrize('group', [0, 1, 2, 3])
    def test_right_hand_for_shapes(self, group):
        resp = call_js('getKeyMappingForTask', group)
        right_keys = {resp[0][1], resp[1][1]}
        assert right_keys == {',', '.'}

    @pytest.mark.parametrize('group', [0, 1, 2, 3])
    def test_left_hand_for_memory(self, group):
        resp = call_js('getKeyMappingForTask', group)
        left_keys = {resp[2][1], resp[3][1]}
        assert left_keys == {'x', 'z'}

    def test_counterbalancing_differs(self):
        r0 = call_js('getKeyMappingForTask', 0)
        r1 = call_js('getKeyMappingForTask', 1)
        assert r0[2][1] != r1[2][1]  # memory keys swap between even/odd


# ---------------------------------------------------------------
# repeatShuffle utility
# ---------------------------------------------------------------

class TestRepeatShuffle:
    def test_exact_length(self):
        result = call_js('repeatShuffle', [1, 2, 3], 7)
        assert len(result) == 7

    def test_all_elements_present(self):
        result = call_js('repeatShuffle', [1, 2, 3], 7)
        assert set(result) == {1, 2, 3}

    def test_divisible_length(self):
        result = call_js('repeatShuffle', [1, 2], 6)
        assert len(result) == 6
        assert Counter(result) == {1: 3, 2: 3}
