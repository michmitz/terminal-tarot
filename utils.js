import { majorArcana, suits, cardToImage } from "./cardData.js";
import { dirname, join } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import terminalImage from "terminal-image";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getDeck() {
  const deck = [...majorArcana];
  for (const suit in suits) {
    suits[suit].forEach((rank) => deck.push(`${rank} of ${suit}`));
  }
  return deck;
}

export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  let currentIndex = shuffled.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
};

const shuffledDeck = shuffleDeck(getDeck());

export function drawCards(num) {
  return shuffledDeck.slice(0, num);
}

export async function getTerminalImageOptions(isIterm) {
  return isIterm
    ? {
        width: "14.5ch",
        height: "10ch",
        preserveAspectRatio: true,
      }
    : {
        height: 13,
      };
}

export async function displayCardImage(cardName) {
  try {
    const imageFile = cardToImage[cardName];

    if (!imageFile) {
      console.log(chalk.red(`(no image mapping found)`));
      return;
    }

    const imagePath = join(__dirname, "card-images", imageFile);

    if (!fs.existsSync(imagePath)) {
      console.log(chalk.red(`(image not found: ${imageFile})`));
      return;
    }

    try {
      const isIterm = process.env.TERM_PROGRAM === "iTerm.app";
      const options = await getTerminalImageOptions(isIterm);
      let imagePathToDisplay = imagePath;

      try {
        const image = await terminalImage.file(imagePathToDisplay, options);
        console.log(image);

        // Force terminal buffer flush to prevent display artifacts
        process.stdout.write("");
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (displayError) {
        console.log(
          chalk.yellow(
            `Primary display failed for ${imageFile}, trying fallback...`
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
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
    }
  } catch (error) {
    console.log(chalk.red(`(error displaying image: ${error.message})`));
  }
}
