#!/usr/bin/env node
import chalk from "chalk";
import terminalImage from "terminal-image";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import inquirer from "inquirer";
import { majorArcana, suits, cardToImage } from "./data/cardData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getDeck() {
  const deck = [...majorArcana];
  for (const suit in suits) {
    suits[suit].forEach((rank) => deck.push(`${rank} of ${suit}`));
  }
  return deck;
}

function drawCards(deck, num, allowReversals) {
  let finalDeck;

  if (allowReversals) {
    const reversalCount = Math.floor((deck.length / 2) * Math.random());
    console.log("reversalCount", reversalCount);
    const indices = [...Array(deck.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, reversalCount);

    finalDeck = deck.map((card, i) =>
      indices.includes(i) ? `${card} (Reversed)` : card
    );
  } else {
    finalDeck = [...deck];
  }

  const shuffled = [...finalDeck].sort(() => Math.random() - 0.5);
  console.log("shuffled", shuffled);
  return shuffled.slice(0, num);
}

async function displayCardImage(cardName) {
  try {
    const baseCardName = cardName.replace(" (Reversed)", "");
    const isReversed = cardName.includes(" (Reversed)");
    const imageFile = cardToImage[baseCardName];

    if (imageFile) {
      const imagePath = join(__dirname, "card-images", imageFile);

      if (fs.existsSync(imagePath)) {
        try {
          const isIterm = process.env.TERM_PROGRAM === "iTerm.app";

          let image;
          try {
            if (isIterm) {
              image = await terminalImage.file(imagePath, {
                width: "20ch",
                height: "13ch",
                preserveAspectRatio: true,
              });
            } else {
              image = await terminalImage.file(imagePath, {
                height: 13,
              });
            }
          } catch (displayError) {
            console.log(
              chalk.yellow(
                `Primary display failed for ${imageFile}, trying fallback...`
              )
            );

            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          console.log(image);

          // Force terminal buffer flush to prevent display artifacts
          process.stdout.write(""); // Force flush
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (imgError) {
          console.log(
            chalk.red(
              `Image processing error for ${imageFile}: ${imgError.message}`
            )
          );
          const cardDisplay = `
┌─────────────┐
|             |
|             |
|             |
│             │
│             │
│             │
│             │
└─────────────┘`;

          console.log(cardDisplay);
          if (isReversed) {
            console.log(chalk.yellow("(Card is reversed)"));
          }
        }
      } else {
        console.log(chalk.red(`(image not found: ${imageFile})`));
      }
    } else {
      console.log(chalk.red(`(no image mapping found)`));
    }
  } catch (error) {
    console.log(chalk.red(`(error displaying image: ${error.message})`));
  }
}

async function runTarotApp() {
  console.log(chalk.green("🔮 Tarot Card Spreads 🔮\n"));

  try {
    // Spread selection
    const spreadAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "spreadType",
        message: "Choose a spread:",
        choices: [
          { name: "Single Card", value: "single" },
          { name: "Three Card Spread", value: "three" },
          { name: "Five Card Spread", value: "five" },
          { name: "Celtic Cross (Ten Cards)", value: "ten" },
        ],
      },
    ]);

    const spreadSizes = {
      single: 1,
      three: 3,
      five: 5,
      ten: 10,
    };

    const spreadSize = spreadSizes[spreadAnswer.spreadType];

    // Reversals selection
    const reversalsAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "allowReversals",
        message: "Allow reversals?",
        default: true,
      },
    ]);

    // Question input
    const questionAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "tarotPrompt",
        message: "What question would you like to ask?",
        validate: (input) => {
          if (input.trim().length === 0) {
            return "Please enter a question.";
          }
          return true;
        },
      },
    ]);

    const deck = getDeck();
    const cards = drawCards(deck, spreadSize, reversalsAnswer.allowReversals);

    console.log(`\nYour cards for the question: ${questionAnswer.tarotPrompt}`);
    for (let i = 0; i < cards.length; i++) {
      console.log(chalk.cyan(`\n${i + 1}. ${cards[i]}`));
      await displayCardImage(cards[i]);

      if (i < cards.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

runTarotApp();
