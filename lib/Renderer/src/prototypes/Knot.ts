import { EvTarget } from './EvTarget';

export class Knot extends EvTarget {
  public isConnected = false;
  protected children: unknown[];

  protected parent?: unknown;

  public getParent<Parent extends Knot> (): Parent | undefined {
    return this.parent as Parent | undefined;
  }

  public appendChild<Child extends Knot> (node: Child): void {
    if (this.children === undefined) {
      this.children = [];
    }

    this.children.push(node);
    node.setParent(this as any);
    node.connected();
  }

  public removeChild<Child extends Knot> (node: Child): void {
    const index = this.children.indexOf(node);

    if (index !== -1) {
      this.children.splice(index, 1);
      node.removeParent();
      node.disconnected();
    }
  }

  public containsChild<Child extends Knot> (node: Child): boolean {
    return this.children.includes(node);
  }

  protected setParent<Parent extends this>(parent: Parent): void {
    this.parent = parent;
  }

  protected removeParent (): void {
    this.parent = undefined;
  }

  protected connected (): void {
    this.isConnected = true;
  }

  protected disconnected (): void {
    this.isConnected = false;
    // todo: recursive disconnect
  }
}
