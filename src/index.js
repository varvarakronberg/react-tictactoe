import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  let className = 'square';
  if (props.isHighlighted) {
    className += ' highlight';
  }
  return (
    <button
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, winCells) {
    let isHighlighted = false;
    if (winCells) {
      isHighlighted = winCells.includes(i)
    }
    return <Square
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      isHighlighted={isHighlighted}
    />;
  }

  renderRow(i, winCells) {
    const row = [];
    for (let k = 0; k < 3; k++) {
      row.push(this.renderSquare(3 * i + k, winCells));
    };
    return row;
  };

  renderBoard(winCells) {
    const board = [];
    for (let k = 0; k < 3; k++) {
      board.push(<div key={k} className="row">{this.renderRow(k, winCells)}</div>);
    };
    return board;
  }

  render() {
    return (
      <div>
        {this.renderBoard(this.props.winCells)}
      </div>

    );
  }
}

function Toggle(props) {
  return (
    <button onClick={props.onClick}>
      {props.isToggleDesc ? 'DESC' : 'ASC'}
    </button>
  );
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      isOrderDesc: false
    }
  };


  handleClick(i) {
    console.log(i);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const [winner, winCells] = calculateWinner(squares)
    if (winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        move: { col: i % 3, row: Math.floor(i / 3) },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  };


  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  onSortToggleClick() {
    this.setState({ isOrderDesc: !this.state.isOrderDesc });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [winner, winCells] = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + `, (col:${step.move.col}, row:${step.move.row})` :
        'Go to game start';
      return (
        <li key={move}>
          <button style={this.state.stepNumber === move ? { fontWeight: 'bold' } : { fontWeight: 'normal' }} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    });
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber > 8 && winner === null) {
      status = "It's a draw"
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }


    if (this.state.isOrderDesc) {
      moves = moves.reverse()
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winCells={winCells}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol reversed={this.state.isOrderDesc}>{moves}</ol>
          <div>
            <Toggle onClick={() => this.onSortToggleClick()} isToggleDesc={this.state.isOrderDesc} />
          </div>
        </div>
      </div>
    );
  }
}


// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));


// helper function to calculate the winner line from a one dimensional array of all the lines arrays:
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]]
    }
  }
  return [null, null];
}