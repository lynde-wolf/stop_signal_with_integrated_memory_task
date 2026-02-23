# Stop Signal with Integrated Memory

## Overview
This experiment has **two types of test blocks**:

1. **Simple stop signal blocks** — Shape identification (circle/square) with a stop signal (star) on 1/3 of trials. Right hand responses.
2. **Integrated memory blocks** — Remember 2, 4, or 6 letters, then identify whether a probe letter was in the memory set. A stop signal (star) appears at the probe on 1/3 of trials. Left hand responses.

## Trial Structure

### Simple stop signal trial
1. Fixation: 250ms
2. Shape (with possible star): 1000ms stimulus / 1500ms trial
3. ITI: 250ms
- **~2s per trial**

### Integrated memory trial
1. Fixation: 250ms
2. Memory Presentation: 2000ms — letters shown in spatial positions
3. 500ms gap
4. Probe with possible stop signal: 1000ms stimulus / 1500ms trial
5. ITI: 250ms
- **~4.5s per trial**

## Memory Letter Display
Letters are displayed in spatial positions on screen (polygon vertices):
- **2 letters**: left, right (horizontal)
- **4 letters**: top, right, bottom, left (cross)
- **6 letters**: hexagon vertices

## Conditions

### Simple stop signal
- Shapes: circle, square
- Stop conditions: go (2/3), stop (1/3)
- **6 unique trial types** per block

### Integrated memory
- Memory set sizes: 2, 4, 6
- Memory conditions: in memory set, not in memory set
- Stop conditions: go (2/3), stop (1/3)
- **18 unique trial types** per block

## Block Structure

### Practice (10 trials each, 75% accuracy, max 3 attempts)
1. Go-only practice: 10 trials (shapes, no stop)
2. Simple stop practice: 10 trials (shapes + star)
3. Memory-only practice: 10 trials (letters + probe, no stop)
4. Full integrated practice: 10 trials (letters + probe + star)

### Test
- 6 simple stop signal blocks × 30 trials = 180 trials
- 6 integrated memory blocks × 36 trials = 216 trials
- **396 total test trials**

## Response Keys (counterbalanced by group_index)

### Right hand — shapes (simple blocks)
- `possibleResponses[0]`: circle or square → comma (,) or period (.)
- `possibleResponses[1]`: other shape → other key

### Left hand — memory probe (integrated blocks)
- `possibleResponses[2]`: in memory set → X or Z
- `possibleResponses[3]`: not in memory set → other key

## Stop-Signal Delay (SSD)

### Simple blocks
- Single SSD staircase: `SSD_simple`
- Initial: 250ms, step: 50ms, range: 0–1000ms

### Integrated blocks
- Per memory load: `SSD_2`, `SSD_4`, `SSD_6`
- Initial: 250ms, step: 50ms, range: 0–1000ms

## Accuracy Thresholds
- Test accuracy: 0.80
- Practice accuracy: 0.75
- Go-only practice: 0.75
- Memory practice: 0.75
- Missed response: 0.20
- Max practice attempts: 3

## Estimated Duration
~40 minutes total (practice + test + breaks)
