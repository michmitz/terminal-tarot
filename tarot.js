#!/usr/bin/env node

const readline = require('readline');

const majorArcana = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const suits = {
  Wands: ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"],
  Cups: ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"],
  Swords: ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"],
  Pentacles: ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"]
};

function getDeck() {
  const deck = [...majorArcana];
  for (const suit in suits) {
    suits[suit].forEach(rank => deck.push(`${rank} of ${suit}`));
  }
  return deck;
}

function drawCards(deck, num, allowReversals) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, num);
  return drawn.map(card =>
    allowReversals && Math.random() < 0.5 ? `${card} (Reversed)` : card
  );
}

function runTarotApp() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Choose a spread: single, three, five, or celtic cross: ", (spreadType) => {
    rl.question("Allow reversals? (yes/no): ", (reversalsInput) => {
      const allowReversals = reversalsInput.toLowerCase() === "yes";

      const spreadSizes = {
        single: 1,
        three: 3,
        five: 5,
        celtic: 10
      };

      const spreadSize = spreadSizes[spreadType.toLowerCase()];
      if (!spreadSize) {
        console.log("Invalid spread type.");
        rl.close();
        return;
      }

      const deck = getDeck();
      const cards = drawCards(deck, spreadSize, allowReversals);

      console.log("\nYour cards:");
      cards.forEach((card, index) => {
        console.log(`${index + 1}. ${card}`);
      });

      rl.close();
    });
  });
}

runTarotApp();
