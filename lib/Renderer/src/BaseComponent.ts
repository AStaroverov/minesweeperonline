import { CanvasElement } from './prototypes/CanvasElement';
import { HitBoxMap } from './prototypes/helpers/hitBoxServerice';

export type TPrivateContext = {
  root: BaseComponent
  hitBoxMap: HitBoxMap
  scheduleUpdate: () => void
};

export const PRIVATE_CONTEXT = Symbol('PRIVATE_CONTEXT');

export class BaseComponent<Context extends object = object> extends CanvasElement {
  public context: Context;

  protected [PRIVATE_CONTEXT]?: TPrivateContext;

  public setContext (context: Partial<Context>): void {
    this.context = Object.assign(this.context || {}, context);
  }

  public setProps (props: object): void {
    Object.assign(this, props);
  }

  public setParent<Parent extends this>(parent: Parent): void {
    this.context = parent.context;
    this[PRIVATE_CONTEXT] = parent[PRIVATE_CONTEXT];

    super.setParent(parent);
  }

  public removeParent (): void {
    // @ts-expect-error
    this.context = undefined;
    this[PRIVATE_CONTEXT] = undefined;

    super.removeParent();
  }

  public requestUpdate (): void {
    if (this[PRIVATE_CONTEXT]) {
      this.layer?.update();
      this[PRIVATE_CONTEXT]!.scheduleUpdate();
    }
  }

  public attachToLayer (nextLayer): void {
    this.requestUpdate();
    return super.attachToLayer(nextLayer);
  }
}
