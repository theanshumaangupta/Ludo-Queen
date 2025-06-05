"use client"
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react"

const blockSize = 40;
const HOME_SIZE = blockSize * 6;
const PATH: [number, number][] = []

class Player {
    color: string;
    position: number[];
    homeEntrance: number;
    startPosition: number;
    constructor(color: string) {
        this.color = color;
        this.position = [0, 0, 0, 0];
        this.homeEntrance = 0;
        this.startPosition = 0;
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
    const fillRow = (base_block: [number, number], direction: { x: number, y: number }, putExtraBlock: boolean = true) => {
        let i = 0;
        while (i < 6) {
            const readyBlock: [number, number] = [direction.x * blockSize * i + base_block[0], direction.y * blockSize * i + base_block[1]];
            PATH.push(readyBlock);
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
                PATH.push(lastExtraBlock);
            }
            i++;
        }
    }
    fillRow([0, HOME_SIZE], { x: 1, y: 0 }, false);
    fillRow([HOME_SIZE, HOME_SIZE - blockSize], { x: 0, y: -1 }, true);
    fillRow([canvas.width - HOME_SIZE - blockSize, 0], { x: 0, y: 1 }, false);
    fillRow([canvas.width - HOME_SIZE, HOME_SIZE], { x: 1, y: 0 }, true);
    fillRow([canvas.width - blockSize, canvas.height - HOME_SIZE - blockSize], { x: -1, y: 0 }, false);
    fillRow([canvas.width - HOME_SIZE - blockSize, canvas.height - HOME_SIZE], { x: 0, y: 1 }, true);
    fillRow([HOME_SIZE, canvas.height - blockSize], { x: 0, y: -1 }, false);
    fillRow([HOME_SIZE - blockSize, canvas.height - HOME_SIZE - blockSize], { x: -1, y: 0 }, true);
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
        setCanvasSize()
        const c = canvas.getContext("2d");

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

        fillPathArray(canvas);
        function engine() {
            if (!c || !canvas) return;
            // game code here

            // Board 
            ClearBoard();
            DrawHouses(c, canvas)
            PATH.forEach((p) => {
                drawBlock(p[0], p[1]);
            })
            c.fillStyle = "teal";
            // @ts-ignore
            c.fillRect(PATH[25][0], PATH[25][1], blockSize, blockSize);
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
