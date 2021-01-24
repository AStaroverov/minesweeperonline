import { getRenderIndex } from './helpers/renderIndex';
import { getRenderId } from './helpers/renderId';
import { Knot } from './Knot';
import { BBox } from 'rbush';
import { ITask } from '../types';
import { PRIVATE_CONTEXT } from '../BaseComponent';
import { ILayer } from '../layers/Layer';
import { HitBoxService } from './helpers/hitBoxServerice';

export type THitBoxData<Item extends CanvasElement = CanvasElement> = BBox & {
  item: Item
};

export class CanvasElement extends Knot implements ITask {
  public children: this[];
  public layer: ILayer | undefined;
  public zIndex: number = 0;
  public renderId: number = 0;
  public renderIndex: number = 0;
  public hitBoxData: THitBoxData = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    item: this
  };

  public isRendered (): boolean {
    return this.renderId === getRenderId();
  }

  public attachToLayer (nextLayer: ILayer): void {
    if (nextLayer !== this.layer) {
      this.removeHitBox();

      this.layer?.update();
      this.layer = nextLayer;
      this.layer.update();

      this.setHitBox(
        this.hitBoxData.minX,
        this.hitBoxData.minY,
        this.hitBoxData.maxX,
        this.hitBoxData.maxY
      );
    } else {
      this.layer.update();
    }
  }

  public setHitBox (
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): void {
    if (this[PRIVATE_CONTEXT].hitBoxMap.has(this.layer) === false && this.layer !== undefined) {
      this[PRIVATE_CONTEXT].hitBoxMap.set(this.layer, new HitBoxService());
    }

    const hitBoxService = this[PRIVATE_CONTEXT].hitBoxMap.get(this.layer);

    if (hitBoxService) {
      if (this.hitBoxData.minX !== undefined) {
        hitBoxService.remove(this.hitBoxData);
      }

      this.hitBoxData.minX = minX;
      this.hitBoxData.minY = minY;
      this.hitBoxData.maxX = maxX;
      this.hitBoxData.maxY = maxY;

      hitBoxService.add(this.hitBoxData);
    }
  }

  protected removeHitBox (): void {
    const hitBoxService = this[PRIVATE_CONTEXT].hitBoxMap.get(this.layer);

    if (hitBoxService) {
      hitBoxService.remove(this.hitBoxData);
    }
  }

  public verifyHitToBox (area: BBox): boolean {
    return true;
  }

  protected disconnected (): void {
    super.disconnected();
    this.removeHitBox();
    this.layer = undefined;
  }

  public run (): void {
    if (this.layer?.isDirty === true) {
      this.beforeEachRender();
      this.render();
    }
  }

  public next <T extends this> (): T[] | void {
    return this.getChildren();
  }

  protected render (): void {}

  protected getChildren <T extends this> (): T[] | void {
    return this.children as T[];
  }

  private beforeEachRender (): void {
    this.renderId = getRenderId();
    this.renderIndex = getRenderIndex();
  }
}
