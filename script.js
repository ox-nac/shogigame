/**
 * 将棋盤の初期配置
 *  - text    : 駒の文字
 *  - rotated : trueなら上側（180度回転表示）、falseなら下側
 *  - 盤上に駒がない場合は null
 */
const board = [
    [
      { text: "香", rotated: true }, { text: "桂", rotated: true }, { text: "銀", rotated: true }, { text: "金", rotated: true }, { text: "王", rotated: true }, { text: "金", rotated: true }, { text: "銀", rotated: true }, { text: "桂", rotated: true }, { text: "香", rotated: true }
    ],
    [
      null, { text: "飛", rotated: true }, null, null, null, null, null, { text: "角", rotated: true }, null
    ],
    [
      { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }, { text: "歩", rotated: true }
    ],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [
      { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }, { text: "歩", rotated: false }
    ],
    [
      null, { text: "角", rotated: false }, null, null, null, null, null, { text: "飛", rotated: false }, null
    ],
    [
      { text: "香", rotated: false }, { text: "桂", rotated: false }, { text: "銀", rotated: false }, { text: "金", rotated: false }, { text: "玉", rotated: false }, { text: "金", rotated: false }, { text: "銀", rotated: false }, { text: "桂", rotated: false }, { text: "香", rotated: false }
    ]
  ];
  
  let selectedPiece = null;        // 選択中の駒オブジェクト
  let selectedPosition = null;     // 選択中の駒の座標 { x, y }
  let currentTurn = "bottom";      // "bottom"（下側） or "top"（上側）
  
  // 追加: 持ち駒リスト
  let topHand = [];       // 上側プレイヤーの持ち駒
  let bottomHand = [];    // 下側プレイヤーの持ち駒
  
  const boardElement = document.getElementById("shogi-board");
  
  // 将棋盤を描画
  function renderBoard() {
    boardElement.innerHTML = "";
  
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;
  
        const pieceObj = board[y][x];
        if (pieceObj) {
          const piece = document.createElement("div");
          piece.classList.add("piece");
          piece.innerText = pieceObj.text;
          if (pieceObj.rotated) {
            piece.classList.add("rotated");
          }
          piece.onclick = () => selectPiece(x, y);
          cell.appendChild(piece);
        } else {
          // 空マスをクリックした場合
          cell.onclick = () => movePiece(x, y);
        }
  
        boardElement.appendChild(cell);
      }
    }
  }
  
  // 持ち駒を描画
  function renderHands() {
    // 上側の持ち駒エリアをクリア
    const topHandDiv = document.getElementById("top-hand");
    topHandDiv.innerHTML = "";
  
    // 下側の持ち駒エリアをクリア
    const bottomHandDiv = document.getElementById("bottom-hand");
    bottomHandDiv.innerHTML = "";
  
    // 上側の持ち駒を表示
    topHand.forEach(pieceObj => {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.innerText = pieceObj.text;
      if (pieceObj.rotated) {
        piece.classList.add("rotated");
      }
      topHandDiv.appendChild(piece);
    });
  
    // 下側の持ち駒を表示
    bottomHand.forEach(pieceObj => {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.innerText = pieceObj.text;
      // 下側の駒は rotated:false のはずですが、念のためチェック
      if (pieceObj.rotated) {
        piece.classList.add("rotated");
      }
      bottomHandDiv.appendChild(piece);
    });
  }
  
  // 駒を選択する関数
  function selectPiece(x, y) {
    const pieceObj = board[y][x];
    if (!pieceObj) return;
  
    // 自分の手番かどうかを判定
    const isTopTurn = (currentTurn === "top");
    const isPieceTopSide = pieceObj.rotated; // trueなら上側、falseなら下側
  
    // 手番と駒の向きが一致している場合のみ選択
    if (isTopTurn === isPieceTopSide) {
      selectedPiece = pieceObj;
      selectedPosition = { x, y };
    } else {
      // 違う場合は選択を解除
      selectedPiece = null;
      selectedPosition = null;
    }
  }
  
  // 駒を移動する関数
  function movePiece(x, y) {
    if (!selectedPiece) return;
  
    // もし移動先に「自分の駒」がある場合は移動できない（手番交代もなし）
    const destPiece = board[y][x];
    const isTopTurn = (currentTurn === "top");
  
    if (destPiece && destPiece.rotated === isTopTurn) {
      // 自分の駒があるマスには移動不可
      selectedPiece = null;
      selectedPosition = null;
      return;
    }
  
    // もし移動先に「相手の駒」があればキャプチャ（持ち駒にする）
    if (destPiece && destPiece.rotated !== isTopTurn) {
      // 相手の駒を取得
      const capturedPiece = destPiece;
      // キャプチャした駒の向きは「取った側」に合わせる
      capturedPiece.rotated = isTopTurn; 
      // 上側の手番なら topHand に追加、下側の手番なら bottomHand に追加
      if (isTopTurn) {
        topHand.push(capturedPiece);
      } else {
        bottomHand.push(capturedPiece);
      }
    }
  
    // 元の場所を空に
    board[selectedPosition.y][selectedPosition.x] = null;
  
    // 移動先に駒を配置
    board[y][x] = selectedPiece;
  
    // 選択解除
    selectedPiece = null;
    selectedPosition = null;
  
    // 手番を交代
    currentTurn = isTopTurn ? "bottom" : "top";
  
    // 再描画
    renderBoard();
    renderHands();
  }
  
  // ページ読み込み時に初期描画
  renderBoard();
  renderHands();
  