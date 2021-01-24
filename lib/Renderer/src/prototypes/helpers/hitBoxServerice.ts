import RBush, { BBox } from 'rbush';
import { CanvasElement, THitBoxData } from '../CanvasElement';
import { ILayer } from '../../layers/Layer';
import { vec2 } from 'gl-matrix';

export class HitBoxMap extends Map<ILayer, HitBoxService> {
  private dirty = true;
  private sortedList: Array<[HitBoxService, ILayer]> = [];

  public set (k: ILayer, v: HitBoxService): this {
    this.dirty = true;

    return super.set(k, v);
  }

  public delete (key: ILayer): boolean {
    this.dirty = true;

    return super.delete(key);
  }

  public clear (): void {
    this.dirty = true;

    return super.clear();
  }

  public getSortedList (): Array<[HitBoxService, ILayer]> {
    if (this.dirty) {
      this.sortedList = [];

      Map.prototype.forEach.call(this, (a: HitBoxService, b: ILayer) => {
        this.sortedList.push([a, b]);
      });

      this.sortedList.sort((a, b) => {
        return b[1].zIndex - a[1].zIndex;
      });
    }

    return this.sortedList;
  }
}

export class HitBoxService<Component extends CanvasElement = CanvasElement> {
  private rbush = new RBush<THitBoxData<Component>>(16);
  private tmpBox: BBox = {
    minX: 0,
    minY: 0,
    maxY: 0,
    maxX: 0
  };

  public add (item: THitBoxData<Component>): void {
    // TODO: should try Bulk-Inserting Data tree.load([item1, item2, ...]);
    this.rbush.insert(item);
  }

  public remove (item: THitBoxData<Component>): void {
    this.rbush.remove(item);
  }

  public testPoint (point: vec2): Component[] {
    this.tmpBox.minX = point[0] - 1;
    this.tmpBox.minY = point[1] - 1;
    this.tmpBox.maxX = point[0] + 1;
    this.tmpBox.maxY = point[1] + 1;

    return this.testHitBox(this.tmpBox);
  }

  public testHitBox (data: BBox): Component[] {
    const result: Component[] = [];
    const searched: Array<THitBoxData<Component>> = this.rbush.search(data);

    for (let i = 0; i < searched.length; i += 1) {
      if (searched[i].item?.verifyHitToBox(data)) {
        result.push(searched[i].item);
      }
    }

    return result.sort((a, b) => {
      if (a.zIndex !== 0 || b.zIndex !== 0) {
        return b.zIndex - a.zIndex;
      }

      return b.renderIndex - a.renderIndex;
    });
  }
}
