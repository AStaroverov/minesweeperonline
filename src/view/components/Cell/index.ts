import { BaseComponent } from "lib/Renderer/src/BaseComponent";
import { Cell as CellData } from "src/field";
import { Context } from "src/view/context";

export class Cell extends BaseComponent<Context> {
    private color: string;

    constructor(
        private cell: CellData,
        private x: number,
        private y: number,
        private size: number,
    ) {
        super();

        this.color = getColorForNumber(cell.bombsAround);
    }

    public connected(): void {
        this.attachToLayer(this.context.layer);
        this.setHitBox(this.x, this.y, this.x + this.size, this.y + this.size);
        this.addEventListener('click', () => {
            this.context.clickToCell(this.x, this.y);
            this.requestUpdate();
        });
    }

    protected render(): void {
        if (this.layer !== undefined) {
            const ctx = this.layer.ctx;

            if (this.cell.isVisible) {
                ctx.fillStyle = '#bdbdbd';

                if (this.cell.bombsAround > 0) {
                    ctx.textAlign = 'center';
                    ctx.font = 'serif 14px';
                    ctx.fillStyle = this.color;
                    ctx.fillText(String(this.cell.bombsAround), this.x, this.y);
                }
            } else {
                ctx.fillStyle = '#9d9d9d';
            }

            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
}

function getColorForNumber(v: number) {
    switch (v) {
        case 1: return 'blue';
        case 2: return 'green';
        case 3: return 'red';
        case 4: return 'purple';
        case 5: return 'orange';
        default: return 'black';
    }
}