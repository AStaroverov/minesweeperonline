import { BaseComponent, PRIVATE_CONTEXT } from '../../BaseComponent';
import { CameraService, TCameraServiceOptions } from './serviece';
import { isMetaKeyEvent } from '../../utils';
import { withdDrag } from '../../mixins/withdDrag';
import { scheduler, Task } from '../../../../Scheduler';
import { CanvasEvent, CanvasMouseEvent } from '../../worker/events/defs';
import { vec2 } from 'gl-matrix';

export enum MANIPULATION_TYPE {
  TOUCH = 'touch',
  MOUSE = 'mouse',
}

export type TCameraComponentProps = TCameraServiceOptions & { manipulationType?: MANIPULATION_TYPE };

export class CameraComponent<Context extends object = object> extends withdDrag(BaseComponent)<Context> {
  public camera: CameraService;

  public manipulationType: MANIPULATION_TYPE = MANIPULATION_TYPE.MOUSE;

  private root: BaseComponent;

  private _cameraMoveStarted: boolean = false;
  private _cameraMoveCurrentData: number[] = [0, 0];
  private _cameraMoveStartData: number[] = [0, 0];
  private _cameraUpdateTask: Task;

  constructor ({ manipulationType, ...cameraParams }: TCameraComponentProps = {}) {
    super();

    this.manipulationType = manipulationType || this.manipulationType;
    this.camera = new CameraService(cameraParams);
    this.camera.on('updated', this.onCameraUpdate);
  }

  private onCameraUpdate = (): void => {
    this.requestUpdate();
  };

  private _lastDragEvent: CanvasMouseEvent | undefined = undefined;

  protected connected (): void {
    super.connected();

    this.root = this[PRIVATE_CONTEXT]!.root;
    this.root.addEventListener('click', this);
    this.root.addEventListener('mousedown', this);
    this.root.addEventListener('wheel', this);
    this.root.addEventListener('keydown', this);
    this.root.addEventListener('keyup', this);
  }

  protected disconnected (): void {
    super.disconnected();

    this.root.removeEventListener('click', this);
    this.root.removeEventListener('mousedown', this);
    this.root.removeEventListener('wheel', this);
    this.root.removeEventListener('keydown', this);
    this.root.removeEventListener('keyup', this);

    // @ts-expect-error-next
    this.root = undefined;
  }

  public handleEvent (e): void {
    if (e.button === 1 && e.type === 'mousedown') {
      return this._moveStartRelativePoint(e);
    }

    if (this.manipulationType === MANIPULATION_TYPE.MOUSE) {
      switch (e.type) {
        case 'wheel': return isMetaKeyEvent(e)
          ? this._move(e)
          : this._zoom(e);
        case 'mousedown': {
          this._onDragStart(e);
          this.listenDrag({
            onDragMove: (e) => this._onDragUpdate(e),
            onDragEnd: (e) => this._onDragEnd(e)
          });

          return;
        }
      }
    }

    if (this.manipulationType === MANIPULATION_TYPE.TOUCH) {
      switch (e.type) {
        case 'wheel': {
          // pinch-to-zoom works because e.ctrlKey is true during pinch.
          return isMetaKeyEvent(e)
            ? this._zoom(e)
            : this._move(e);
        }
        case 'mousedown': {
          this._onDragStart(e);
          this.listenDrag({
            onDragMove: (e) => this._onDragUpdate(e),
            onDragEnd: (e) => this._onDragEnd(e)
          });
        }
      }
    }
  }

  protected getPointFromEvent (event: CanvasMouseEvent): vec2 {
    return [event.x, event.y];
  }

  private _move (event): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'wheel') {
      this.camera.move(-event.deltaX, -event.deltaY);
    }

    if (event.type.indexOf('mouse') > -1) {
      this.camera.move(
        (this._lastDragEvent!.x - event.x) / this.camera.scale,
        (this._lastDragEvent!.y - event.y) / this.camera.scale
      );
    }
  }

  private _zoom (event): void {
    // To prevent back gesture
    event.preventDefault();
    event.stopPropagation();

    const xy = this.getPointFromEvent(event);

    this.camera.zoom(xy[0], xy[1], event.deltaY / 1000);
  }

  private _onDragStart (e: CanvasMouseEvent): void {
    this._lastDragEvent = e;
  }

  private _onDragUpdate (e: CanvasMouseEvent): void {
    this._move(e);
    this._lastDragEvent = e;
  }

  private _onDragEnd (e): void {
    this._lastDragEvent = undefined;
  }

  private _moveStartRelativePoint (e): void {
    this._cameraMoveStarted = true;
    this._cameraMoveStartData = [e.x, e.y];
    this._cameraMoveCurrentData = [e.x, e.y];

    this.listenDrag({
      onDragMove: (e) => this._moveUpdateRelativePoint(e),
      onDragEnd: () => this._moveEndRelativePoint()
    });

    scheduler.add(this._cameraUpdateTask = new Task(() => {
      this.camera.move(
        (this._cameraMoveCurrentData[0] - this._cameraMoveStartData[0]) / 10,
        (this._cameraMoveCurrentData[1] - this._cameraMoveStartData[1]) / 10
      );
    }));
  }

  private _moveUpdateRelativePoint (event: CanvasEvent<MouseEvent>): void {
    this._cameraMoveCurrentData[0] += event.movementX;
    this._cameraMoveCurrentData[1] += event.movementY;
  }

  private _moveEndRelativePoint (): void {
    this._cameraMoveStarted = false;
    scheduler.remove(this._cameraUpdateTask);
  }
}
