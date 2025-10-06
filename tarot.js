#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import { getDeck, drawCards, displayCardImage } from "./utils.js";
import { celticCrossPositions, threeCardPositions } from "./cardData.js";

async function runTarotApp() {
  console.log(chalk.cyan("🔮 Tarot Spreads 🔮\n"));

  try {
    const spreadAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "spreadType",
        message: "Choose a spread:",
        choices: [
          { name: "Single Card", value: "single" },
          { name: "Past, Present, Future", value: "three" },
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
    const cards = drawCards(deck, spreadSize);

    console.log(`\nYour cards for the question: ${questionAnswer.tarotPrompt}`);
    for (let i = 0; i < cards.length; i++) {
      if (spreadAnswer.spreadType === "ten") {
        console.log(chalk.cyan(`\n${celticCrossPositions[i]} - ${cards[i]}\n`));
      } else if (spreadAnswer.spreadType === "three") {
        console.log(chalk.cyan(`\n${threeCardPositions[i]} - ${cards[i]}\n`));
      } else if (spreadAnswer.spreadType === "five") {
        console.log(chalk.cyan(`\n${i + 1}. ${cards[i]}\n`));
      } else {
        console.log(chalk.cyan(`\n${cards[i]}\n`));
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
