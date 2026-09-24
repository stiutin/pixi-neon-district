export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  backgroundColor: 0x070910,
  maxResolution: 3,
  maxDeltaTime: 0.1,
  world: {
    width: 3000,
    height: 2000,
  },
  spatialCellSize: 256,
  player: {
    speed: 300,
    spawn: {x: 1500, y: 1000},
    size: {width: 48, height: 64},
    hitboxHalfSize: 22,
  },
  camera: {smoothing: 8},
  interaction: {radius: 88},
  ui: {messageDuration: 3.5, fpsSampleInterval: 0.5},
  saveKey: 'neon-district-save-v1',
} as const;
