/**
 * 将棋盤の初期配置
 * - text: 駒の文字
 * - rotated: trueなら上側（後手）、falseなら下側（先手）
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

// 選択中の駒とその座標を保持する変数
let selectedPiece = null;
let selectedPosition = null;
// 現在の手番。初手は先手（下側）なので "bottom"
let currentTurn = "bottom";

// 持ち駒リスト
// topHand: 後手が取った駒（#top-hand に表示）
// bottomHand: 先手が取った駒（#bottom-hand に表示）
let topHand = [];
let bottomHand = [];

// 将棋盤のHTML要素を取得
const boardElement = document.getElementById("shogi-board");

/**
 * renderBoard()
 * 盤面を生成して描画します。
 */
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

/**
 * renderHands()
 * 持ち駒（捕獲した駒）をグループ化して描画します。
 * 同じ駒が複数捕獲されている場合、1つのアイコンに「×n」と表示します。
 */
function renderHands() {
  // 後手持ち駒エリア (#top-hand)
  const topHandDiv = document.getElementById("top-hand");
  topHandDiv.innerHTML = "";
  let groupTop = {};
  topHand.forEach(pieceObj => {
    let key = pieceObj.text + "_" + pieceObj.rotated;
    if (groupTop[key]) {
      groupTop[key].count += 1;
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
  
  // 先手持ち駒エリア (#bottom-hand)
  const bottomHandDiv = document.getElementById("bottom-hand");
  bottomHandDiv.innerHTML = "";
  let groupBottom = {};
  bottomHand.forEach(pieceObj => {
    let key = pieceObj.text + "_" + pieceObj.rotated;
    if (groupBottom[key]) {
      groupBottom[key].count += 1;
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

/**
 * selectPiece(x, y)
 * 指定されたセルの駒を選択状態にします。
 * 手番と駒の向きが一致している場合のみ選択可能です。
 */
function selectPiece(x, y) {
  const pieceObj = board[y][x];
  if (!pieceObj) return;
  const isTopTurn = (currentTurn === "top");
  const isPieceTopSide = pieceObj.rotated;
  if (isTopTurn === isPieceTopSide) {
    selectedPiece = pieceObj;
    selectedPosition = { x, y };
  } else {
    selectedPiece = null;
    selectedPosition = null;
  }
}

/**
 * movePiece(x, y)
 * 選択中の駒を指定されたセルへ移動します。
 * ・移動先に自分の駒があれば無効。
 * ・移動先に敵の駒があれば捕獲して持ち駒リストに追加。
 * ・移動後、手番を交代し盤面と持ち駒エリアを再描画します。
 */
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

// 初期描画
renderBoard();
renderHands();
