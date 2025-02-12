// 将棋盤データ（9x9の配列）
const board = [
    ["香", "桂", "銀", "金", "王", "金", "銀", "桂", "香"],
    ["", "飛", "", "", "", "", "", "角", ""],
    ["歩", "歩", "歩", "歩", "歩", "歩", "歩", "歩", "歩"],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["歩", "歩", "歩", "歩", "歩", "歩", "歩", "歩", "歩"],
    ["", "角", "", "", "", "", "", "飛", ""],
    ["香", "桂", "銀", "金", "玉", "金", "銀", "桂", "香"],
];

let selectedPiece = null;
let selectedPosition = null;

const boardElement = document.getElementById("shogi-board");

// 盤を描画する関数
function renderBoard() {
    boardElement.innerHTML = "";
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (board[y][x]) {
                const piece = document.createElement("div");
                piece.classList.add("piece");
                piece.innerText = board[y][x];
                piece.dataset.x = x;
                piece.dataset.y = y;
                piece.onclick = () => selectPiece(x, y);
                cell.appendChild(piece);
            } else {
                cell.onclick = () => movePiece(x, y);
            }

            boardElement.appendChild(cell);
        }
    }
}

// 駒を選択する関数
function selectPiece(x, y) {
    if (board[y][x]) {
        selectedPiece = board[y][x];
        selectedPosition = { x, y };
    }
}

// 駒を移動する関数
function movePiece(x, y) {
    if (selectedPiece) {
        board[selectedPosition.y][selectedPosition.x] = "";
        board[y][x] = selectedPiece;
        selectedPiece = null;
        selectedPosition = null;
        renderBoard();
    }
}

// 初期描画
renderBoard();
