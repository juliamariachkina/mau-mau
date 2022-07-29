export type Rank = "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type Suit = "spade" | "diamond" | "club" | "heart";

export const RANKS: Rank[] = ["7", "8", "9", "10", "J", "Q", "K", "A"];
export const SUITS: Suit[] = ["spade", "diamond", "club", "heart"];

export interface Card {
    suit: Suit,
    rank: Rank,
}

export const deck: Card[] = [];
for (const suit of <Suit[]>["spade", "diamond", "club", "heart"]) {
    for (const rank of <Rank[]>["7", "8", "9", "10", "J", "Q", "K", "A"]) {
        deck.push({ suit, rank });
    }
}