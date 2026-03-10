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
        assert self.vars['goPracticeLen'] == 6
        assert self.vars['simpleStopPracticeLen'] == 10
        assert self.vars['memoryPracticeLen'] == 12
        assert self.vars['integratedPracticeLen'] == 12

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

    def test_stop_go_composition_non_divisible(self):
        """For n=10 (non-divisible by base 6), verify both conditions
        appear and the ratio is within the bounds imposed by slicing
        from ceil(10/6)*6 = 12 shuffled items (8 go, 4 stop)."""
        trials = call_js('createSimpleTrialTypes', 10)
        go = sum(1 for t in trials if t['stop_condition'] == 'go')
        stop = sum(1 for t in trials if t['stop_condition'] == 'stop')
        assert go + stop == 10
        assert stop >= 2, f'Expected at least 2 stop trials, got {stop}'
        assert stop <= 4, f'Expected at most 4 stop trials, got {stop}'


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

    def test_both_positions_present_for_two_letters(self):
        """Both x=-10 and x=10 transforms must appear (not just one)."""
        html = call_js('buildSpatialLetterHTML', 'AB')
        # positionSets[2]: [{x:-10, y:0}, {x:10, y:0}]
        assert 'calc(-50% + -10vw), calc(-50% + 0vw)' in html, \
            'Missing position for x=-10, y=0'
        assert 'calc(-50% + 10vw), calc(-50% + 0vw)' in html, \
            'Missing position for x=10, y=0'

    def test_nonzero_y_positions_for_four_letters(self):
        """4-letter layout has non-zero y values; verify all four positions."""
        html = call_js('buildSpatialLetterHTML', 'ABCD')
        # positionSets[4]: [{x:0,y:-10}, {x:10,y:0}, {x:0,y:10}, {x:-10,y:0}]
        assert 'calc(-50% + 0vw), calc(-50% + -10vw)' in html
        assert 'calc(-50% + 10vw), calc(-50% + 0vw)' in html
        assert 'calc(-50% + 0vw), calc(-50% + 10vw)' in html
        assert 'calc(-50% + -10vw), calc(-50% + 0vw)' in html

    def test_y_axis_uses_vw_not_vh(self):
        """Documents current behavior: y-axis uses vw instead of vh.

        Vertical offsets using vw (viewport width) instead of vh (viewport
        height) will produce non-square layouts on non-square viewports.
        This test will fail when the code is corrected to use vh — that
        should be the trigger to update it.
        """
        html = call_js('buildSpatialLetterHTML', 'ABCD')
        assert 'vh' not in html, \
            'vh detected — the vw→vh fix has been applied; update this test'


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

    def test_in_memory_set_produces_variety(self):
        """An implementation that always returns the same letter would pass
        the membership check but fail this distribution check."""
        letters = {call_js('generateProbeLetter', 'in memory set', 'ABCD')
                   for _ in range(40)}
        assert len(letters) >= 2, \
            f'Expected variety from 4-letter set over 40 draws, got {letters}'

    def test_not_in_memory_set_produces_variety(self):
        letters = {call_js('generateProbeLetter', 'not in memory set', 'ABCD')
                   for _ in range(40)}
        assert len(letters) >= 2, \
            f'Expected variety from 22-letter pool over 40 draws, got {letters}'


# ---------------------------------------------------------------
# SSD lookup
# ---------------------------------------------------------------

class TestGetIntegratedSSD:
    def test_returns_correct_ssd_per_load(self):
        assert call_js('getIntegratedSSD', 2, 100, 200, 300) == 100
        assert call_js('getIntegratedSSD', 4, 100, 200, 300) == 200
        assert call_js('getIntegratedSSD', 6, 100, 200, 300) == 300

    def test_default_fallback_returns_ssd_2(self):
        """An unknown memory load silently falls back to SSD_2 via the
        switch default branch.  This documents that behavior — but an
        unknown load arguably should raise an error rather than silently
        returning a potentially wrong SSD.  If the code is changed to
        throw, replace this test with a 'raises' check."""
        result = call_js('getIntegratedSSD', 99, 100, 200, 300)
        assert result == 100


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

    def test_memory_keys_swap_between_even_and_odd(self):
        r0 = call_js('getKeyMappingForTask', 0)
        r1 = call_js('getKeyMappingForTask', 1)
        assert r0[2][1] != r1[2][1]

    def test_shape_keys_swap_between_low_and_high_groups(self):
        """Groups 0-1 vs 2-3 swap which shape maps to comma vs period."""
        r0 = call_js('getKeyMappingForTask', 0)
        r2 = call_js('getKeyMappingForTask', 2)
        assert r0[0][1] != r2[0][1], \
            'Shape key for index 0 should differ between groups 0 and 2'

    def test_all_four_groups_produce_distinct_mappings(self):
        key_tuples = set()
        for g in range(4):
            resp = call_js('getKeyMappingForTask', g)
            key_tuples.add(tuple(r[1] for r in resp))
        assert len(key_tuples) == 4, \
            'All four group indices should yield distinct key mappings'


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

    def test_non_divisible_balance(self):
        """For non-divisible length, each element count should differ
        by at most 1 from the ideal (len/n_elements)."""
        arr = [1, 2, 3]
        n = 7
        result = call_js('repeatShuffle', arr, n)
        counts = Counter(result)
        ideal = n / len(arr)
        for elem in arr:
            assert abs(counts[elem] - ideal) <= 1, \
                f'Element {elem} count {counts[elem]} too far from ideal {ideal:.1f}'


# ---------------------------------------------------------------
# shuffleArray
# ---------------------------------------------------------------

class TestShuffleArray:
    def test_preserves_length(self):
        result = call_js('shuffleArray', [1, 2, 3, 4, 5])
        assert len(result) == 5

    def test_preserves_elements(self):
        result = call_js('shuffleArray', [10, 20, 30, 40])
        assert sorted(result) == [10, 20, 30, 40]

    def test_does_not_mutate_input_in_js(self):
        """Verify JS-side immutability: shuffleArray uses spread, not in-place swap."""
        result = call_js('shuffleArrayWithMutationCheck', [1, 2, 3, 4, 5])
        assert result['inputAfter'] == result['inputBefore'], \
            'shuffleArray mutated the input array in JS'
        assert sorted(result['output']) == sorted(result['inputBefore'])

    def test_empty_array(self):
        assert call_js('shuffleArray', []) == []

    def test_single_element(self):
        assert call_js('shuffleArray', [42]) == [42]


# ---------------------------------------------------------------
# SSD staircase: appendSimpleStopData
# ---------------------------------------------------------------

class TestAppendSimpleStopData:
    """Verify the stop-signal delay staircase for simple stop blocks.

    The staircase rule:
      - Successful stop (response is null on stop trial) → SSD += 50
      - Failed stop (response is not null on stop trial) → SSD -= 50
      - SSD clamped to [minSSD, maxSSD] = [0, 1000]
    """

    def _make_stim_data(self, condition, correct_resp=','):
        return {
            'stim': 'circle',
            'condition': condition,
            'correct_response': correct_resp,
        }

    def test_successful_stop_increases_ssd(self):
        data = {'response': None}
        stim = self._make_stim_data('stop')
        out = call_js('appendSimpleStopData', data, stim, 250, None, None, 'practice')
        assert out['SSD_simple'] == 300

    def test_failed_stop_decreases_ssd(self):
        data = {'response': ','}
        stim = self._make_stim_data('stop')
        out = call_js('appendSimpleStopData', data, stim, 250, None, None, 'practice')
        assert out['SSD_simple'] == 200

    def test_ssd_does_not_exceed_max(self):
        data = {'response': None}
        stim = self._make_stim_data('stop')
        out = call_js('appendSimpleStopData', data, stim, 1000, None, None, 'practice')
        assert out['SSD_simple'] == 1000

    def test_ssd_does_not_go_below_min(self):
        data = {'response': ','}
        stim = self._make_stim_data('stop')
        out = call_js('appendSimpleStopData', data, stim, 0, None, None, 'practice')
        assert out['SSD_simple'] == 0

    def test_stop_correct_trial_when_inhibited(self):
        data = {'response': None}
        stim = self._make_stim_data('stop')
        out = call_js('appendSimpleStopData', data, stim, 250, None, None, 'practice')
        assert out['data']['correct_trial'] == 1

    def test_stop_correct_trial_when_failed(self):
        data = {'response': ','}
        stim = self._make_stim_data('stop')
        out = call_js('appendSimpleStopData', data, stim, 250, None, None, 'practice')
        assert out['data']['correct_trial'] == 0

    def test_go_correct_response(self):
        data = {'response': ','}
        stim = self._make_stim_data('go', ',')
        out = call_js('appendSimpleStopData', data, stim, 250, None, ',', 'practice')
        assert out['data']['correct_trial'] == 1

    def test_go_incorrect_response(self):
        data = {'response': '.'}
        stim = self._make_stim_data('go', ',')
        out = call_js('appendSimpleStopData', data, stim, 250, None, ',', 'practice')
        assert out['data']['correct_trial'] == 0

    def test_go_no_ssd_change(self):
        """SSD should not change on go trials."""
        data = {'response': ','}
        stim = self._make_stim_data('go', ',')
        out = call_js('appendSimpleStopData', data, stim, 250, None, ',', 'practice')
        assert out['SSD_simple'] == 250


# ---------------------------------------------------------------
# SSD staircase: appendIntegratedProbeData
# ---------------------------------------------------------------

class TestAppendIntegratedProbeData:
    """Verify the per-memory-load SSD staircase for integrated blocks.

    Separate SSDs tracked for memory loads 2, 4, 6.
    stimData.stimLength and presentationData.stimLength are kept consistent
    (as they are in the real experiment) to avoid masking bugs where the
    function reads from the wrong source.
    """

    def _make_stim_data(self, stop_cond, stim_length=4,
                        mem_cond='in memory set', correct_resp='x'):
        return {
            'stim': 'A',
            'stimLength': stim_length,
            'stop_condition': stop_cond,
            'memory_condition': mem_cond,
            'recognitionLetter': 'A',
            'selectedLetters': 'ABCD',
            'correct_response': correct_resp,
        }

    def _make_pres(self, stim_length):
        return {'stimLength': stim_length}

    def test_successful_stop_increases_ssd_for_load_2(self):
        data = {'response': None}
        stim = self._make_stim_data('stop', stim_length=2)
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(2), 250, 300, 350,
        )
        assert out['SSD_2'] == 300
        assert out['SSD_4'] == 300  # unchanged
        assert out['SSD_6'] == 350  # unchanged
        assert out['data']['stimLength'] == 2

    def test_failed_stop_decreases_ssd_for_load_4(self):
        data = {'response': 'x'}
        stim = self._make_stim_data('stop', stim_length=4)
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(4), 250, 300, 350,
        )
        assert out['SSD_4'] == 250
        assert out['SSD_2'] == 250  # unchanged
        assert out['SSD_6'] == 350  # unchanged

    def test_successful_stop_increases_ssd_for_load_6(self):
        data = {'response': None}
        stim = self._make_stim_data('stop', stim_length=6)
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(6), 250, 300, 350,
        )
        assert out['SSD_6'] == 400

    def test_ssd_clamped_at_max(self):
        data = {'response': None}
        stim = self._make_stim_data('stop', stim_length=2)
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(2), 1000, 300, 350,
        )
        assert out['SSD_2'] == 1000

    def test_ssd_clamped_at_min(self):
        data = {'response': 'x'}
        stim = self._make_stim_data('stop', stim_length=6)
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(6), 250, 300, 0,
        )
        assert out['SSD_6'] == 0

    def test_go_trial_correct(self):
        data = {'response': 'x'}
        stim = self._make_stim_data('go', stim_length=4,
                                    mem_cond='in memory set', correct_resp='x')
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(4), 250, 300, 350,
        )
        assert out['data']['correct_trial'] == 1

    def test_go_trial_incorrect(self):
        data = {'response': 'z'}
        stim = self._make_stim_data('go', stim_length=4,
                                    mem_cond='in memory set', correct_resp='x')
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(4), 250, 300, 350,
        )
        assert out['data']['correct_trial'] == 0

    def test_go_trial_no_ssd_change(self):
        data = {'response': 'x'}
        stim = self._make_stim_data('go', stim_length=4,
                                    mem_cond='in memory set', correct_resp='x')
        out = call_js(
            'appendIntegratedProbeData', data, stim,
            self._make_pres(4), 250, 300, 350,
        )
        assert out['SSD_2'] == 250
        assert out['SSD_4'] == 300
        assert out['SSD_6'] == 350

    def test_recorded_stimlength_matches_presentation(self):
        """stimLength in the recorded data should match presentationData,
        not be an unrelated hardcoded value."""
        for load in (2, 4, 6):
            data = {'response': None}
            stim = self._make_stim_data('stop', stim_length=load)
            out = call_js(
                'appendIntegratedProbeData', data, stim,
                self._make_pres(load), 250, 250, 250,
            )
            assert out['data']['stimLength'] == load


# ---------------------------------------------------------------
# Data recording: appendGoTrialData
# ---------------------------------------------------------------

class TestAppendGoTrialData:
    def test_records_stim_and_condition(self):
        data = {}
        stim = {'stim': 'circle', 'condition': 'go', 'correct_response': ','}
        out = call_js('appendGoTrialData', data, stim, 'practice')
        assert out['stim'] == 'circle'
        assert out['condition'] == 'go'
        assert out['correct_response'] == ','


# ---------------------------------------------------------------
# Data recording: appendMemoryOnlyProbeData
# ---------------------------------------------------------------

class TestAppendMemoryOnlyProbeData:
    def _make_stim_data(self, cond='in memory set', correct_resp='x'):
        return {
            'stim': 'A',
            'stimLength': 4,
            'condition': cond,
            'recognitionLetter': 'A',
            'selectedLetters': 'ABCD',
            'correct_response': correct_resp,
        }

    def test_correct_response_marked(self):
        data = {'response': 'x'}
        out = call_js('appendMemoryOnlyProbeData', data, self._make_stim_data())
        assert out['correct_trial'] == 1

    def test_incorrect_response_marked(self):
        data = {'response': 'z'}
        out = call_js('appendMemoryOnlyProbeData', data, self._make_stim_data())
        assert out['correct_trial'] == 0

    def test_missed_response_marked_incorrect(self):
        data = {'response': None}
        out = call_js('appendMemoryOnlyProbeData', data, self._make_stim_data())
        assert out['correct_trial'] == 0

    def test_records_recognition_letter(self):
        data = {'response': 'x'}
        out = call_js('appendMemoryOnlyProbeData', data, self._make_stim_data())
        assert out['recognitionLetter'] == 'A'
        assert out['selectedLetters'] == 'ABCD'


# ---------------------------------------------------------------
# Letter selection: presentation stims
# ---------------------------------------------------------------

class TestMemoryOnlyPresentationStim:
    def _make_mem_stim(self, length):
        return {
            'memoryStimLength': length,
            'memory_condition': 'in memory set',
            'memory_correct_response': 'x',
        }

    def test_letters_unique(self):
        out = call_js('getMemoryOnlyPresentationStim', self._make_mem_stim(6))
        letters = out['selectedLetters']
        assert len(letters) == 6
        assert len(set(letters)) == 6, f'Duplicate letters in {letters}'

    def test_all_uppercase(self):
        out = call_js(
            'getMemoryOnlyPresentationStim', self._make_mem_stim(4),
        )
        assert out['selectedLetters'].isupper()

    @pytest.mark.parametrize('length', [2, 4, 6])
    def test_correct_count(self, length):
        out = call_js(
            'getMemoryOnlyPresentationStim', self._make_mem_stim(length),
        )
        assert len(out['selectedLetters']) == length

    def test_html_contains_letters_as_displayed_content(self):
        """Use >ch< to confirm letters appear as rendered text,
        not just in CSS classes or attributes."""
        stim = self._make_mem_stim(2)
        out = call_js('getMemoryOnlyPresentationStim', stim)
        for ch in out['selectedLetters']:
            assert f'>{ch}<' in out['html'], \
                f'Letter {ch} not found as displayed content in HTML'


class TestIntegratedPresentationStim:
    def test_letters_unique(self):
        stim = {
            'memoryStimLength': 6, 'stop_condition': 'go',
            'memory_condition': 'in memory set', 'memory_correct_response': 'x',
        }
        out = call_js('getIntegratedPresentationStim', stim)
        letters = out['selectedLetters']
        assert len(letters) == 6
        assert len(set(letters)) == 6

    @pytest.mark.parametrize('length', [2, 4, 6])
    def test_correct_count(self, length):
        stim = {
            'memoryStimLength': length, 'stop_condition': 'go',
            'memory_condition': 'in memory set', 'memory_correct_response': 'x',
        }
        out = call_js('getIntegratedPresentationStim', stim)
        assert len(out['selectedLetters']) == length


# ---------------------------------------------------------------
# Additional experiment variable checks
# ---------------------------------------------------------------

class TestExperimentVariablesExtended:
    """Verify timing, threshold, and SSD constants."""

    @pytest.fixture(autouse=True)
    def _load_vars(self):
        self.vars = call_js('getVars')

    def test_ssd_bounds(self):
        assert self.vars['minSSD'] == 0
        assert self.vars['maxSSD'] == 1000

    def test_stimulus_timing(self):
        assert self.vars['stimStimulusDuration'] == 1000
        assert self.vars['stimTrialDuration'] == 1500

    def test_accuracy_threshold(self):
        assert self.vars['accuracyThresh'] == 0.8

    def test_rt_thresholds(self):
        assert self.vars['rtThresh'] == 1000
        assert self.vars['letterRtThresh'] == 1250

    def test_missed_response_threshold(self):
        assert self.vars['missedResponseThresh'] == 0.2

    def test_stop_correct_bounds(self):
        assert self.vars['maxStopCorrect'] == 0.75
        assert self.vars['minStopCorrect'] == 0.25

    def test_num_test_blocks(self):
        assert self.vars['numSimpleTestBlocks'] == 6
        assert self.vars['numIntegratedTestBlocks'] == 6


# ---------------------------------------------------------------
# Correct response keys in trial generators
# ---------------------------------------------------------------

class TestTrialTypeCorrectResponses:
    """Verify that trial generators assign the correct response keys.

    The harness initializes with group_index=1, which maps:
      circle → ',' (possibleResponses[0])
      square → '.' (possibleResponses[1])
      in memory set → 'z' (possibleResponses[2])
      not in memory set → 'x' (possibleResponses[3])
    """

    def test_go_trials_correct_response_per_shape(self):
        trials = call_js('createGoTrialTypes', 20)
        for t in trials:
            if t['stopStim'] == 'circle':
                assert t['stop_correct_response'] == ',', \
                    f'circle should map to comma, got {t["stop_correct_response"]}'
            else:
                assert t['stop_correct_response'] == '.', \
                    f'square should map to period, got {t["stop_correct_response"]}'

    def test_simple_trials_correct_response_per_shape(self):
        trials = call_js('createSimpleTrialTypes', 30)
        for t in trials:
            expected = ',' if t['stopStim'] == 'circle' else '.'
            assert t['stop_correct_response'] == expected

    def test_memory_trials_correct_response_per_condition(self):
        trials = call_js('createMemoryOnlyTrialTypes', 12)
        for t in trials:
            if t['memory_condition'] == 'in memory set':
                assert t['memory_correct_response'] == 'z'
            else:
                assert t['memory_correct_response'] == 'x'

    def test_integrated_trials_correct_response_per_condition(self):
        trials = call_js('createIntegratedTrialTypes', 36)
        for t in trials:
            if t['memory_condition'] == 'in memory set':
                assert t['memory_correct_response'] == 'z'
            else:
                assert t['memory_correct_response'] == 'x'


# ---------------------------------------------------------------
# Presentation → probe handoff (integration test)
# ---------------------------------------------------------------

class TestIntegratedPresentationProbeHandoff:
    """Test that getIntegratedPresentationStim (reads [0]) and
    getIntegratedProbeStim (.shift()) operate on the same stim
    and that the probe consumes it from the queue."""

    def test_probe_uses_same_letters_as_presentation(self):
        stim = {
            'memoryStimLength': 4, 'stop_condition': 'go',
            'memory_condition': 'in memory set', 'memory_correct_response': 'z',
        }
        out = call_js('integratedHandoff', stim)
        probe_letter = out['probeStimData']['recognitionLetter']
        pres_letters = out['presLetters']
        assert probe_letter in pres_letters, \
            f'Probe letter {probe_letter} not in presented set {pres_letters}'

    def test_probe_consumes_stim_from_queue(self):
        stim = {
            'memoryStimLength': 2, 'stop_condition': 'go',
            'memory_condition': 'not in memory set', 'memory_correct_response': 'x',
        }
        out = call_js('integratedHandoff', stim)
        assert out['stimsRemainingLength'] == 0, \
            'Probe should have consumed the stim via .shift()'

    def test_presentation_does_not_consume_stim(self):
        """Presentation reads [0] without shifting.  The stim should
        still be available for the probe."""
        stim = {
            'memoryStimLength': 6, 'stop_condition': 'stop',
            'memory_condition': 'in memory set', 'memory_correct_response': 'z',
        }
        out = call_js('integratedHandoff', stim)
        assert out['presStimData']['stimLength'] == 6
        assert out['probeStimData']['stimLength'] == 6

    def test_presentation_and_probe_html_both_produced(self):
        stim = {
            'memoryStimLength': 4, 'stop_condition': 'go',
            'memory_condition': 'in memory set', 'memory_correct_response': 'z',
        }
        out = call_js('integratedHandoff', stim)
        assert len(out['presHtml']) > 0
        assert len(out['probeHtml']) > 0
