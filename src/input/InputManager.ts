import {DEFAULT_KEY_BINDINGS, type InputAction} from './InputAction';

type ActionListener = () => void;

export class InputManager {
  private readonly heldSources = new Map<InputAction, Set<string>>();
  private readonly pressedThisFrame = new Set<InputAction>();
  private readonly listeners = new Map<InputAction, Set<ActionListener>>();

  constructor(
    private readonly target: Window = window,
    private readonly bindings: Readonly<Record<string, InputAction>> = DEFAULT_KEY_BINDINGS
  ) {
    target.addEventListener('keydown', this.handleKeyDown);
    target.addEventListener('keyup', this.handleKeyUp);
    target.addEventListener('blur', this.releaseAll);
  }

  public isDown(action: InputAction): boolean {
    return (this.heldSources.get(action)?.size ?? 0) > 0;
  }

  public wasPressed(action: InputAction): boolean {
    return this.pressedThisFrame.has(action);
  }

  public axis(negative: InputAction, positive: InputAction): number {
    return Number(this.isDown(positive)) - Number(this.isDown(negative));
  }

  public press(action: InputAction, source = 'virtual'): void {
    let sources = this.heldSources.get(action);

    if (!sources) {
      sources = new Set();
      this.heldSources.set(action, sources);
    }

    if (sources.size === 0) {
      this.pressedThisFrame.add(action);
      this.listeners.get(action)?.forEach((listener) => {
        listener();
      });
    }

    sources.add(source);
  }

  public release(action: InputAction, source = 'virtual'): void {
    this.heldSources.get(action)?.delete(source);
  }

  public onPress(action: InputAction, listener: ActionListener): () => void {
    let set = this.listeners.get(action);

    if (!set) {
      set = new Set();
      this.listeners.set(action, set);
    }

    set.add(listener);

    return () => set.delete(listener);
  }

  public endFrame(): void {
    this.pressedThisFrame.clear();
  }

  public destroy(): void {
    this.target.removeEventListener('keydown', this.handleKeyDown);
    this.target.removeEventListener('keyup', this.handleKeyUp);
    this.target.removeEventListener('blur', this.releaseAll);
    this.releaseAll();
    this.listeners.clear();
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const action = this.bindings[event.code];
    if (!action) return;

    event.preventDefault();
    if (!event.repeat) this.press(action, event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const action = this.bindings[event.code];
    if (action) this.release(action, event.code);
  };

  private readonly releaseAll = (): void => {
    this.heldSources.clear();
    this.pressedThisFrame.clear();
  };
}
