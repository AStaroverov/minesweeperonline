export enum CellType {
    bomb = 'bomb',
    number = 'number',
    empty = 'empty',
} 
export type Cell = {
    bombsAround: number // -1 = bomb, 0 = empty
    isVisible: boolean
}
export function createCell(bombsAround: number): Cell {
    return {
        bombsAround,
        isVisible: false
    };
}
export type Field = {
    rows: number,
    cols: number,
    bombsCoords: { x: number, y: number }[],
    cells: Cell[][],
}
export function createField(cols: number, rows: number, bombsCount: number): Field {
    const cells = new Array<Cell[]>(rows)
        .fill(null as any)
        .map(
            () => new Array<Cell>(cols)
                .fill(null as any)
                .map(() => createCell(0))
        );
    const existedBombCoords = new Set<number>();
    const bombsCoords: { x: number; y: number }[] = [];
    
    while (bombsCount--) {
        let c: number = 0;
        let r: number = 0;

        while (1) {
            c = Math.round(Math.random() * cols);
            r = Math.round(Math.random() * rows);

            if (!existedBombCoords.has(r * 1000 + c)) {
                existedBombCoords.add(r * 1000 + c);
                bombsCoords.push({x: c, y: r});
                break;
            }
        }

        cells[c][r].bombsAround = -1;

        closestCoords(c, r).forEach(([x, y]) => {
            if (x > 0 && x < cols && y > 0 && y < rows && cells[x][y].bombsAround !== -1) {
                cells[x][y].bombsAround += 1;
            }
        });
    }

    return { rows, cols, cells, bombsCoords };
}

export function closestCoords(
    cIndex: number,
    rIndex: number,
): [number, number][] {
    return [
        [ cIndex + 1, rIndex - 1 ],
        [ cIndex, rIndex - 1 ],
        [ cIndex - 1, rIndex - 1 ],
        [ cIndex - 1, rIndex ],
        [ cIndex - 1, rIndex + 1 ],
        [ cIndex, rIndex + 1 ],
        [ cIndex + 1, rIndex + 1 ],
        [ cIndex + 1, rIndex ],
    ];
}

export function clickToCell(field: Field, c: number, r: number): boolean {
    const cell = field.cells[c][r];
    
    if (cell.bombsAround === -1) {
        return false;
    }
    
    if (cell.bombsAround !== 0) {
        cell.isVisible = true;
    }
    
    showClosestEmptyCells(field, c, r);

    return true;
}

function showClosestEmptyCells(field: Field, c: number, r: number) {
    if (field.cells[c][r].bombsAround !== 0 || field.cells[c][r].isVisible) {
        return;
    }

    field.cells[c][r].isVisible = true;

    showClosestEmptyCells(field, c, r - 1);
    showClosestEmptyCells(field, c - 1, r);
    showClosestEmptyCells(field, c, r + 1);
    showClosestEmptyCells(field, c + 1, r);
}

/*
export function traveseAroundCoord(
    cols: number,
    rows: number,
    cIndex: number,
    rIndex: number,
    deep: number,
    callback: (r: number, c: number) => void
) {
    if (rIndex > (rows - 1) || cIndex > (cols - 1)) {
        return;
    }

    let lvl = 0;

    while (deep--) {
        lvl += 1;
        let cOffset = lvl;
        let rOffset = -lvl;
        let count = lvl * 8;

        while (count--) {
            const y = rIndex + rOffset;
            const x = cIndex + cOffset;

            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                callback(x, y);
            }

            if (cOffset !== -lvl && rOffset === -lvl) {
                cOffset--;
            } else if (rOffset !== lvl && cOffset === -lvl) {
                rOffset++;
            } else if (cOffset !== lvl && rOffset === lvl) {
                cOffset++;
            } else if (rOffset !== -lvl && cOffset === lvl) {
                rOffset--;
            }
        }
    }
}

 */