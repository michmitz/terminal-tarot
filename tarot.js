#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import { getDeck, drawCards, displayCardImage } from "./utils.js";
import { celticCrossPositions } from "./cardData.js";

async function runTarotApp() {
  console.log(chalk.green("🔮 Tarot Card Spreads 🔮\n"));

  try {
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

    const reversalsAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "allowReversals",
        message: "Allow reversals?",
        default: true,
      },
    ]);

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
      if (spreadAnswer.spreadType === "ten") {
        console.log(chalk.cyan(`\n${celticCrossPositions[i]}`));
        console.log(chalk.white(`${cards[i]}`));
      } else {
        console.log(chalk.cyan(`\n${i + 1}. ${cards[i]}`));
      }

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
