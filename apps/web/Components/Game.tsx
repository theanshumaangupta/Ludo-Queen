"use client"
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react"
import { Colors } from "@prisma/client";

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
const STOPS: number[] = [
    1, 9, 14, 22, 27, 35, 40, 48
]
let COLOR_DATA: BOARD_COLOR_INIT_DATA;

class Piece {
    distanceCovered: number;
    position: number;
    passed: boolean;
    highlighted: boolean;
    lockedPosition: [number, number];
    locked: boolean;
    constructor(color: Colors) {
        let position = COLOR_DATA[color].begin_postion;
        this.distanceCovered = 0;
        this.position = position; // position in the board
        this.lockedPosition = [0, 0];
        this.passed = false;
        this.highlighted = false;
        this.locked = true;
    }
}

class Player {
    color: string;
    pieces: Piece[];
    begin_postion: number;
    end_position: number;
    safe_home_arr: [number, number][];
    c: CanvasRenderingContext2D;
    home_cord: [number, number];
    lockedPiecesCords: [number, number][] = [];
    radius: number;
    constructor(color: Colors, c: CanvasRenderingContext2D) {
        this.color = color;
        this.home_cord = COLOR_DATA[this.color as Colors].home_cord;
        this.begin_postion = COLOR_DATA[color].begin_postion;
        this.end_position = COLOR_DATA[color].end_position;
        this.radius = blockSize / 1.5;
        this.c = c;
        this.lockedPiecesCords = [
            [this.home_cord[0] + (HOME_SIZE / 4), this.home_cord[1] + (HOME_SIZE / 4)],
            [this.home_cord[0] + HOME_SIZE - (HOME_SIZE / 4), this.home_cord[1] + (HOME_SIZE / 4)],
            [this.home_cord[0] + (HOME_SIZE / 4), this.home_cord[1] + HOME_SIZE - (HOME_SIZE / 4)],
            [this.home_cord[0] + HOME_SIZE - (HOME_SIZE / 4), this.home_cord[1] + HOME_SIZE - (HOME_SIZE / 4)],
        ]
        this.pieces = Array.from({ length: 4 }, () => new Piece(color));
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            const lockedCords = this.lockedPiecesCords[i];
            if (!piece || !lockedCords) continue;
            piece.lockedPosition = lockedCords;
        }
        let safe_home_arr: [number, number][] = [];
        this.safe_home_arr = safe_home_arr;
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

    }
    move(piece: Piece, dice: number) {
        if (piece.passed) {
            return;
        }
        if (piece.locked) {
            if (dice !== 6) {
                return;
            }
            piece.locked = false;
            this.deHighlightPossiblePieces();
            return;
        }
        const next_position = PATH.length < piece.position + dice ? (piece.position + dice - PATH.length) : piece.position + dice;
        piece.position = next_position;
        this.deHighlightPossiblePieces();

    }
    draw_pieces() {
        this.pieces.forEach((p) => {
            switch (this.color) {
                case Colors.RED:
                    this.c.fillStyle = "#ff0000";
                    break;
                case Colors.BLUE:
                    this.c.fillStyle = "#0000ff";
                    break;
                case Colors.GREEN:
                    this.c.fillStyle = "#00ff00";
                    break;
                case Colors.YELLOW:
                    this.c.fillStyle = "#ffff00";
                    break;
            }
            this.c.fillStyle = Colors[this.color as Colors];
            if (p.locked) {
                this.c.beginPath();
                // @ts-ignore
                this.c.arc(p.lockedPosition[0], p.lockedPosition[1], this.radius, 0, Math.PI * 2);
                if (p.highlighted) {
                    this.c.fillStyle = "purple";
                }
                this.c.fill();
            }
            else {
                // // @ts-ignore
                // this.c.fillRect(PATH[p.position][0] + (HOME_SIZE / 4), PATH[p.position][1] + (HOME_SIZE / 4), this.radius, 0, Math.PI * 2);

                // @ts-ignore
                this.c.beginPath();
                // @ts-ignore
                this.c.arc(PATH[p.position][0] + blockSize / 2, PATH[p.position][1] + (blockSize / 2), blockSize / 2, 0, Math.PI * 2);
                this.c.fill();
            }
        })
    }
    drawSafeHome() {
        this.safe_home_arr.forEach((p) => {
            this.c.fillStyle = Colors[this.color as Colors];
            // @ts-ignore
            this.c.fillRect(p[0], p[1], blockSize, blockSize);
        })
    }
    highlightPossiblePieces(dice: number): boolean {
        let anyPossiblePieces: boolean = false;
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            if (!piece) {
                continue;
            }
            if (piece?.passed) {
                continue;
            }
            if (piece?.locked && dice !== 6) {
                continue;
            }
            piece.highlighted = true;
            anyPossiblePieces = true;
        }
        return anyPossiblePieces;
    }
    deHighlightPossiblePieces() {
        this.pieces.forEach((p) => {
            p.highlighted = false;
        })
    }
    update() {
        this.draw_pieces();
        this.drawSafeHome();
    }
}

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
            begin_postion: 49,
            end_position: 38,
            home_cord: [0, canvas.height - HOME_SIZE]
        }
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

function DrawHouses(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {

    c.strokeStyle = "#ff0000";
    c.strokeRect(0, 0, HOME_SIZE, HOME_SIZE);

    c.strokeStyle = "#00ff00";
    c.strokeRect(canvas.width - HOME_SIZE, 0, HOME_SIZE, HOME_SIZE);

    // Blue
    c.strokeStyle = "#0000ff";
    c.strokeRect(canvas.width - HOME_SIZE, canvas.height - HOME_SIZE, HOME_SIZE, HOME_SIZE);

    // Yellow
    c.strokeStyle = "#ffff00";
    c.strokeRect(0, canvas.height - HOME_SIZE, HOME_SIZE, HOME_SIZE);
}
function DrawStops(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    c.fillStyle = "#111f36";
    STOPS.forEach((s) => {
        // @ts-ignore
        c.fillRect(PATH[s][0], PATH[s][1], blockSize, blockSize);
    })
    ALL_PLAYERS.forEach((p) => {
        c.fillStyle = Colors[p.color as Colors];
        // @ts-ignore
        c.fillRect(PATH[p.begin_postion][0], PATH[p.begin_postion][1], blockSize, blockSize);
    })
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
    ALL_PLAYERS.push(new Player(Colors.GREEN, c));
    ALL_PLAYERS.push(new Player(Colors.BLUE, c));
    ALL_PLAYERS.push(new Player(Colors.YELLOW, c));
}

export default function() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const parentDivRef = useRef<HTMLDivElement | null>(null);
    let animationFrameId: number;
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [parentDiv, setParentDiv] = useState<HTMLDivElement | null>(null);
    const [dice, setDice] = useState<number>(0);
    const [turn, setTurn] = useState<Player>();
    const [freezeDice, setFreezeDice] = useState(false);

    const setCanvasSize = (canvas: HTMLCanvasElement, parentDiv: HTMLDivElement) => {
        canvas.width = parentDiv.getBoundingClientRect().width - 39;
        canvas.height = parentDiv.getBoundingClientRect().height - 55;
        setCanvas(canvas);
    }

    function rollDice() {
        if (freezeDice) return;
        const rolledDice = Math.floor(Math.random() * 6) + 1;
        setDice(rolledDice);
        if (!turn?.highlightPossiblePieces(rolledDice)) {
            rotateTurn();
            setFreezeDice(false);
        }
        else {
            setFreezeDice(true);
        }
    }

    function rotateTurn() {
        const currentTurn = turn;
        if (!currentTurn) return;
        const nextTurn = ALL_PLAYERS[(ALL_PLAYERS.indexOf(currentTurn) + 1) % ALL_PLAYERS.length];
        setTurn(nextTurn);
    }

    function ClearBoard(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        if (!c || !canvas) return;
        c.fillStyle = "white";
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
    const drawBlock = (c: CanvasRenderingContext2D, x: number, y: number) => {
        if (!c) return;
        c.strokeStyle = "#000000";
        c.strokeRect(x, y, blockSize, blockSize);
    }
    useEffect(() => {
        const canvas = canvasRef.current;
        const parentDiv = parentDivRef.current;

        if (!canvas || !parentDiv) return;
        const c = canvas.getContext("2d");
        if (!c) return;

        setCanvasSize(canvas, parentDiv);
        setColorData(canvas);
        fillPathArray(canvas);
        initializePlayers(c)
        setTurn(ALL_PLAYERS[0]);

        function engine() {
            if (!c || !canvas) return;

            ClearBoard(c, canvas);
            DrawHouses(c, canvas)
            DrawStops(c, canvas)
            let i = 0;
            PATH.forEach((p) => {
                c.strokeStyle = "#0000ff";
                c.strokeText(`${i}`, p[0], p[1] + blockSize);
                drawBlock(c, p[0], p[1]);
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
    }, [])


    useEffect(() => {
        if (!canvas) return;
        const c = canvas.getContext("2d");
        if (!c) return;
        const handleCanvasClick = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            ALL_PLAYERS.forEach((player, i) => {
                player.pieces.forEach((piece) => {
                    let positionCord;
                    if (piece.locked && player.radius) {
                        positionCord = [piece.lockedPosition[0] - player.radius, piece.lockedPosition[1] - player.radius];
                    }
                    else {
                        positionCord = PATH[piece.position];
                    }

                    // @ts-ignore
                    if (positionCord[0] <= x && x <= positionCord[0] + blockSize && positionCord[1] <= y && y <= positionCord[1] + blockSize) {
                        if (piece.highlighted) {
                            player.move(piece, dice);
                            if (dice !== 6) {
                                rotateTurn()
                            }
                            setFreezeDice(false);
                        }
                    }
                })
            })
        }
        canvas.addEventListener("click", handleCanvasClick)
        return () => {
            canvas.removeEventListener("click", handleCanvasClick)
        }
    }, [canvas, parentDiv, dice])

    return (
        <div className="flex items-center justify-between" >
            <button className="border-white border-4 rounded-xl p-4" onClick={rollDice}> {dice} </button>
            < div className="min-h-screen max-w-[40rem] w-full" ref={parentDivRef} >
                <canvas ref={canvasRef} />
            </div>
        </div>
    )
}
