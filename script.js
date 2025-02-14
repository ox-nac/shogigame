/**
 * 将棋盤の初期配置
 * - text: 駒の文字
 * - rotated: trueなら後手、falseなら先手
 * 盤上に駒がない場合は null を設定
 */
const board = [
  [
    { text: "香", rotated: true }, { text: "桂", rotated: true }, { text: "銀", rotated: true },
    { text: "金", rotated: true }, { text: "王", rotated: true }, { text: "金", rotated: true },
    { text: "銀", rotated: true }, { text: "桂", rotated: true }, { text: "香", rotated: true }
  ],
  [
    null, { text: "飛", rotated: true }, null, null, null, null, null, { text: "角", rotated: true }, null
  ],
  [
    { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true },
    { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true },
    { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false },
    { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false },
    { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }
  ],
  [
    null, { text: "角", rotated: false }, null, null, null, null, null, { text: "飛", rotated: false }, null
  ],
  [
    { text: "香", rotated: false }, { text: "桂", rotated: false }, { text: "銀", rotated: false },
    { text: "金", rotated: false }, { text: "玉", rotated: false }, { text: "金", rotated: false },
    { text: "銀", rotated: false }, { text: "桂", rotated: false }, { text: "香", rotated: false }
  ]
];

let selectedPiece = null;
let selectedPosition = null;
let currentTurn = "bottom";

let topHand = [];
let bottomHand = [];

const boardElement = document.getElementById("shogi-board");

function renderBoard() {
  boardElement.innerHTML = "";
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.onclick = () => {
        if (selectedPiece) {
          movePiece(x, y);
        } else if (board[y][x]) {
          selectPiece(x, y);
        }
      };
      const pieceObj = board[y][x];
      if (pieceObj) {
        const piece = document.createElement("div");
        piece.classList.add("piece");
        piece.innerText = pieceObj.text;
        if (pieceObj.rotated) {
          piece.classList.add("rotated");
        }
        cell.appendChild(piece);
      }
      boardElement.appendChild(cell);
    }
  }
}

function renderHands() {
  const topHandDiv = document.getElementById("top-hand");
  topHandDiv.innerHTML = "";
  let groupTop = {};
  topHand.forEach(pieceObj => {
    let key = pieceObj.text + "_" + pieceObj.rotated;
    if (groupTop[key]) {
      groupTop[key].count++;
    } else {
      groupTop[key] = { piece: pieceObj, count: 1 };
    }
  });
  for (let key in groupTop) {
    let group = groupTop[key];
    let pieceElem = document.createElement("div");
    pieceElem.classList.add("piece");
    pieceElem.innerText = group.piece.text;
    if (group.piece.rotated) {
      pieceElem.classList.add("rotated");
    }
    if (group.count > 1) {
      let countSpan = document.createElement("span");
      countSpan.classList.add("piece-count");
      countSpan.innerText = "×" + group.count;
      pieceElem.appendChild(countSpan);
    }
    topHandDiv.appendChild(pieceElem);
  }

  const bottomHandDiv = document.getElementById("bottom-hand");
  bottomHandDiv.innerHTML = "";
  let groupBottom = {};
  bottomHand.forEach(pieceObj => {
    let key = pieceObj.text + "_" + pieceObj.rotated;
    if (groupBottom[key]) {
      groupBottom[key].count++;
    } else {
      groupBottom[key] = { piece: pieceObj, count: 1 };
    }
  });
  for (let key in groupBottom) {
    let group = groupBottom[key];
    let pieceElem = document.createElement("div");
    pieceElem.classList.add("piece");
    pieceElem.innerText = group.piece.text;
    if (group.piece.rotated) {
      pieceElem.classList.add("rotated");
    }
    if (group.count > 1) {
      let countSpan = document.createElement("span");
      countSpan.classList.add("piece-count");
      countSpan.innerText = "×" + group.count;
      pieceElem.appendChild(countSpan);
    }
    bottomHandDiv.appendChild(pieceElem);
  }
}

function selectPiece(x, y) {
  const pieceObj = board[y][x];
  if (!pieceObj) return;
  const isTopTurn = (currentTurn === "top");
  if (pieceObj.rotated === isTopTurn) {
    selectedPiece = pieceObj;
    selectedPosition = { x, y };
  } else {
    selectedPiece = null;
    selectedPosition = null;
  }
}

function movePiece(x, y) {
  if (!selectedPiece) return;
  const destPiece = board[y][x];
  const isTopTurn = (currentTurn === "top");
  if (destPiece && destPiece.rotated === isTopTurn) {
    selectedPiece = null;
    selectedPosition = null;
    return;
  }
  if (destPiece && destPiece.rotated !== isTopTurn) {
    const capturedPiece = destPiece;
    capturedPiece.rotated = isTopTurn;
    if (isTopTurn) {
      topHand.push(capturedPiece);
    } else {
      bottomHand.push(capturedPiece);
    }
  }
  board[selectedPosition.y][selectedPosition.x] = null;
  board[y][x] = selectedPiece;
  selectedPiece = null;
  selectedPosition = null;
  currentTurn = isTopTurn ? "bottom" : "top";
  renderBoard();
  renderHands();
}

renderBoard();
renderHands();
