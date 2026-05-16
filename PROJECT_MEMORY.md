# Project Memory

This file records durable project/session notes for future work.

## Entries

### 2026-05-10 00:00 - Initial Repository Setup

- **Feature name, work name, description, and value provided:** Created the local Haunted House project repository from the GitHub source and established the baseline project files for ongoing development.
- **Files changed:** `AGENTS.md`, `PROJECT_MEMORY.md`, repo source files from initial setup
- **Technical Architecture changes or key technical decisions made:** Set the project up as a lightweight browser game repo using static HTML, CSS, and JavaScript. Added repo-local memory/instruction files so future sessions have durable context.
- **Assumptions:** The project should remain easy to run locally and easy to push to GitHub without a heavy build system.
- **Known limitations:** Early repository setup did not yet include a mature asset pipeline, automated tests, or deployment automation beyond GitHub pushes.
- **Key learnings that you can bring with you to future sessions:** Keep this repo simple unless the game grows enough to justify a bundler or framework.
- **Remaining TODOs:** Continue documenting major gameplay and visual decisions in this file.
- **Next steps:** Use focused commits for each feature so project history stays readable.

### 2026-05-10 00:00 - Haunted House MVP

- **Feature name, work name, description, and value provided:** Built the first playable MVP of the haunted estate rescue game. The player explores the yard, foyer, library, and attic lab while using a flashlight, solving a library puzzle, avoiding enemies, disabling lab power nodes, and rescuing their friend.
- **Files changed:** `index.html`, `styles.css`, `script.js`
- **Technical Architecture changes or key technical decisions made:** Implemented the game as a Canvas-based static web app. Core systems include room definitions, player movement, collision checks, flashlight visibility/lighting, enemy patrols, inventory, interactable items, library puzzle state, lab power-node state, HUD updates, and win condition.
- **Assumptions:** A skinny MVP should prove the basic premise and structure before expanding content. Canvas was chosen because it gives direct control over top-down rendering, lighting, and simple game-loop behavior without a larger engine.
- **Known limitations:** The game is keyboard-only, has simple enemy movement, no save system, no audio, no animation system, and limited automated test coverage.
- **Key learnings that you can bring with you to future sessions:** For this game, gameplay readability and moment-to-moment clarity matter more than broad feature count. Small mechanics like flashlight reveal, enemy slowing, and room progression give enough structure for early playtesting.
- **Remaining TODOs:** Add better onboarding, stronger final-room story readability, richer room interactions, and more polished feedback/audio later.
- **Next steps:** Keep changes narrow and playtest after every meaningful visual or gameplay update.

### 2026-05-10 00:00 - Library Symbol Puzzle And Prop Readability Pass

- **Feature name, work name, description, and value provided:** Added and refined the Moonlit Library symbol puzzle, then improved prop readability across rooms so players can better identify shelves, graves, candles, trees, portraits, stairs, and doors.
- **Files changed:** `script.js`, visual drawing helpers in Canvas
- **Technical Architecture changes or key technical decisions made:** Added puzzle state for ordered symbol activation and linked completion to the stair-key reveal. Expanded Canvas prop drawing helpers and preserved gameplay collision separately from decorative rendering.
- **Assumptions:** The library should be the MVP's first real puzzle room, teaching players to use the flashlight to reveal clues and interact with hidden symbols.
- **Known limitations:** Early Canvas-drawn props were visually vague at gameplay distance, which led to the later SVG asset pipeline.
- **Key learnings that you can bring with you to future sessions:** If players cannot identify a prop in one second, improve silhouette, scale, contrast, and iconic cues before adding texture. Visual clarity is a gameplay feature, not just art polish.
- **Remaining TODOs:** Consider adding clearer feedback when the player activates the correct or incorrect symbol order.
- **Next steps:** Continue replacing unclear hand-drawn Canvas props with SVG assets where recognition matters.

### 2026-05-10 00:00 - SVG Asset Pipeline And Canvas Wiring

- **Feature name, work name, description, and value provided:** Introduced an asset pipeline and generated SVG assets for characters, enemies, props, and room objects. Wired those assets into Canvas so important objects are more recognizable.
- **Files changed:** `assets/README.md`, `assets/characters/player.svg`, `assets/enemies/ghost.svg`, `assets/enemies/experiment.svg`, `assets/props/bookshelf.svg`, `assets/props/door.svg`, `assets/props/stairs.svg`, `assets/props/portrait.svg`, `assets/props/key.svg`, `assets/props/candle.svg`, `assets/props/gravestone.svg`, `assets/props/lab-machine.svg`, `assets/props/containment-chamber.svg`, `script.js`
- **Technical Architecture changes or key technical decisions made:** Added `assetSources`, `assetImages`, `loadAssets()`, and `drawAsset()` to load SVGs as images and draw them into Canvas. Kept old Canvas drawing as fallbacks so the game remains resilient if an asset fails to load.
- **Assumptions:** SVG is a good intermediate step before a fuller asset pipeline because it is editable, lightweight, repo-native, and compatible with Canvas via `drawImage`.
- **Known limitations:** SVGs are static and manually authored. There is no sprite atlas, animation pipeline, or automated visual regression check yet.
- **Key learnings that you can bring with you to future sessions:** Canvas can draw better graphics, but only if the project separates art assets from low-level drawing code. SVG assets improved recognition faster than continuing to hand-code every prop shape.
- **Remaining TODOs:** Add a formal visual QA checklist and consider an automated screenshot path for key rooms.
- **Next steps:** Continue adding assets for high-importance objects before decorative objects.

### 2026-05-10 00:00 - Start Briefing Modal

- **Feature name, work name, description, and value provided:** Added a concise start modal that explains the story, goal, and controls before play begins. Updated the premise to rescue a gender-neutral friend rather than a girlfriend.
- **Files changed:** `index.html`, `styles.css`, `script.js`
- **Technical Architecture changes or key technical decisions made:** Added DOM-based UI for the briefing modal and a small `gameStarted` gate so the Canvas loop starts only after the player clicks `Enter the Estate` or presses Enter. Kept onboarding UI separate from Canvas game rendering.
- **Assumptions:** Players need a short mission briefing, but the first playable moment should still arrive quickly.
- **Known limitations:** The modal is not yet reopenable from an in-game help button and does not include remappable controls.
- **Key learnings that you can bring with you to future sessions:** Onboarding should match real controls exactly. In this game, movement uses WASD/arrows, flashlight uses Space, and interaction uses E.
- **Remaining TODOs:** Consider adding a small `?` help button later to reopen the controls.
- **Next steps:** If controls expand, update both the modal and the persistent controls row together.

### 2026-05-10 00:00 - Lab Story Character Visibility

- **Feature name, work name, description, and value provided:** Improved the attic lab finale so the rescue target and villain are readable. Added a visible captive friend character, a visible mad scientist character, fixed the lab render order so important story props draw in front of walls, and pushed the update to production.
- **Files changed:** `script.js`, `assets/characters/friend-captive.svg`, `assets/characters/mad-scientist.svg`
- **Technical Architecture changes or key technical decisions made:** Added dedicated SVG character assets to the existing Canvas asset pipeline. Split lab story props into foreground rendering via `drawForegroundProps(room)` so chamber/friend/scientist render after wall geometry. Kept gameplay collision, enemy logic, and win condition unchanged.
- **Assumptions:** The attic lab should visually confirm the core story promise: the player sees their friend trapped, sees the scientist, and understands the rescue target before interacting with the chamber.
- **Known limitations:** Visual verification was based on local checks and user screenshots, not an automated screenshot test. The friend and scientist are still static props, not animated characters.
- **Key learnings that you can bring with you to future sessions:** In this Canvas game, render order matters as much as asset quality. Important story/gameplay objects should be drawn after walls or other occluding geometry when readability matters. If a visual asset still cannot be seen after improving detail, inspect layering and coordinates before adding more art detail.
- **Remaining TODOs:** Consider adding a simple post-rescue visual state where the friend appears outside the chamber after victory. Consider automated screenshot/playtest checks for final-room readability.
- **Next steps:** Playtest the lab sequence end to end and confirm the friend, scientist, chamber, power nodes, and win interaction all read clearly under the darkness/flashlight system.

### 2026-05-11 00:00 - Styled Walls And Rescue Ending Sequence

- **Feature name, work name, description, and value provided:** Enhanced room walls and the game ending, then pushed to production in commit `adaeb91`. Walls now have room-specific material details, and the final rescue now plays as a short event with chamber burst, friend reunion, scientist defeat cue, warm glow, and stronger final copy.
- **Files changed:** `script.js`, `PROJECT_MEMORY.md`
- **Technical Architecture changes or key technical decisions made:** Replaced flat wall rectangle painting with `drawStyledWall(wall, room)` plus room-specific material helpers for stone, wood, library trim/books, and lab metal. Added ending state flow with `endingPhase` and `endingTimer` values: `playing`, `chamberOpening`, `reunited`, and `complete`. Added dedicated rendering helpers for chamber burst, freed friend, reunion sparks, scientist defeat cue, and final overlay.
- **Assumptions:** Better walls should improve room identity without changing movement/collision. The ending should feel like a payoff event, not an instant text overlay, while staying scoped enough for the MVP.
- **Known limitations:** The rescue sequence is still Canvas-drawn and time-based rather than a full cutscene/animation system. No audio, camera shake, or automated visual regression checks were added.
- **Key learnings that you can bring with you to future sessions:** Keep collision geometry separate from visual styling. For emotional payoff, a small state machine can create a much stronger moment than a single win flag and overlay. Wall readability is part of navigation clarity, not just background polish.
- **Remaining TODOs:** Playtest the ending timing, check if the scientist defeat cue feels too text-heavy, and consider adding audio/particles/camera pulse later.
- **Next steps:** Consider converting power nodes and library symbols to SVG or adding lightweight animation/audio feedback for high-value interactions.
