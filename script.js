// ===== グローバル変数 =====
let currentTurn = "sente"; // 初期は先手（sente: rotated=false）
let selectedPiece = null;
let selectedPosition = null;
let selectedHandPiece = null; // 持ち駒ドロップ用に選択中の駒（文字）
let topHand = [];    // 後手側が捕獲した駒（rotated:true）
let bottomHand = []; // 先手側が捕獲した駒（rotated:false）
let gameOver = false; // ゲーム終了フラグ

// タイマー（各10分＝600秒）
let senteTime = 600;
let goteTime = 600;
let timerInterval = null; // 振り駒後に開始する
let gameStarted = false;  // 振り駒完了後にtrue

// 振りごま結果で「と」が3つ以上の場合、UI全体を上下反転するためのフラグ
let flipped = false;

// --- カスタムアラート関数 ---
function customAlert(message, isGote) {
  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '50%';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translate(-50%, -50%)' + (isGote ? ' rotate(180deg)' : '');
  alertDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  alertDiv.style.color = '#fff';
  alertDiv.style.padding = '20px';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.zIndex = 10000;
  document.body.appendChild(alertDiv);
  setTimeout(() => {
    document.body.removeChild(alertDiv);
  }, 2000);
}

// --- カスタム勝利アラート関数 ---
function customVictoryAlert(message, isGote) {
  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '50%';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translate(-50%, -50%)' + (isGote ? ' rotate(180deg)' : '');
  alertDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  alertDiv.style.color = '#fff';
  alertDiv.style.padding = '20px';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.zIndex = 10000;
  document.body.appendChild(alertDiv);
  setTimeout(() => {
    document.body.removeChild(alertDiv);
  }, 2000);
}

// --- 警告音を鳴らす関数 ---
function playWarningSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  oscillator.frequency.value = 1000;
  oscillator.connect(ctx.destination);
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    ctx.close();
  }, 300);
}

// --- タイマー更新処理 ---
function timerTick() {
  if (gameOver) return;
  if (currentTurn === "sente") {
    senteTime--;
    if (senteTime <= 0) {
      gameOver = true;
      customVictoryAlert("あなたの勝ちです", true);
      renderTimers();
      return;
    }
    if (senteTime < 60) {
      playWarningSound();
    }
  } else if (currentTurn === "gote") {
    goteTime--;
    if (goteTime <= 0) {
      gameOver = true;
      customVictoryAlert("あなたの勝ちです", false);
      renderTimers();
      return;
    }
    if (goteTime < 60) {
      playWarningSound();
    }
  }
  renderTimers();
}

function renderTimers() {
  const senteTimerElem = document.getElementById("sente-timer");
  const goteTimerElem = document.getElementById("gote-timer");
  senteTimerElem.textContent = formatTime(senteTime);
  goteTimerElem.textContent = formatTime(goteTime);
  if (senteTime < 180) {
    senteTimerElem.classList.add("red");
  } else {
    senteTimerElem.classList.remove("red");
  }
  if (goteTime < 180) {
    goteTimerElem.classList.add("red");
  } else {
    goteTimerElem.classList.remove("red");
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m.toString() + ":" + s.toString().padStart(2, "0");
}

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
  "桂": [[-1, -2], [1, -2]],
  "銀": [[0, -1], [-1, -1], [1, -1], [-1, 1], [1, 1]],
  "金": [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0], [0, 1]],
  "玉": [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [-1, 1], [1, 1]],
  "飛": [...Array(8).keys()].flatMap(i => [[0, -(i + 1)], [0, i + 1], [-(i + 1), 0], [i + 1, 0]]),
  "角": [...Array(8).keys()].flatMap(i => [[-(i + 1), -(i + 1)], [i + 1, i + 1], [-(i + 1), i + 1], [i + 1, -(i + 1)]])
};

pieceMoves["と"] = pieceMoves["金"];
pieceMoves["成香"] = pieceMoves["金"];
pieceMoves["成桂"] = pieceMoves["金"];
pieceMoves["成銀"] = pieceMoves["金"];
pieceMoves["馬"] = pieceMoves["角"].concat([[0, -1], [0, 1], [-1, 0], [1, 0]]);
pieceMoves["龍"] = pieceMoves["飛"].concat([[-1, -1], [-1, 1], [1, -1], [1, 1]]);

const promotionMap = {
  "歩": "と",
  "香": "成香",
  "桂": "成桂",
  "銀": "成銀",
  "角": "馬",
  "飛": "龍"
};
const promotedSymbols = Object.values(promotionMap);
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
  if (moves.some(([mx, my]) => mx === dx && my === dy)) {
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

function shouldPromote(piece, toY) {
  if (!promotionMap.hasOwnProperty(piece.text)) return false;
  if (promotedSymbols.includes(piece.text)) return false;
  if (piece.fromDrop) return true;
  if (!piece.rotated && toY < 3) return true;
  if (piece.rotated && toY > 5) return true;
  return false;
}

function promotePiece(piece) {
  return promotionMap[piece.text] || piece.text;
}

function dropHandPiece(x, y) {
  if (board[y][x]) {
    selectedHandPiece = null;
    renderBoard();
    renderHands();
    return;
  }
  if (currentTurn === "sente") {
    if (selectedHandPiece === "歩" || selectedHandPiece === "香") {
      if (y === 0) {
        customAlert("歩・香は相手の一段目には置けません。", currentTurn === "gote");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
    if (selectedHandPiece === "桂") {
      if (y <= 1) {
        customAlert("桂は相手の一段目、二段目には置けません。", currentTurn === "gote");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
  } else {
    if (selectedHandPiece === "歩" || selectedHandPiece === "香") {
      if (y === 8) {
        customAlert("歩・香は相手の一段目には置けません。", currentTurn === "gote");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
    if (selectedHandPiece === "桂") {
      if (y >= 7) {
        customAlert("桂は相手の一段目、二段目には置けません。", currentTurn === "gote");
        selectedHandPiece = null;
        renderHands();
        return;
      }
    }
  }
  
  let handArray;
  if (currentTurn === "sente") {
    handArray = bottomHand;
  } else {
    handArray = topHand;
  }
  const index = handArray.findIndex(piece => piece.text === selectedHandPiece);
  if (index === -1) return;
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
    if (capturedPiece.text === "玉") {
      customVictoryAlert("あなたの勝ちです", currentTurn === "gote");
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
      board[fromY][fromX] = null;
      board[y][x] = selectedPiece;
      selectedPiece = null;
      selectedPosition = null;
      gameOver = true;
      renderBoard();
      renderHands();
      return;
    }
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

function handleCellClick(row, col, cell) {
  if (gameOver) return;
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

// ===== 振り駒処理 =====

// 振り駒用の駒を5つ横並びで表示
function renderFurikoma() {
  const furikomaPiecesContainer = document.getElementById("furikoma-pieces");
  furikomaPiecesContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const pieceElem = document.createElement("div");
    pieceElem.classList.add("piece");
    pieceElem.textContent = "歩";
    furikomaPiecesContainer.appendChild(pieceElem);
  }
}

// 「振る」ボタン押下時の処理：各駒をランダムに「歩」または「と」に変化
function tossFurikoma() {
  const furikomaPiecesContainer = document.getElementById("furikoma-pieces");
  const pieceElems = furikomaPiecesContainer.querySelectorAll(".piece");
  let countFu = 0;
  let countTo = 0;
  pieceElems.forEach(pieceElem => {
    if (Math.random() < 0.5) {
      pieceElem.textContent = "歩";
      pieceElem.classList.remove("promoted");
      countFu++;
    } else {
      pieceElem.textContent = "と";
      pieceElem.classList.add("promoted");
      countTo++;
    }
  });
  // 全て「と」が3つ以上の場合は、データはそのままでUI全体を反転
  if (countTo >= 3) {
    flipped = true;
  }
  // 数秒後に振り駒画面を閉じてゲームスタート
  setTimeout(startGame, 2000);
}

// 振り駒完了後、振り駒UIを非表示にして盤面・持ち駒、タイマーを表示し、タイマーを開始
function startGame() {
  document.getElementById("header").style.display = "none";
  document.getElementById("furikoma-container").style.display = "none";
  document.getElementById("board-container").style.display = "block";
  // 反転フラグがtrueの場合、#game-wrapperに"flipped"クラスを追加（座標調整はCSS変数で可能）
  if (flipped) {
    document.getElementById("game-wrapper").classList.add("flipped");
  }
  gameStarted = true;
  renderBoard();
  renderHands();
  renderTimers();
  timerInterval = setInterval(timerTick, 1000);
}

// 振り駒用ボタンにイベントを設定
document.getElementById("toss-button").addEventListener("click", tossFurikoma);

// 初回表示時に振り駒UIをレンダリング
renderFurikoma();
