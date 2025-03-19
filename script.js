// ===== グローバル変数 =====
let currentTurn = "sente"; // 先手（sente: rotated=false）が初手
let selectedPiece = null;
let selectedPosition = null;
let selectedHandPiece = null; // 持ち駒ドロップ用に選択中の駒（文字）
let topHand = [];    // 後手側が捕獲した駒（rotated:true）
let bottomHand = []; // 先手側が捕獲した駒（rotated:false)

// ===== 初期盤面の状態（標準配置） =====
const initialBoard = [
  // row0: goteバックライン
  [
    { text: "香", rotated: true },
    { text: "桂", rotated: true },
    { text: "銀", rotated: true },
    { text: "金", rotated: true },
    { text: "玉", rotated: true },
    { text: "金", rotated: true },
    { text: "銀", rotated: true },
    { text: "桂", rotated: true },
    { text: "香", rotated: true }
  ],
  // row1: gote飛角ライン
  [
    null,
    { text: "飛", rotated: true },
    null,
    null,
    null,
    null,
    null,
    { text: "角", rotated: true },
    null
  ],
  // row2: gote歩ライン
  [
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true },
    { text: "歩", rotated: true }
  ],
  // row3
  [ null, null, null, null, null, null, null, null, null ],
  // row4
  [ null, null, null, null, null, null, null, null, null ],
  // row5
  [ null, null, null, null, null, null, null, null, null ],
  // row6: sente歩ライン
  [
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false },
    { text: "歩", rotated: false }
  ],
  // row7: sente角飛ライン
  [
    null,
    { text: "角", rotated: false },
    null,
    null,
    null,
    null,
    null,
    { text: "飛", rotated: false },
    null
  ],
  // row8: senteバックライン
  [
    { text: "香", rotated: false },
    { text: "桂", rotated: false },
    { text: "銀", rotated: false },
    { text: "金", rotated: false },
    { text: "玉", rotated: false },
    { text: "金", rotated: false },
    { text: "銀", rotated: false },
    { text: "桂", rotated: false },
    { text: "香", rotated: false }
  ]
];

let board = initialBoard;

// ===== 駒の移動ルール =====
const pieceMoves = {
  "歩": [[0, -1]],
  "香": [...Array(8).keys()].map(i => [0, -(i + 1)]),
  "桂": [[-1, -2], [1, -2]],  // 桂馬は左右1マス、前2マス（ワープ）
  "銀": [[0, -1], [-1, -1], [1, -1], [-1, 1], [1, 1]],
  "金": [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0], [0, 1]],
  "玉": [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [-1, 1], [1, 1]],
  "飛": [...Array(8).keys()].flatMap(i => [[0, -(i + 1)], [0, i + 1], [-(i + 1), 0], [i + 1, 0]]),
  "角": [...Array(8).keys()].flatMap(i => [[-(i + 1), -(i + 1)], [i + 1, i + 1], [-(i + 1), i + 1], [i + 1, -(i + 1)]])
};

// --- 成り後の駒の移動ルール ---
// 歩、香、桂、銀の成りは金と同じ動き
pieceMoves["と"] = pieceMoves["金"];
pieceMoves["成香"] = pieceMoves["金"];
pieceMoves["成桂"] = pieceMoves["金"];
pieceMoves["成銀"] = pieceMoves["金"];
// 角の成り（馬）は角の動きに加えて上下左右の1マス移動
pieceMoves["馬"] = pieceMoves["角"].concat([[0, -1], [0, 1], [-1, 0], [1, 0]]);
// 飛の成り（龍）は飛の動きに加えて斜め1マス移動
pieceMoves["龍"] = pieceMoves["飛"].concat([[-1, -1], [-1, 1], [1, -1], [1, 1]]);

// --- 成り可能な駒のマッピング ---
const promotionMap = {
  "歩": "と",
  "香": "成香",
  "桂": "成桂",
  "銀": "成銀",
  "角": "馬",
  "飛": "龍"
};
// 成り駒の文字一覧
const promotedSymbols = Object.values(promotionMap);
// 捕獲時に成り駒を元に戻すためのマッピング
const demotionMap = {
  "と": "歩",
  "成香": "香",
  "成桂": "桂",
  "成銀": "銀",
  "馬": "角",
  "龍": "飛"
};

function isValidMove(piece, fromX, fromY, toX, toY, board) {
  if (!pieceMoves[piece]) return false;
  const dx = toX - fromX;
  const dy = toY - fromY;
  let moves = pieceMoves[piece];
  if (selectedPiece && selectedPiece.rotated) {
    moves = moves.map(([mx, my]) => [mx, -my]);
  }
  // 該当する移動先かどうかチェック
  if (moves.some(([mx, my]) => mx === dx && my === dy)) {
    // 桂馬はワープ移動なので経路確認をスキップ
    if (selectedPiece && selectedPiece.text === "桂") {
      return true;
    }
    return isPathClear(fromX, fromY, toX, toY, board, piece);
  }
  return false;
}

function isPathClear(fromX, fromY, toX, toY, board, piece) {
  const dx = Math.sign(toX - fromX);
  const dy = Math.sign(toY - fromY);
  let x = fromX + dx, y = fromY + dy;
  while (x !== toX || y !== toY) {
    if (board[y][x]) return false;
    x += dx;
    y += dy;
  }
  return true;
}

// --- 駒が成るべきか判定する関数 ---
// ※ドロップ後に置かれた駒は fromDrop フラグが立っている場合、移動後も成る資格があります。
function shouldPromote(piece, toY) {
  if (!promotionMap.hasOwnProperty(piece.text)) return false;
  if (promotedSymbols.includes(piece.text)) return false;
  if (piece.fromDrop) return true;
  if (!piece.rotated && toY < 3) return true;
  if (piece.rotated && toY > 5) return true;
  return false;
}

// --- 駒を成る関数 ---
function promotePiece(piece) {
  return promotionMap[piece.text] || piece.text;
}

// --- 持ち駒ドロップ処理 ---
function dropHandPiece(x, y) {
  // まず、盤上に既に駒があるかチェック
  if (board[y][x]) {
    selectedHandPiece = null;
    renderBoard();
    renderHands();
    return;
  }
  // --- 追加: ここで持ち駒の種類ごとにドロップ可能な行をチェック ---
  if (currentTurn === "sente") {
    // Sente：盤上の行番号0が相手の一段目、行1が二段目
    if (selectedHandPiece === "歩" || selectedHandPiece === "香") {
      if (y === 0) {
        alert("歩・香は相手の一段目には置けません。");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
    if (selectedHandPiece === "桂") {
      if (y <= 1) {
        alert("桂は相手の一段目、二段目には置けません。");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
  } else {
    // Gote：盤上の行番号8が相手の一段目、7が二段目
    if (selectedHandPiece === "歩" || selectedHandPiece === "香") {
      if (y === 8) {
        alert("歩・香は相手の一段目には置けません。");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
    if (selectedHandPiece === "桂") {
      if (y >= 7) {
        alert("桂は相手の一段目、二段目には置けません。");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
  }
  // 通常のドロップ処理
  let handArray;
  if (currentTurn === "sente") {
    handArray = bottomHand;
  } else {
    handArray = topHand;
  }
  const index = handArray.findIndex(piece => piece.text === selectedHandPiece);
  if (index === -1) return;
  // 新たに盤上に置く駒。ドロップ位置が相手陣なら fromDrop フラグをセット
  const newPiece = { text: selectedHandPiece, rotated: currentTurn === "gote" };
  if ((!newPiece.rotated && y < 3) || (newPiece.rotated && y > 5)) {
    newPiece.fromDrop = true;
  }
  handArray.splice(index, 1);
  board[y][x] = newPiece;
  selectedHandPiece = null;
  currentTurn = (currentTurn === "sente") ? "gote" : "sente";
  renderBoard();
  renderHands();
}

// ===== 駒の移動・捕獲処理 =====
function movePiece(x, y) {
  if (!selectedPiece || !selectedPosition) return;
  const fromX = selectedPosition.x;
  const fromY = selectedPosition.y;
  if (board[y][x] && board[y][x].rotated === selectedPiece.rotated) {
    selectedPiece = null;
    selectedPosition = null;
    renderBoard();
    return;
  }
  if (!isValidMove(selectedPiece.text, fromX, fromY, x, y, board)) {
    selectedPiece = null;
    selectedPosition = null;
    renderBoard();
    return;
  }
  if (board[y][x]) {
    const capturedPiece = board[y][x];
    if (demotionMap.hasOwnProperty(capturedPiece.text)) {
      capturedPiece.text = demotionMap[capturedPiece.text];
    }
    capturedPiece.rotated = !capturedPiece.rotated;
    delete capturedPiece.fromDrop;
    if (selectedPiece.rotated) {
      topHand.push(capturedPiece);
    } else {
      bottomHand.push(capturedPiece);
    }
  }
  board[fromY][fromX] = null;
  if (shouldPromote(selectedPiece, y)) {
    selectedPiece.text = promotePiece(selectedPiece);
    delete selectedPiece.fromDrop;
  }
  board[y][x] = selectedPiece;
  selectedPiece = null;
  selectedPosition = null;
  currentTurn = (currentTurn === "sente") ? "gote" : "sente";
  renderBoard();
  renderHands();
}

// ===== セルクリック処理 =====
function handleCellClick(row, col, cell) {
  if (selectedHandPiece) {
    dropHandPiece(col, row);
    return;
  }
  if (!selectedPiece) {
    if (board[row][col] && pieceBelongsToCurrentTurn(board[row][col])) {
      selectedPiece = board[row][col];
      selectedPosition = { x: col, y: row };
      renderBoard();
    }
  } else {
    if (selectedPosition.x === col && selectedPosition.y === row) {
      selectedPiece = null;
      selectedPosition = null;
      renderBoard();
      return;
    }
    movePiece(col, row);
  }
}

function pieceBelongsToCurrentTurn(piece) {
  return (currentTurn === "sente" && piece.rotated === false) ||
         (currentTurn === "gote" && piece.rotated === true);
}

// ===== 持ち駒クリック処理 =====
function handleHandClick(pieceText, handElement) {
  if ((currentTurn === "sente" && handElement.id !== "bottom-hand") ||
      (currentTurn === "gote" && handElement.id !== "top-hand")) {
    return;
  }
  if (selectedHandPiece === pieceText) {
    selectedHandPiece = null;
  } else {
    selectedHandPiece = pieceText;
  }
  renderHands();
}

// ===== 盤面の描画 =====
function renderBoard() {
  const boardElement = document.getElementById("shogi-board");
  boardElement.innerHTML = "";
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      if (selectedPosition && selectedPosition.x == col && selectedPosition.y == row) {
        cell.classList.add("selected");
      }
      cell.addEventListener("click", function() {
        handleCellClick(row, col, cell);
      });
      const pieceData = board[row][col];
      if (pieceData) {
        const pieceElem = document.createElement("div");
        pieceElem.classList.add("piece");
        pieceElem.textContent = pieceData.text;
        // 成香、成桂、成銀の場合、small-promoted クラスで縦書き表示と文字サイズ調整
        if (["成香", "成桂", "成銀"].includes(pieceData.text)) {
          pieceElem.classList.add("small-promoted");
        }
        if (promotedSymbols.includes(pieceData.text)) {
          pieceElem.classList.add("promoted");
        }
        if (pieceData.rotated) {
          pieceElem.classList.add("rotated");
        }
        cell.appendChild(pieceElem);
      }
      boardElement.appendChild(cell);
    }
  }
}

// ===== 持ち駒の描画 =====
function renderHands() {
  const topHandContainer = document.getElementById("top-hand");
  topHandContainer.innerHTML = "";
  const topGroups = {};
  topHand.forEach(piece => {
    const key = piece.text;
    topGroups[key] = (topGroups[key] || 0) + 1;
  });
  for (const [text, count] of Object.entries(topGroups)) {
    const pieceElem = document.createElement("div");
    pieceElem.classList.add("piece");
    pieceElem.textContent = text;
    if (["成香", "成桂", "成銀"].includes(text)) {
      pieceElem.classList.add("small-promoted");
    }
    if (promotedSymbols.includes(text)) {
      pieceElem.classList.add("promoted");
    }
    pieceElem.classList.add("rotated");
    if (currentTurn === "gote") {
      pieceElem.style.cursor = "pointer";
      pieceElem.addEventListener("click", function() {
        handleHandClick(text, topHandContainer);
      });
      if (selectedHandPiece === text) {
        pieceElem.classList.add("selected-hand");
      }
    }
    if (count > 1) {
      const countElem = document.createElement("span");
      countElem.classList.add("piece-count");
      countElem.textContent = "×" + count;
      pieceElem.appendChild(countElem);
    }
    topHandContainer.appendChild(pieceElem);
  }
  
  const bottomHandContainer = document.getElementById("bottom-hand");
  bottomHandContainer.innerHTML = "";
  const bottomGroups = {};
  bottomHand.forEach(piece => {
    const key = piece.text;
    bottomGroups[key] = (bottomGroups[key] || 0) + 1;
  });
  for (const [text, count] of Object.entries(bottomGroups)) {
    const pieceElem = document.createElement("div");
    pieceElem.classList.add("piece");
    pieceElem.textContent = text;
    if (["成香", "成桂", "成銀"].includes(text)) {
      pieceElem.classList.add("small-promoted");
    }
    if (promotedSymbols.includes(text)) {
      pieceElem.classList.add("promoted");
    }
    if (currentTurn === "sente") {
      pieceElem.style.cursor = "pointer";
      pieceElem.addEventListener("click", function() {
        handleHandClick(text, bottomHandContainer);
      });
      if (selectedHandPiece === text) {
        pieceElem.classList.add("selected-hand");
      }
    }
    if (count > 1) {
      const countElem = document.createElement("span");
      countElem.classList.add("piece-count");
      countElem.textContent = "×" + count;
      pieceElem.appendChild(countElem);
    }
    bottomHandContainer.appendChild(pieceElem);
  }
}

// ===== 初回描画 =====
renderBoard();
renderHands();
