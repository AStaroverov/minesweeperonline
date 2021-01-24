import { BaseComponent } from "lib/Renderer/src/BaseComponent"
import { Layer } from "lib/Renderer/src/layers/Layer"
import { Field } from "src/field"

export type Context = {
    root: BaseComponent,
    field: Field
    layer: Layer,
    size: {
        x: number,
        y: number,
        width: number,
        height: number,
    },
    devicePixelRatio: number,
    clickToCell: (x: number, y: number) => void
}