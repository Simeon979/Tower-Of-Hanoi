import React, { Component } from "react";
import { Button, Input, Message } from "semantic-ui-react";
import { getPairToCompare, compareAndMove } from "./helpers";
import heart from "./heart.svg";
import "./App.css";

const COLORS = [
  "#400080",
  "#0080c0",
  "#3fc837",
  "#400040",
  "#ff80ff",
  "#a8ef8f",
  "#e6c75b",
  "#5575aa",
  "#a0dd22",
  "#800000",
  "#ff8000"
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      totalDisc: 6,
      pegs: []
    };

    this.onStartClick = this.onStartClick.bind(this);
    this.onPauseClick = this.onPauseClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    this.resetPeg();
  }

  resetPeg() {
    // Populate first peg array from numbers 1 to total disc
    const pegA = Array.from(
      { length: this.state.totalDisc },
      (_, i) => i + 1
    ).reverse();
    const pegB = [];
    const pegC = [];
    const pegs = [pegA, pegB, pegC];
    this.setState(prevState => ({ ...prevState, pegs }), this.init);
  }

  init() {
    const { totalDisc, pegs } = this.state;
    // copy so we can mutate first before setting the state
    const first = [...pegs[0]];
    const second = [...pegs[1]];
    const third = [...pegs[2]];

    this.mutablePegState = [first, second, third];
    this.pairSequence = getPairToCompare(totalDisc, first, second, third);
    this.numMoves = Math.pow(2, totalDisc) - 1;
    this.movesTaken = 0;
  }

  advance() {
    this.movesTaken++;

    let [A, B] = this.pairSequence.next();
    compareAndMove(A, B);
    this.setState(
      prevState => {
        return {
          ...prevState,
          pegs: this.mutablePegState
        };
      },
      () => {
        if (this.movesTaken >= this.numMoves) this.onFinish();
      }
    );
  }

  onStartClick() {
    this.setState(prevState => ({ ...prevState, isPlaying: true }), this.start);
  }

  start() {
    if (!this.pairSequence) {
      // if start a new game (not resuming a paused one)
      this.resetPeg();
    }

    this.startAnimation();
  }

  onPauseClick() {
    this.terminate("pause");
  }

  onResetClick() {
    this.terminate("reset");
  }

  onFinish() {
    this.terminate("finish");
  }

  terminate(level) {
    // for every level of termination
    this.stopAnimation();
    this.setState(prevState => ({ ...prevState, isPlaying: false }));

    if (level !== "pause") {
      // for finish and reset
      this.pairSequence = null;
      if (level === "reset") {
        // for reset only
        this.movesTaken = 0;
        this.resetPeg();
      }
    }
  }

  onInputChange(event) {
    this.stopAnimation();
    this.pairSequence = null;
    const value = parseInt(event.target.value, 10);

    this.setState(
      prevState => ({
        ...prevState,
        isPlaying: false,
        totalDisc: value
      }),
      this.resetPeg
    );
  }
  startAnimation() {
    this.timeInterval = setInterval(() => {
      this.advance();
    }, 700);
  }

  stopAnimation() {
    clearInterval(this.timeInterval);
  }

  render() {
    const { pegs, totalDisc, isPlaying } = this.state;
    return (
      <div className="container">
        <Message
          className="number-of-moves"
          style={{
            margin: "100px 0 20px"
          }}
        >
          <p> Moved: {this.movesTaken || 0} </p>
          <p>Input any number of disc between 5 and 10 to begin</p>
        </Message>
        <PegList pegs={pegs} totalDisc={totalDisc} />
        <Controls
          onStartClick={this.onStartClick}
          onPauseClick={this.onPauseClick}
          onResetClick={this.onResetClick}
          onInputChange={this.onInputChange}
          totalDisc={totalDisc}
          isPlaying={isPlaying}
        />
        <div className="footer">
          With
          {" "}
          <img src={heart} alt="love" />
          {" "}
          from
          {" "}
          <a href="https://simeon979.github.io">Simeon</a>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);
  }
}

class PegList extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const { totalDisc } = nextProps;
    if (isNaN(totalDisc) || totalDisc < 5 || totalDisc > 10) return false;
    return true;
  }

  render() {
    const { pegs, totalDisc } = this.props;
    let keys = 0;

    const pegList = pegs.map(peg => (
      <Peg key={keys++} discArrangement={peg} totalDisc={totalDisc} />
    ));

    return <div className="peg-container"> {pegList} </div>;
  }
}

const Peg = ({ discArrangement, totalDisc }) => {
  const discs = discArrangement.map(disc => (
    <Disc key={disc} disc={disc} totalDisc={totalDisc} />
  ));
  return <div className="peg"> {discs} </div>;
};

const Disc = ({ disc, totalDisc }) => {
  // Calculate the height and width of each disc
  // according to the disc's number and the total number of discs
  const height = 1 / totalDisc * 100 - 1;
  const width = disc / totalDisc * 100 - 3;
  return (
    <div
      className="disc"
      style={{
        width: `${width}%`,
        height: `${height}%`,
        backgroundColor: COLORS[disc % 11]
      }}
    />
  );
};

const Controls = ({
  onStartClick,
  onPauseClick,
  onResetClick,
  onInputChange,
  totalDisc,
  isPlaying
}) => (
  <div className="controls">

    <Input
      type="number"
      onChange={onInputChange}
      value={totalDisc}
      disabled={isPlaying}
      className="control-input"
    />
    <div className="button-container">
      <Button
        disabled={isNaN(totalDisc) || totalDisc < 5 || totalDisc > 10}
        onClick={isPlaying ? onPauseClick : onStartClick}
        color={isPlaying ? "yellow" : "blue"}
        className="control-button"
      >
        {isPlaying ? "Pause" : "Start"}
      </Button>

      <Button
        disabled={isNaN(totalDisc) || totalDisc < 5 || totalDisc > 10}
        onClick={onResetClick}
        color="orange"
        className="control-button"
      >
        Reset
      </Button>
    </div>
  </div>
);

export default App;
