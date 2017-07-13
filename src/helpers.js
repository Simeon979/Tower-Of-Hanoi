// receive as argument the disc number and the pegs
// returns an object with a next function that returns two pegs
// to make a legal move between (https://en.wikipedia.org/wiki/Tower_of_Hanoi) (simple_iterative_solution)

const getPairToCompare = (discNumber, A, B, C) => {
  const evenPegPairs = [[A, B], [A, C], [B, C]];
  const oddPegPairs = [[A, C], [A, B], [B, C]];

  const pairs = discNumber % 2 === 0 ? evenPegPairs : oddPegPairs;

  // keeps track of the pair supplied
  let count = -1;

  return {
    next() {
      count += 1;

      return pairs[count % 3]; // ensure we get 0, 1 or 2
    }
  };
};

// make a legal move according to the rules (mutate the two array)
function compareAndMove(first, second) {
  if (!second[0]) second.push(first.pop());
  else if (!first[0]) first.push(second.pop());
  else {
    if (first[first.length - 1] > second[second.length - 1])
      first.push(second.pop());
    else second.push(first.pop());
  }
}

export { getPairToCompare, compareAndMove };
