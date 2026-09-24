export type InputAction =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'interact'
  | 'pause'
  | 'toggleSound'
  | 'toggleFullscreen'
  | 'reset';

export const DEFAULT_KEY_BINDINGS: Readonly<Record<string, InputAction>> = {
  KeyW: 'moveUp',
  ArrowUp: 'moveUp',
  KeyS: 'moveDown',
  ArrowDown: 'moveDown',
  KeyA: 'moveLeft',
  ArrowLeft: 'moveLeft',
  KeyD: 'moveRight',
  ArrowRight: 'moveRight',
  KeyE: 'interact',
  Space: 'interact',
  Enter: 'interact',
  Escape: 'pause',
  KeyP: 'pause',
  KeyM: 'toggleSound',
  KeyF: 'toggleFullscreen',
  KeyR: 'reset',
};
