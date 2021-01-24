import { BaseComponent } from '../../src/BaseComponent';
import { CanvasEvent } from '../../src/worker/events/defs';
import { LayersManager } from '../../src/layers/LayersManager';
import { Layer } from '../../src/layers/Layer';
import { withLayers } from '../../src/mixins/withLayers';
import { TRect } from '../../src/types';

export type TLayers = {
  connections: Layer
  nodes: Layer
  dragging: Layer
};

const colors = [
  'red', 'purple', 'green', 'grey', 'blue'
];

export type TContext = {
  devicePixelRatio: number
  size: TRect
  root: BaseComponent
  layersManager: LayersManager
};

type TNodProps = { id: number, x: number, y: number, size: number, color: string };
class Nod extends withLayers(BaseComponent)<TContext> {
  public dragging = false;
  private layer: Layer;

  constructor (
    public props: TNodProps
  ) {
    super();
  }

  protected connected (): void {
    super.connected();

    this.setHitBox(this.props.x, this.props.y, this.props.size + this.props.x, this.props.size + this.props.y);
    this.addEventListener('mousedown', this.onDragStart);
    this.context.root.addEventListener('mousemove', this.onMove);
    this.context.root.addEventListener('mouseup', this.onDragEnd);
    this.layer = this.attachToLayer(this.context.layersManager.layers.nodes);
  }

  protected render (): void {
    const ctx = this.layer.ctx;

    ctx.fillStyle = this.props.color;
    ctx.fillRect(this.props.x, this.props.y, this.props.size, this.props.size);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = this.dragging ? 4 : 1;
    ctx.strokeRect(this.props.x, this.props.y, this.props.size, this.props.size);
    ctx.fillStyle = 'black';
    ctx.fillText(String(this.props.id), this.props.x + this.props.size / 2, this.props.y + this.props.size / 2);
  }

  private onMove = (event: CanvasEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (this.dragging) {
      this.props.x += event.movementX;
      this.props.y += event.movementY;
      this.requestUpdate();
    }
  };

  private onDragStart = (event: CanvasEvent<MouseEvent>): void => {
    event.stopPropagation();
    this.dragging = true;
    this.layer = this.attachToLayer(this.context.layersManager.layers.dragging);
    this.zIndex = 1;
    this.requestUpdate();
  };

  private onDragEnd = (event: CanvasEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (this.dragging) {
      this.dragging = false;
      this.layer = this.attachToLayer(this.context.layersManager.layers.nodes);
      this.zIndex = 0;
      this.setHitBox(this.props.x, this.props.y, this.props.size + this.props.x, this.props.size + this.props.y);
      this.requestUpdate();
    }
  };
}

type TConProps = {
  id: number
  node1: Nod
  node2: Nod
  color: string
};
export class Con extends withLayers(BaseComponent)<TContext> {
  private layer: Layer;

  constructor (
    public props: TConProps
  ) {
    super();
  }

  protected connected (): void {
    super.connected();

    this.layer = this.attachToLayer(this.context.layersManager.layers.connections);
  }

  public run (): void {
    if (this.props.node1.dragging || this.props.node2.dragging) {
      this.layer = this.attachToLayer(this.context.layersManager.layers.dragging);
    } else {
      this.layer = this.attachToLayer(this.context.layersManager.layers.connections);
    }

    super.run();
  }

  protected render (): void {
    const ctx = this.layer.ctx;

    ctx.beginPath();
    ctx.moveTo(
      this.props.node1.props.x,
      this.props.node1.props.y
    );
    ctx.lineTo(
      this.props.node2.props.x,
      this.props.node2.props.y
    );
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export class GraphRoot extends BaseComponent<TContext> {
  private nodes;
  private canvas: OffscreenCanvas;

  constructor (
    protected layersManager: LayersManager<TLayers>,
    private devicePixelRatio: number
  ) {
    super();

    this.canvas = this.layersManager.layers.connections.canvas;
    this.nodes = [...Array(100)].map((_, i) => {
      return {
        id: i,
        x: Math.floor(Math.random() * this.canvas.width / devicePixelRatio | 0),
        y: Math.floor(Math.random() * this.canvas.height / devicePixelRatio | 0),
        size: 50 + Math.floor(Math.random() * 50),
        color: colors[Math.floor(Math.random() * 5)]
      };
    });
  }

  protected connected (): void {
    super.connected();

    this.context.devicePixelRatio = this.devicePixelRatio;
    this.context.root = this;
    this.context.size = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height
    };
    this.context.layersManager = this.layersManager;
    this.setHitBox(0, 0, this.canvas.width, this.canvas.height);

    this.updateChildren();
  }

  protected render (): void {
    this.layersManager.prepareToFrame();
    this.layersManager.list.forEach(l => {
      if (l.isDirty) {
        l.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        l.ctx.textAlign = 'center';
        l.ctx.font = '24px serif';
      }
    });
  }

  protected updateChildren (): void {
    this.createChildren().forEach(child => {
      this.appendChild(child);
    });
  }

  protected createChildren (): BaseComponent[] {
    const children: BaseComponent[] = [];

    this.nodes.forEach((node) => {
      children.push(new Nod(node));
    });

    this.nodes.forEach((node, i) => {
      for (let j = 0; j < 5; j++) {
        const node1 = children[Math.floor(Math.random() * this.nodes.length)] as Nod;
        const node2 = children[Math.floor(Math.random() * this.nodes.length)] as Nod;

        children.push(new Con({
          id: i,
          color: colors[Math.floor(Math.random() * 5)],
          node1,
          node2
        }));
      }
    });

    return children;
  }
}
