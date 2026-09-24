# CLAUDE.md

Working notes for AI assistants (and humans) on this repository. Read this first: what the project is, how it is built, which rules must not be broken, and how to verify a change. When something here gets out of date, fix this file in the same change.

## 1. What this is

**Neon District** is a small top-down 2D game built with PixiJS 8 and TypeScript. You walk a neon city at night, talk to three locals, and recover five data shards. The game is deliberately small; the point is the engineering underneath: the update loop, a spatial grid, object pooling, y-sorting, one input layer for keyboard and touch, and HiDPI rendering.

- Live: `https://stiutin.github.io/pixi-neon-district/`
- It is a **portfolio project**.

## 2. Toolchain

| Tool       | Version                                                                                                                     | Notes                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Node.js    | 24 (`.nvmrc`), `engines` `>=22.22.3`                                                                                        |                                                 |
| PixiJS     | 8                                                                                                                           |                                                 |
| TypeScript | 6.0, strict + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`/`Parameters` | 7.0 is not supported by `typescript-eslint` yet |
| Vite       | 8                                                                                                                           | relative `base: './'`; preview on port 4173     |
| Tests      | Vitest 5 (node environment), Playwright 1.63                                                                                |                                                 |
| Lint       | ESLint 10 (`typescript-eslint` strict-type-checked + house rules), Stylelint 17, Prettier 3                                 |                                                 |

## 3. Commands

```bash
npm start              # Vite dev server
npm run build          # tsc -b + production build into dist/
npm run serve          # serve dist/ (port 4173)
npm test               # Vitest unit tests (src/**/*.test.ts)
npm run e2e            # build, then the Playwright smoke tests (desktop + Pixel 7); `npm run e2e:install` once
npm run e2e:run        # the tests only, against the existing build
npm run screenshots    # .github/screenshots/*.png from a fresh build
npm run lint           # ESLint + Stylelint
npm run typecheck      # tsc -b
npm run check          # format:check + lint + typecheck + test  ← before finishing
```

**Definition of done:** `npm run check` and `npm run e2e` are green; pure logic has unit tests; the README and this file are still accurate.

## 4. Repository map

```
src/
  main.ts          bootstrap: createApp → Game.start(), fatal-error screen
  app/             createApp (Pixi Application), Game (composition root), Viewport (letterbox + resolution)
  config/          GAME_CONFIG: every tunable constant (design size 1280×720, speeds, radii, cell size…)
  core/            GameLoop (clamped delta time), Scene (base, dispose()), SceneManager
  scenes/          LoadingScene (asset bundle + progress), MainScene (state machine, gameplay wiring)
  world/           World (ground / y-sorted entities / effects layers, grids), Camera, level.ts (level data)
  entities/        Player, NPC, Building, Tree, Collectible
  spatial/         SpatialGrid<T> (numeric cell keys, reusable query array), SpatialObject
  collision/       Collider, CollisionSystem (broad phase + AABB)
  interaction/     Interactable (returns an InteractionResult union), InteractionSystem (nearest in radius)
  input/           InputAction + default bindings (KeyboardEvent.code), InputManager (keyboard + virtual)
  effects/         Particle (shared GraphicsContext), ParticlePool
  audio/           AudioSystem (Web Audio, scheduled tones, lazy context)
  save/            SaveGame (validated JSON, injectable storage, never throws)
  ui/              HUD, InteractionPrompt, MessageBanner, Overlay, TouchControls, theme
  math/ utils/     AABB, Point, clamp, swapRemove
e2e/               Playwright smoke tests
scripts/           README screenshots
```

## 5. Architecture

- **Loop.** `GameLoop` on Pixi's ticker converts the time to seconds and clamps it (`GAME_CONFIG.maxDeltaTime`) before calling `SceneManager.update(dt)`.
- **Scenes** own what they create and release it in `dispose()`. `MainScene` is the state machine `playing | paused | completed`; it pauses on `visibilitychange`, and the reset happens in place.
- **Movement** is resolved per axis (X, then Y), so the player slides along walls. Diagonal input is normalised, and positions are clamped to the world.
- **Queries.** Colliders and interactables are indexed in two `SpatialGrid`s. Cell keys are two signed 16-bit integers packed into one number. `query(bounds, out)` reuses the output array, so the per-frame path allocates nothing.
- **Interaction** returns a discriminated union (`collected` | `dialogue`), which `MainScene` handles with an exhaustive `switch`. No `instanceof`.
- **Rendering.** `Viewport` keeps the logical size at 1280×720 and sets the renderer resolution to `fit scale × devicePixelRatio`, capped at `maxResolution`. The canvas CSS size follows the window. All UI code uses design coordinates.
- **Layers.** The ground is drawn once; the entity layer has `sortableChildren` with `zIndex` = feet y; effects sit on top.
- **Particles** share one `GraphicsContext` and vary by `scale` and `tint`. The pool swap-removes from its active list. Drag is `exp(-k·dt)`.
- **Input.** `InputManager` maps key codes (layout-independent) and touch buttons (the `source` ids are `touch:<action>`) to actions:
  - `isDown` for movement;
  - `wasPressed`, true for one frame, for menus and actions;
  - `onPress`, synchronous, for fullscreen and audio, which need a user gesture.

  Browser shortcuts with Ctrl, Cmd or Alt are ignored.

- **Saving.** `SaveGame` under the key `neon-district-save-v1` validates field by field and survives unavailable or throwing storage.

## 6. Invariants - do not break

1. **No allocations in the per-frame hot path** (queries, collision, particles). Reuse arrays and objects.
2. **Every tunable number lives in `GAME_CONFIG`**, and UI layout uses design coordinates.
3. **Input goes through actions,** never raw keys in gameplay code. Key bindings use `KeyboardEvent.code`.
4. **`dt` is in seconds and clamped;** anything time-based uses it (no per-frame constants).
5. **`SaveGame` never throws;** its storage stays injectable for tests.
6. **`exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` stay on;** handle `undefined` explicitly.
7. The save key is part of the smoke tests; bump the version suffix when the save format changes.

## 7. Testing guide

- **Unit** (`src/**/*.test.ts`, Vitest, node environment): AABB, SpatialGrid (including negative coordinates, update and reuse), InteractionSystem, SaveGame (with an in-memory and a throwing storage), `swapRemove`. Test pure modules directly; Pixi-dependent classes are covered by the smoke tests.
- **End-to-end** (`e2e/smoke.spec.ts`): the game boots without errors and the canvas fits the viewport; keyboard input produces no errors; toggling sound is saved. Input is ignored during the loading scene, so tests poll (`expect.poll`) instead of sleeping.

## 8. Recipes

- **Add an NPC or shard:** edit `world/level.ts` (data only).
- **Add an action:** extend `InputAction` and `DEFAULT_KEY_BINDINGS`; add a touch button in `TouchControls` if it makes sense on phones; handle it in `MainScene.handleGlobalActions()` or the gameplay code.
- **Add an entity type:** implement `Collider` and/or `Interactable`, insert it into the world's grids, and set `zIndex` from its feet position.

## 9. CI/CD

The jobs are _Lint and types_, _Unit tests_, _Build_ (uploads `dist/`), _End-to-end_ (against that build), and _Deploy to GitHub Pages_, which publishes the same artifact from `master`. One-time setup is listed at the top of `.github/workflows/ci.yml`.

## 10. Troubleshooting

| Symptom                                                         | Cause / fix                                                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| E2E hits the wrong app                                          | another project's preview server is on the port (`reuseExistingServer`); this repository uses 4173, so stop the stray server |
| Playwright: "Executable doesn't exist"                          | `npm run e2e:install`, or `CHROMIUM_PATH=/path/to/chrome`                                                                    |
| FPS reads ~10 in headless screenshots                           | software WebGL; real browsers run at display refresh rate                                                                    |
| Deploy rejected: "branch not allowed to deploy to github-pages" | Settings → Environments → github-pages → allow `master`                                                                      |

## 11. Known limitations

- A variable time step (clamped), not a fixed one with interpolation; see the roadmap in the README.
- There is one level, defined in code as data.

## House style (identical in every repository of this portfolio)

These five repositories are written as one body of work: [cosmos-stories](https://github.com/stiutin/cosmos-stories), [larder](https://github.com/stiutin/larder), [pixi-neon-district](https://github.com/stiutin/pixi-neon-district), [threejs-solar-system](https://github.com/stiutin/threejs-solar-system) and [threejs-icosphere](https://github.com/stiutin/threejs-icosphere). Keep them alike. When a convention changes, change it everywhere.

**Shared files.** `LICENSE` (MIT, Serge Tiutin), `.editorconfig`, `.gitattributes`, `.nvmrc` (`24`), `.prettierrc`, `.prettierignore`, `.gitignore`, `.vscode/`, `.github/dependabot.yml` and the issue and PR templates are identical across the repositories, apart from a clearly marked `# Project` block at the end of the ignore files.

**Formatting.** Prettier: 120 columns, single quotes, no spaces inside braces (`{a, b}`), trailing commas where ES5 allows them, always parenthesised arrow parameters. `npm run format` fixes everything, and `npm run format:check` runs in CI. ESLint does not format.

**Linting.** `eslint.config.mjs` with `defineConfig`, and two shared blocks:

- `HOUSE_RULES`: sorted imports and exports (`simple-import-sort`), no unused imports, `curly: all`, arrow bodies only where needed, no `console` except `warn` and `error`;
- `HOUSE_TS_RULES` in TypeScript projects: explicit `public`/`protected`/`private` on every class member (never on constructors), `T[]` rather than `Array<T>`, and unused variables allowed only as `_`.

`eslint-config-prettier` comes last. Each project adds its own strictness on top: `typescript-eslint` strict-type-checked in cosmos-stories and pixi-neon-district, Larder's own rule set (magic numbers, naming, member ordering, RxJS) in larder. Styles are linted by Stylelint with properties in alphabetical order; `-webkit-backdrop-filter` and `-webkit-user-select` stay, for Safari.

**`package.json`.** The field order is name, version, description, license, author, repository, homepage, keywords, private, type, engines, scripts, dependencies, devDependencies. Dependencies are sorted, and `engines.node` is `>=22.22.3`. Scripts use the same names everywhere:

| Script                                       | Meaning                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `start`                                      | dev server                                                                |
| `build`                                      | production build                                                          |
| `serve`                                      | serve the production build like GitHub Pages does                         |
| `test` / `test:watch`                        | unit tests (where the project has them)                                   |
| `e2e` / `e2e:run` / `e2e:ui` / `e2e:install` | Playwright: build and test / test only / UI mode / download Chromium      |
| `screenshots`                                | regenerate `.github/screenshots/*.png` for the README                     |
| `lint` / `lint:fix`                          | ESLint and Stylelint                                                      |
| `typecheck`                                  | TypeScript (TypeScript projects)                                          |
| `format` / `format:check`                    | Prettier                                                                  |
| `check`                                      | everything CI checks before building: formatting, lint, types, unit tests |

**TypeScript.** Every TypeScript project has `strict` plus `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noUncheckedIndexedAccess`. Projects may add more (cosmos-stories: `noPropertyAccessFromIndexSignature`; pixi-neon-district: `exactOptionalPropertyTypes`, unused locals and parameters).

**Dependencies.** The latest versions, with deliberate exceptions noted in each CLAUDE.md. In particular, TypeScript stays on 6.0 because `typescript-eslint` and Angular 22 do not support 7.0 yet.

**Tests.** Every project has Playwright tests against its production build, on a desktop and a Pixel 7 viewport, served the way GitHub Pages serves it. `CHROMIUM_PATH` points Playwright and the screenshot scripts at a specific browser binary (useful in sandboxes). Projects with logic worth isolating also have Vitest unit tests.

**CI.** `.github/workflows/ci.yml` with the same job names: _Lint and types_, _Unit tests_, _Build_, _End-to-end (Playwright)_, _Lighthouse_ (Angular projects), _Deploy to GitHub Pages_. It runs on `ubuntu-24.04`, reads the Node version from `.nvmrc`, and uses the same action versions everywhere. Deploys go from `master` only, and only after the gates pass. The header of the workflow lists the one-time repository settings; the `github-pages` environment must allow `master`.

**Documentation.** The README follows one outline: title, one line, a paragraph, **Open the live demo**, screenshots, then _Features_, _Tech stack_, _How it works_, _Testing_ (a table), _Project structure_, _Running locally_, _Deployment_, _Roadmap_, _License_, _Author_. The voice is calm and specific, in British English, with no badges and no marketing adjectives. Explain _why_ in prose. There is no CHANGELOG and no ADR folder: decisions live in _How it works_ and in this file. `.github/social-preview.png` (1280×640) is the repository's social preview, and every project uses the same design.

**Scripts and tooling.** Node scripts are `.mjs`. TypeScript scripts run through Node's type stripping, and are used only when they share code with the app (cosmos-stories). Scripts have a header comment with usage examples.
