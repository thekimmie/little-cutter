# Little Cutter

A standalone, browser-based design studio and **experimental Silhouette Cameo 3 Bluetooth calibration console**. Cutting is disabled; offline design previews are not machine instructions.

## Current development release: v20.0

- The app displays its release from one `APP_VERSION` constant instead of the old, fixed “version 5.0” label.
- The blade-free calibration console has four directional controls, nominal 1 / 2 / 5 mm steps, and up to eight guarded moves per connection.
- **Every movement** requires confirmed firmware `CAMEO 3 V1.60`, READY, and a fresh parsed `G` position readback.
- Commands are limited to previously exercised coordinate ranges: field 1 (mat) **80–180** and field 2 (carriage) **40–140**. These limits are *not* a substitute for checking the physical travel path.
- Five-second cancelable countdown and explicit warning before each movement. No automatic motion, retries, return moves, homing, or cutting.
- A successful movement request requires a new READY and G reading; an unexpected readback or uncertain transmission locks out further movement for the current connection.
- GitHub Actions runs `node tests/validate.js` on changes. **These are code checks, not a physical hardware test.**

## What was confirmed before v18

Firmware: `CAMEO 3 V1.60`. The last shared v17 position report was **80,40,10** (raw ASCII position fields). A prior reverse two-axis movement was observed, and position readback matched **80,40,10**. Experiments indicate the first field controls mat feeding and the second field carriage motion. Carriage scale is *approximately* 20 command units/mm. **Mat movement scale, absolute origin, mechanical safety limits, and third field remain unknown.**

## Next physical test — one movement only

1. Open the updated app from a supported **HTTPS** location in a Web Bluetooth-capable browser (previous tests used Bluefy). A GitHub commit by itself does not publish an app or replace an already-open page.
2. **Remove the blade completely**, load the mat, clear the physical travel path and keep hands away. Identify the machine's physical power switch; Bluetooth disconnect is not an emergency stop.
3. Select **Connect Cameo → Read firmware (FG) → Check READY → Query position (G)**.
4. Verify the new **live** position. For our planned next test, it should be **80,40,10**. If it differs, **do not make the planned move**; copy the position and trace instead.
5. Keep **5 mm** selected and tap **→ Carriage right**. Confirm the warning and observe the five-second countdown. Expected request is **M80,140 ETX**, not a cutting command.
6. Observe what *actually* moves and approximately how far. After motion stops, choose **Check READY → Query position (G)** and copy the **BLE trace** plus **position report**. Expected readback is **80,140,10**, but this must be observed, not assumed.
7. If anything moves unexpectedly, use the machine's **physical power control**. Do not retry an uncertain write or continue on an unexpected readback.

Other console arrows are for later supervised testing, not part of the first test. Never leave the machine unattended while motion is possible.

## Development

The source of this standalone app is `index.html`. To bump the release, update `APP_VERSION` once in that file; all in-app version labels update automatically. Run `node tests/validate.js` locally for syntax and static safety checks.

> **Status:** This version is software-only until a person tests it with blade removed. Do not treat passing code checks as evidence of machine safety or position calibration.

## v19 guided square-pattern test

Begin from a fresh reported `80,40,10` position with the blade fully removed and a clear loaded mat. Open the guided square panel and tap **Start four-step square**. Each move is separately confirmed with a physical warning, a five-second cancelable countdown, and mandatory READY + G before the next control enables. No automatic movement or cutting.

| Step | Button | Target G fields | Expected nominal travel |
| --- | --- | --- | --- |
| 1 | Mat back | `100,40,10` | ~1 mm back |
| 2 | Carriage right | `100,60,10` | ~1 mm right |
| 3 | Mat forward | `80,60,10` | ~1 mm forward |
| 4 | Carriage left | `80,40,10` | ~1 mm left |

For each step, visually verify direction and approximate travel. Stop if motion looks abnormal; use the physical power switch if needed. The app may report completion only after four matching coordinate readbacks, but this **does not prove the geometric path was accurate**. Copy the full BLE trace and note actual physical observations before progressing to cutting or larger movements. The square test requires four unused movement attempts remaining on the current connection; reconnect to reset the connection-specific budget if necessary, after inspecting the machine.

## v20: clearer guided tests and the next experiment

The guided calibration panel now shows **Next action** explicitly. A finished square has a working **Finish test** button; finishing or aborting locks further motion on the current connection. After each command, wait for physical motion to stop, **Check READY**, then **Query G**. You do not need to query firmware every time; confirm it once after connecting. Only the relevant arrow is enabled during the guided test. If a button is disabled, follow the Next action message instead of retrying.

**Next test: 2 mm square**, blade fully removed and mat loaded. Start with fresh readback `80,40,10` and at least 4 unused move slots. Select **2 mm square**. The four targets are `120,40,10` (mat back), `120,80,10` (carriage right), `80,80,10` (mat forward), `80,40,10` (carriage left). These are four separately confirmed motions with five-second cancelable countdowns and no cutting. After every move, observe the physical direction/distance, then check READY and query G. When the complete message appears, tap Finish test, copy BLE trace, and disconnect. An unexpected response or motion means stop and inspect; machine power is the emergency stop, not Bluetooth.

The old 1 mm repeatability square remains available from the size selector. Both suites can be run in separate sessions; the test size is locked while a square is active. A complete matching-coordinate loop is **not** proof of exact physical square geometry.
