import { clickToCell, Field } from 'src/field';
import { BaseComponent } from '../../lib/Renderer/src/BaseComponent';
import { Layer } from '../../lib/Renderer/src/layers/Layer';
import { Cell } from './components/Cell';
import { Context } from './context';

const OFFSET = 1;

export class Root extends BaseComponent<Context> {
    private cellSize: number;

    constructor (
        private devicePixelRatio: number,
        private field: Field,
        layer: Layer
    ) {
        super();

        this.cellSize = Math.min(
            (layer.canvas.width / field.rows) | 0,
            (layer.canvas.height / field.cols) | 0
        ) - OFFSET;
        
        this.setContext({
            root: this,
            layer,
            field,
            size: {
                x: 0,
                y: 0,
                width: layer.canvas.width / devicePixelRatio,
                height: layer.canvas.height / devicePixelRatio
            },
            devicePixelRatio,
            clickToCell: (x, y) => {
                clickToCell(field, x, y);
            }
        });
    }

    protected connected (): void {
        super.connected();

        this.field.cells.forEach((columns, x) => {
            columns.forEach((cell, y) => {
                this.appendChild(new Cell(cell, x, y, this.cellSize));
            });
        })
    }

    protected render (): void {
        this.context.layer.nextFrame();
    }
}
