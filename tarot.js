#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import updateNotifier from "update-notifier";
import { readFileSync } from "fs";
import { drawCards, displayCardImage } from "./utils.js";
import { celticCrossPositions, threeCardPositions, fiveCardPositions } from "./cardData.js";
import { getCardMeaning } from "./cardMeanings.js";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url)));
updateNotifier({ pkg }).notify();

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
          { name: "Three Cards: Past, Present, Future", value: "three" },
          { name: "Five Cards: Situation, Past, Future, Root Cause, Potential Outcome", value: "five" },
          { name: "Ten Cards: Celtic Cross", value: "ten" },
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

    const cards = drawCards(spreadSize);

    console.log(`\nYour cards for the question: ${questionAnswer.tarotPrompt}`);
    for (let i = 0; i < cards.length; i++) {
      if (spreadAnswer.spreadType === "ten") {
        console.log(chalk.cyan(`\n${celticCrossPositions[i]} - ${cards[i]}\n`));
      } else if (spreadAnswer.spreadType === "three") {
        console.log(chalk.cyan(`\n${threeCardPositions[i]} - ${cards[i]}\n`));
      } else if (spreadAnswer.spreadType === "five") {
        console.log(chalk.cyan(`\n${fiveCardPositions[i]} - ${cards[i]}\n`));
      } else {
        console.log(chalk.cyan(`\n${cards[i]}\n`));
      }

      await displayCardImage(cards[i]);

      const meaning = getCardMeaning(cards[i]);
      if (meaning) {
        console.log(chalk.magenta(`Keywords: ${meaning.keywords.join(", ")}`));
        console.log(meaning.meaning);
      }

      if (i < cards.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

runTarotApp();
