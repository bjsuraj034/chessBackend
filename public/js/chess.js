const socket=io();
const chess=new Chess();
const boardElement=document.querySelector(".chessboard")


let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
    const board=chess.board();
    // console.log(board)
    boardElement.innerHTML=""
    board.forEach((row,rowIndex)=>{
        row.forEach((square,squareindex)=>{
            const squareElement=document.createElement("div")
            squareElement.classList.add(
                "square",
                (rowIndex+squareindex)%2 ===0 ? "light" :"dark"
            )
            squareElement.dataset.row=rowIndex;
            squareElement.dataset.col=squareindex;

            if(square)
            {
                const   pieceElement=document.createElement("div");
                pieceElement.classList.add("piece",square.color==="w" ? "white" :"black");
                pieceElement.innerText=getPieces(square)
                pieceElement.draggable=playerRole===square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareindex };
                        e.dataTransfer.setData("text/plain", ""); 
                    }
                });
                
                pieceElement.addEventListener("dragend",(e)=>{draggedPiece=null
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement)
            }
            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            })
            squareElement.addEventListener("drop",function(e){
                e.preventDefault();

                if(draggedPiece)
                {
                    const targetSource={
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    }
                    handleMove(sourceSquare,targetSource)
                }
            })
            boardElement.appendChild(squareElement)

        })
        
    })
    if(playerRole==='b')
    {
        boardElement.classList.add("flipped")
    }
    else{

        boardElement.classList.remove("flipped")
    }
}

const getPieces=(piece)=>{

     const unicodePieces={
        p:"♙",
        r:"♜",
        n:"♞",
        b:"♝",
        q:"♛",
        k:"♚",
        P:"♙",
        R:"♖",
        N:"♘",
        B:"♗",
        Q:"♕",
        K:"♚"  
    }
    return unicodePieces[piece.type] || "";
}

const handleMove=(source,target)=>{
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q" // Always promote to queen for now
    };    
    socket.emit("move",move)
}

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard()
})
socket.on("spectatorRole",function(){
    playerRole=null;
    renderBoard()
})
socket.on("boardState",function(fen)
{
    chess.load(fen)
    renderBoard();

})

renderBoard()