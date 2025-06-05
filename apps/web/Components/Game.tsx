"use client"
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react"
import { Colors } from "@prisma/client";
import { assert } from "console";

const blockSize = 40;
const HOME_SIZE = blockSize * 6;
const PATH: [number, number][] = []
const ALL_PLAYERS: Player[] = []
type BOARD_COLOR_INIT_DATA = {
    [key in Colors]: {
        begin_postion: number;
        end_position: number;
        home_cord: [number, number]
    }
}
let COLOR_DATA: BOARD_COLOR_INIT_DATA;

const setColorData = (canvas: HTMLCanvasElement) => {
    COLOR_DATA = {
        RED: {
            begin_postion: 1,
            end_position: 51,
            home_cord: [0, 0],
        },
        BLUE: {
            begin_postion: 27,
            end_position: 25,
            home_cord: [canvas.width - HOME_SIZE, canvas.height - HOME_SIZE]
        },
        GREEN: {
            begin_postion: 14,
            end_position: 12,
            home_cord: [canvas.width - HOME_SIZE, 0]
        },
        YELLOW: {
            begin_postion: 40,
            end_position: 38,
            home_cord: [0, canvas.height - HOME_SIZE]
        }
    }
}

type Piece_type = {
    distanceCovered: number;
    position: number;
    passed: boolean;
    locked: boolean;
}
function getNewPiece(color: Colors): Piece_type {
    let position = COLOR_DATA[color].begin_postion;
    return {
        distanceCovered: 0,
        position, // position in the board
        passed: false,
        locked: true,
    }
}

const generateRow = (base_block: [number, number], direction: { x: number, y: number }, putExtraBlock: boolean = true): [number, number][] => {
    const generatedRow: [number, number][] = [];
    let i = 0;
    while (i < 6) {
        const readyBlock: [number, number] = [direction.x * blockSize * i + base_block[0], direction.y * blockSize * i + base_block[1]];
        generatedRow.push(readyBlock);
        if (i === 5 && putExtraBlock) {
            if (direction.y === 0) {
                direction.y = direction.x;
                direction.x = 0;
            }
            else {
                direction.x = -direction.y;
                direction.y = 0;
            }

            const lastExtraBlock: [number, number] = [direction.x * blockSize + readyBlock[0], direction.y * blockSize + readyBlock[1]];
            generatedRow.push(lastExtraBlock);
        }
        i++;
    }
    return generatedRow;
}
class Player {
    color: string;
    pieces: Piece_type[];
    begin_postion: number;
    end_position: number;
    safe_home_arr: [number, number][];
    c: CanvasRenderingContext2D;
    constructor(color: Colors, c: CanvasRenderingContext2D) {
        this.color = color;
        this.pieces = new Array(4).fill(getNewPiece(color));
        this.begin_postion = COLOR_DATA[color].begin_postion;
        this.end_position = COLOR_DATA[color].end_position;
        let safe_home_arr: [number, number][] = [];
        switch (this.color) {
            case Colors.RED:
                // @ts-ignore
                safe_home_arr = generateRow([PATH[this.end_position][0], PATH[this.end_position][1]], { x: 1, y: 0 }, false).slice(1);
                break;
            case Colors.BLUE:
                // @ts-ignore
                safe_home_arr = generateRow([PATH[this.end_position][0], PATH[this.end_position][1]], { x: -1, y: 0 }, false).slice(1);
                break;
            case Colors.YELLOW:
                // @ts-ignore
                safe_home_arr = generateRow([PATH[this.end_position][0], PATH[this.end_position][1]], { x: 0, y: -1 }, false).slice(1);
                break;
            case Colors.GREEN:
                // @ts-ignore
                safe_home_arr = generateRow([PATH[this.end_position][0], PATH[this.end_position][1]], { x: 0, y: 1 }, false).slice(1);
                break;
        }

        this.safe_home_arr = safe_home_arr;
        this.c = c;
    }
    move() {

    }
    draw_pieces() {
        this.pieces.forEach((p) => {
            this.c.fillStyle = Colors[this.color as Colors];
            // @ts-ignore
            this.c.fillRect(PATH[p.position][0], PATH[p.position][1], blockSize, blockSize);
        })
    }
    drawSafeHome() {
        this.safe_home_arr.forEach((p) => {
            this.c.fillStyle = Colors[this.color as Colors];
            // @ts-ignore
            this.c.fillRect(p[0], p[1], blockSize, blockSize);
        })
    }
    update() {
        this.pieces.forEach((p) => {
            p.position = this.begin_postion + p.distanceCovered;
        })
        this.draw_pieces();
        this.drawSafeHome();
    }
}

function DrawHouses(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {

    c.fillStyle = "#ff0000";
    c.fillRect(0, 0, HOME_SIZE, HOME_SIZE);

    c.fillStyle = "#00ff00";
    c.fillRect(canvas.width - HOME_SIZE, 0, HOME_SIZE, HOME_SIZE);

    // Blue
    c.fillStyle = "#0000ff";
    c.fillRect(canvas.width - HOME_SIZE, canvas.height - HOME_SIZE, HOME_SIZE, HOME_SIZE);

    // Yellow
    c.fillStyle = "#ffff00";
    c.fillRect(0, canvas.height - HOME_SIZE, HOME_SIZE, HOME_SIZE);
}

function fillPathArray(canvas: HTMLCanvasElement) {
    let generatedRow: [number, number][] = [];

    generatedRow = generateRow([0, HOME_SIZE], { x: 1, y: 0 }, false);
    PATH.push(...generatedRow);

    generatedRow = generateRow([HOME_SIZE, HOME_SIZE - blockSize], { x: 0, y: -1 }, true);
    PATH.push(...generatedRow);

    generatedRow = generateRow([canvas.width - HOME_SIZE - blockSize, 0], { x: 0, y: 1 }, false);
    PATH.push(...generatedRow);

    generatedRow = generateRow([canvas.width - HOME_SIZE, HOME_SIZE], { x: 1, y: 0 }, true);
    PATH.push(...generatedRow);

    generatedRow = generateRow([canvas.width - blockSize, canvas.height - HOME_SIZE - blockSize], { x: -1, y: 0 }, false);
    PATH.push(...generatedRow);

    generatedRow = generateRow([canvas.width - HOME_SIZE - blockSize, canvas.height - HOME_SIZE], { x: 0, y: 1 }, true);
    PATH.push(...generatedRow);

    generatedRow = generateRow([HOME_SIZE, canvas.height - blockSize], { x: 0, y: -1 }, false);
    PATH.push(...generatedRow);

    generatedRow = generateRow([HOME_SIZE - blockSize, canvas.height - HOME_SIZE - blockSize], { x: -1, y: 0 }, true);
    PATH.push(...generatedRow);
}

function initializePlayers(c: CanvasRenderingContext2D) {
    ALL_PLAYERS.push(new Player(Colors.RED, c));
    ALL_PLAYERS.push(new Player(Colors.BLUE, c));
    ALL_PLAYERS.push(new Player(Colors.GREEN, c));
    ALL_PLAYERS.push(new Player(Colors.YELLOW, c));
}

export default function() {
    const session = useSession()
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const parentDivRef = useRef<HTMLDivElement | null>(null);
    let animationFrameId: number;
    let canvas: HTMLCanvasElement | null = null;
    let parentDiv: HTMLDivElement | null = null;

    const setCanvasSize = () => {
        if (!canvas || !parentDiv) return;
        canvas.width = parentDiv.getBoundingClientRect().width - 39;
        canvas.height = parentDiv.getBoundingClientRect().height - 55;
    }


    useEffect(() => {
        canvas = canvasRef.current;
        parentDiv = parentDivRef.current;

        if (!canvas) return;
        const c = canvas.getContext("2d");
        if (!c) return;

        setCanvasSize()
        setColorData(canvas);
        fillPathArray(canvas);
        initializePlayers(c)

        function ClearBoard() {
            if (!c || !canvas) return;
            c.fillStyle = "white";
            c.fillRect(0, 0, canvas.width, canvas.height);
        }
        const drawBlock = (x: number, y: number) => {
            if (!c) return;
            c.strokeStyle = "#000000";
            c.strokeRect(x, y, blockSize, blockSize);
        }


        function engine() {
            if (!c || !canvas) return;
            // game code here

            // Board 
            ClearBoard();
            DrawHouses(c, canvas)
            let i = 0;
            PATH.forEach((p) => {
                c.strokeStyle = "#0000ff";
                c.strokeText(`${i}`, p[0], p[1] + blockSize);
                drawBlock(p[0], p[1]);
                i++;
            })
            ALL_PLAYERS.forEach((p) => {
                p.update();
            })
        }

        function main() {
            if (!canvas || !c) return;
            c.clearRect(0, 0, canvas.width, canvas.height);
            engine();
            animationFrameId = requestAnimationFrame(main);
        }
        main();
        return () => {
            cancelAnimationFrame(animationFrameId);
        }
    }, [canvasRef, parentDivRef])

    return (
        <div className="min-h-screen w-full" ref={parentDivRef} >
            <canvas ref={canvasRef} />
        </div>
    )
}
