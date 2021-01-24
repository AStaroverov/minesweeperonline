import { Layer } from '../../src/layers/Layer';
import { init } from '../commmon/init';
import { LayersManager } from '../../src/layers/LayersManager';
import { render } from '../../src/render';
import { CameraComponent } from '../../src/components/Camera';
import { GraphRoot, TContext, TLayers } from '../commmon/graph';

class Camera extends CameraComponent<TContext> {
  public render (): void {
    const c = this.camera;

    this.setGlobalTransformMatrix([
      1 / c.scale, 0, 0, 0,
      0, 1 / c.scale, 0, 0,
      0, 0, 1, 0,
      -c.x / c.scale, -c.y / c.scale, 0, 1
    ]);

    this.context.layersManager.list.forEach(layer => {
      layer.update();
      layer.ctx.setTransform(
        1, 0, 0,
        1, 0, 0
      );
      layer.ctx.clearRect(
        0, 0, layer.canvas.width, layer.canvas.height
      );

      const dPR = this.context.devicePixelRatio;

      layer.ctx.setTransform(
        c.scale * dPR, 0, 0,
        c.scale * dPR, c.x * dPR, c.y * dPR
      );
    });
  }
}

class RootWithCamera extends GraphRoot {
  protected updateChildren (): void {
    const camera = new Camera({
      ...this.context.size,
      scaleMin: 0.1,
      scaleMax: 4
    });

    this.appendChild(camera);

    this.createChildren().forEach(child => {
      camera.appendChild(child);
    });
  }

  protected render (): void {
    this.layersManager.prepareToFrame();
    this.context.layersManager.list.forEach(l => {
      l.ctx.textAlign = 'center';
      l.ctx.font = '24px serif';
    });
  }
}

async function main (): Promise<void> {
  const {
    workerScope,
    canvases,
    devicePixelRatio
  } = await init();

  const layersManager = new LayersManager<TLayers>({
    connections: new Layer(canvases[0]),
    nodes: new Layer(canvases[1]),
    dragging: new Layer(canvases[2])
  });

  render(workerScope, new RootWithCamera(layersManager, devicePixelRatio));
}
main();
