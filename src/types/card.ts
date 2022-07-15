export type Rank = "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type Suit = "spade" | "diamond" | "club" | "heart";

export interface Card {
    suit: Suit,
    rank: Rank
}