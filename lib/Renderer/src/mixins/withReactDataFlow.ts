import { BaseComponent } from '../BaseComponent';
import { CanvasElement } from '../prototypes/CanvasElement';
import { TComponentData, TConstructor, TKey, TRef } from '../types';
import { withDeclarativeSetChildren } from './withDeclarativeSetChildren';

export interface TComponentProps {
  [key: string]: any
  readonly key?: TKey
  readonly ref?: TRef
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withReactDataFlow<
  Props extends TComponentProps = object,
  State extends object = object,
  Context extends object = object,
  Base extends TConstructor<BaseComponent<Context>> = TConstructor<BaseComponent<Context>>,
> (base: Base) {
  return class WithReactDataFlow extends withDeclarativeSetChildren(base) {
    public props: Partial<Props> = {};
    public state: Partial<State> = {};

    protected firstRender = true;
    protected firstUpdateChildren = true;

    protected nextProps: Props | undefined = undefined;
    protected nextState: State | undefined = undefined;

    protected __shouldRender: boolean;
    protected __shouldUpdateChildren: boolean;
    protected __shouldRenderChildren: boolean;

    constructor (...a: any[])
    constructor (props: Props, ...a: any[]) {
      super(props, ...a);

      this.setProps(props);
    }

    public connected (): void {
      super.connected();
      this.willMount(this.nextProps, this.nextState);
    }

    public disconnected (): void {
      this.willUnmount();
      super.disconnected();
    }

    public setContext (context: Context): void {
      Object.assign(this.context, context);
      this.requestUpdate();
    }

    public setProps (props?: Partial<Props>): void {
      if (props === undefined) return;

      if (this.nextProps === undefined) {
        this.nextProps = Object.assign({}, this.props, props) as Props;
      } else {
        Object.assign(this.nextProps, props);
      }

      this.requestUpdate();
    }

    protected setState (state?: Partial<State>): void {
      if (state === undefined) return;

      if (this.nextState === undefined) {
        this.nextState = Object.assign({}, this.state, state) as State;
      } else {
        Object.assign(this.nextState, state);
      }

      this.requestUpdate();
    }

    protected willMount (nextProps: Partial<Props> | undefined, nextState: Partial<State> | undefined): void {}

    protected willReceiveProperties (nextProps: Partial<Props>): void {}

    protected shouldRender (nextProps: Partial<Props> | undefined, nextState: Partial<State> | undefined): boolean {
      return true;
    }

    protected shouldUpdateChildren (nextProps: Partial<Props> | undefined, nextState: Partial<State> | undefined): boolean {
      return this.firstUpdateChildren;
    }

    protected shouldRenderChildren (nextProps: Partial<Props> | undefined, nextState: Partial<State> | undefined): boolean {
      return true;
    }

    protected willRender (): void {};
    protected didRender (): void {};

    protected willUpdateChildren (): void{}
    protected updateChildren (): Array<TComponentData<BaseComponent>> | void {}
    protected didUpdateChildren (): void{}

    protected willUnmount (): void{}

    public run (): void {
      if (this.nextProps === undefined && this.nextState === undefined) {
        this.renderLifeCycle();
      } else {
        this.lifeCycle();
      }
    }

    public next (): CanvasElement[] | void {
      return this.__shouldRenderChildren ? super.next() : undefined;
    }

    protected lifeCycle (): void {
      if (this.nextProps !== undefined) {
        this.willReceiveProperties(this.nextProps);
      }

      this.__shouldRender = this.shouldRender(this.nextProps, this.nextState);
      this.__shouldUpdateChildren = this.shouldUpdateChildren(this.nextProps, this.nextState);
      this.__shouldRenderChildren = this.shouldRenderChildren(this.nextProps, this.nextState);

      if (this.nextProps !== undefined) {
        Object.assign(this.props, this.nextProps);
        this.nextProps = undefined;
      }

      if (this.nextState !== undefined) {
        Object.assign(this.props, this.nextState);
        this.nextState = undefined;
      }

      if (this.__shouldRender) {
        this.renderLifeCycle();
      }

      if (this.__shouldUpdateChildren) {
        this.childrenLifeCycle();
      }
    }

    protected renderLifeCycle (): void {
      this.willRender();
      super.run();
      this.didRender();

      this.firstRender = false;
    }

    protected childrenLifeCycle (): void {
      this.willUpdateChildren();
      this.setChildren(
        this.updateChildren()
      );
      this.didUpdateChildren();

      this.firstUpdateChildren = false;
    }
  };
}
