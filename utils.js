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

export function supportsInlineImages() {
  const termProgram = process.env.TERM_PROGRAM || "";
  const term = process.env.TERM || "";

  return (
    termProgram.includes("iTerm") ||
    termProgram.includes("WezTerm") ||
    term.toLowerCase().includes("kitty") ||
    term.toLowerCase().includes("sixel") ||
    process.env.KITTY_WINDOW_ID !== undefined
  );
}

export async function getTerminalImageOptions(isInlineCapable) {
  if (!isInlineCapable) {
    return { height: 16 };
  }

  return {
    width: "",
    height: "",
    preserveAspectRatio: true,
  };
}

export async function displayCardImage(cardName) {
  try {
    const imageFile = cardToImage[cardName];

    if (!imageFile) {
      console.log(chalk.red(`(no image found)`));
      return;
    }

    const imagePath = join(__dirname, "card-images", imageFile);

    if (!fs.existsSync(imagePath)) {
      console.log(chalk.red(`(image not found: ${imageFile})`));
      return;
    }

    try {
      const isInlineCapable = supportsInlineImages();
      const options = await getTerminalImageOptions(isInlineCapable);
      let imagePathToDisplay = imagePath;

      try {
        const image = await terminalImage.file(imagePathToDisplay, options);
        console.log(image);

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
    }
  } catch (error) {
    console.log(chalk.red(`(error displaying image: ${error.message})`));
  }
}
