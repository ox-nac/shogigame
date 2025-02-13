/**
 * 将棋盤の初期配置
 *  - text    : 駒の文字
 *  - rotated : trueなら上側（後手）、falseなら下側（先手）
 *  - 盤上に駒がない場合は null
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
  
  // 選択中の駒オブジェクトと座標
  let selectedPiece = null;
  let selectedPosition = null;
  // 初手は先手（下側）から
  let currentTurn = "bottom";
  
  // 持ち駒リスト
  let topHand = [];       // 後手（上側）の持ち駒
  let bottomHand = [];    // 先手（下側）の持ち駒
  
  const boardElement = document.getElementById("shogi-board");
  
  // 将棋盤を描画
  function renderBoard() {
    boardElement.innerHTML = "";
  
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
  
        // セル全体にクリックイベント
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
  
  // 持ち駒を描画
  function renderHands() {
    // 後手の持ち駒（左側）
    const topHandDiv = document.getElementById("top-hand");
    topHandDiv.innerHTML = "";
    topHand.forEach(pieceObj => {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.innerText = pieceObj.text;
      if (pieceObj.rotated) {
        piece.classList.add("rotated");
      }
      topHandDiv.appendChild(piece);
    });
  
    // 先手の持ち駒（盤の右側）
    const bottomHandDiv = document.getElementById("bottom-hand");
    bottomHandDiv.innerHTML = "";
    bottomHand.forEach(pieceObj => {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.innerText = pieceObj.text;
      if (pieceObj.rotated) {
        piece.classList.add("rotated");
      }
      bottomHandDiv.appendChild(piece);
    });
  }
  
  // 駒を選択する
  function selectPiece(x, y) {
    const pieceObj = board[y][x];
    if (!pieceObj) return;
  
    // 手番判定
    const isTopTurn = (currentTurn === "top");
    const isPieceTopSide = pieceObj.rotated; // true=後手, false=先手
  
    // 手番と駒の向きが一致する駒のみ選択
    if (isTopTurn === isPieceTopSide) {
      selectedPiece = pieceObj;
      selectedPosition = { x, y };
    } else {
      selectedPiece = null;
      selectedPosition = null;
    }
  }
  
  // 駒を移動する
  function movePiece(x, y) {
    if (!selectedPiece) return;
  
    const destPiece = board[y][x];
    const isTopTurn = (currentTurn === "top");
  
    // 自分の駒があるマスには移動不可
    if (destPiece && destPiece.rotated === isTopTurn) {
      selectedPiece = null;
      selectedPosition = null;
      return;
    }
  
    // 敵駒をキャプチャ
    if (destPiece && destPiece.rotated !== isTopTurn) {
      const capturedPiece = destPiece;
      // 取った側に合わせて回転フラグを更新
      capturedPiece.rotated = isTopTurn;
      if (isTopTurn) {
        topHand.push(capturedPiece);
      } else {
        bottomHand.push(capturedPiece);
      }
    }
  
    // 移動
    board[selectedPosition.y][selectedPosition.x] = null;
    board[y][x] = selectedPiece;
  
    // 選択解除
    selectedPiece = null;
    selectedPosition = null;
  
    // 手番交代
    currentTurn = isTopTurn ? "bottom" : "top";
  
    renderBoard();
    renderHands();
  }
  
  // 初期描画
  renderBoard();
  renderHands();
