import { Card, Suit, Rank } from './types';
import { nanoid } from 'nanoid'; // Using nanoid instead of uuid for smaller bundle size

export function createDeck(includeJokers: boolean = false): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ 
        suit, 
        rank,
        id: nanoid()
      });
    }
  }
  
  if (includeJokers) {
    deck.push({ isJoker: true, rank: 14 as Rank, suit: 'hearts', id: nanoid() });
    deck.push({ isJoker: true, rank: 14 as Rank, suit: 'hearts', id: nanoid() });
  }
  
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function createStartingPiles(): [Card[], Card[]] {
  const deck = createDeck(false); // Create deck without jokers first
  
  // Create two jokers for personal piles
  const personalPileJokers: Card[] = [
    { suit: 'joker', rank: 0, id: nanoid(), isJoker: true },
    { suit: 'joker', rank: 0, id: nanoid(), isJoker: true }
  ];

  // Shuffle deck and split into two piles of 13 cards each
  const shuffledDeck = shuffleDeck(deck);
  const pile1First = shuffledDeck.slice(0, 13);
  const pile1Second = shuffledDeck.slice(13, 26);
  const pile2First = shuffledDeck.slice(26, 39);
  const pile2Second = shuffledDeck.slice(39, 52);

  // Insert jokers in the middle of each pile
  const pile1 = [...pile1First, personalPileJokers[0], ...pile1Second];
  const pile2 = [...pile2First, personalPileJokers[1], ...pile2Second];

  return [pile1, pile2];
}

export const createGameDecks = () => {
  const createSingleDeck = (isMainDeck: boolean): Card[] => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const deck: Card[] = [];

    // Add regular cards
    for (const suit of suits) {
      for (let value = 1; value <= 13; value++) {
        deck.push({
          suit,
          value,
          id: nanoid()
        });
      }
    }

    // Add jokers if it's the main deck
    if (isMainDeck) {
      deck.push({ suit: 'hearts', value: 0, id: nanoid(), isJoker: true });
      deck.push({ suit: 'hearts', value: 0, id: nanoid(), isJoker: true });
    }

    return deck;
  };

  // Create pile27s (the 27-card piles)
  const createPile27 = (): Card[] => {
    const deck = createSingleDeck(false);
    const joker = { suit: 'hearts', value: 0, id: nanoid(), isJoker: true };
    
    // Split into 4 piles of 13
    const pile = deck.slice(0, 26);
    pile.push(joker);
    return pile;
  };

  return {
    mainDeck: shuffleDeck(createSingleDeck(true)),
    pile27Player1: createPile27(),
    pile27Player2: createPile27()
  };
};

export const dealInitialHands = (deck: Card[]): {
  hands: [Card[], Card[]],
  remainingDeck: Card[]
} => {
  const remainingDeck = [...deck];
  const hands: [Card[], Card[]] = [[], []];
  
  // Deal 6 cards to each player
  for (let i = 0; i < 6; i++) {
    hands[0].push(remainingDeck.pop()!);
    hands[1].push(remainingDeck.pop()!);
  }

  return { hands, remainingDeck };
}; 