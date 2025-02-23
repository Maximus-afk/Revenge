import { Card, PlayerState, PlayerBoard } from './types';

// Card Playing Rules
export function canPlayCardToCommonPile(card: Card, pile: Card[]): boolean {
  if (card.isJoker) return false;
  if (pile.length === 0) return card.rank === 1;
  return card.rank === pile[pile.length - 1].rank + 1;
}

export function canPlayCardToBoard(board: PlayerBoard, column: number): boolean {
  if (column < 0 || column >= board.maxColumns) return false;
  return board.columns[column].length < board.maxRows;
}

export function canPlayFromBoard(board: PlayerBoard, columnIndex: number, rowIndex: number): boolean {
  const column = board.columns[columnIndex];
  // Can only play the top-most card of each column
  return rowIndex === column.length - 1;
}

export function mustPlayAce(hand: Card[]): number {
  return hand.findIndex(card => !card.isJoker && card.rank === 1);
}

export function canEndTurn(playerState: PlayerState): boolean {
  // Player must place a card on their board unless all columns are full
  const allColumnsFull = playerState.board.columns.every(
    column => column.length >= playerState.board.maxRows
  );
  
  if (allColumnsFull) return true;
  
  // Check if player has any cards in hand
  return playerState.hand.length > 0;
}

// Win Condition
export function checkWinCondition(playerState: PlayerState): boolean {
  // Player wins if their pile27 is empty
  return playerState.pile27.length === 0;
}

// Pile Management
export function shouldReshuffleCompletedPile(pile: Card[]): boolean {
  if (pile.length === 0) return false;
  return pile[pile.length - 1].rank === 13;
}

export function getValidCommonPileMoves(card: Card, commonPiles: Card[][]): number[] {
  return commonPiles.reduce<number[]>((validPiles, pile, index) => {
    if (canPlayCardToCommonPile(card, pile)) {
      validPiles.push(index);
    }
    return validPiles;
  }, []);
}

// Board Management
export function getValidBoardColumns(card: Card, board: PlayerBoard): number[] {
  return board.columns.reduce<number[]>((validColumns, column, index) => {
    if (canPlayCardToBoard(board, index)) {
      validColumns.push(index);
    }
    return validColumns;
  }, []);
}

// Turn Management
export function getInitialTurn(player1Pile: Card[], player2Pile: Card[]): number {
  const p1TopCard = player1Pile[player1Pile.length - 1];
  const p2TopCard = player2Pile[player2Pile.length - 1];
  
  if (p1TopCard.isJoker) return 1;
  if (p2TopCard.isJoker) return 0;
  
  return p1TopCard.rank <= p2TopCard.rank ? 0 : 1;
}

// Validation Helpers
export function isValidMove(
  card: Card,
  source: 'hand' | 'board' | 'pile',
  destination: 'common' | 'board',
  playerState: PlayerState,
  commonPiles: Card[][],
  pileIndex?: number,
  column?: number
): boolean {
  // Check source validity
  switch (source) {
    case 'hand':
      if (!playerState.hand.includes(card)) return false;
      break;
    case 'board':
      // Verify card is playable from board
      break;
    case 'pile':
      if (playerState.topPileCard !== card) return false;
      break;
  }

  // Check destination validity
  switch (destination) {
    case 'common':
      if (pileIndex === undefined) return false;
      return canPlayCardToCommonPile(card, commonPiles[pileIndex]);
    case 'board':
      if (column === undefined) return false;
      return canPlayCardToBoard(playerState.board, column);
  }

  return false;
} 