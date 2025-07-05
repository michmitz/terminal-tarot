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

export function drawCards(deck, num, allowReversals) {
  let finalDeck;

  if (allowReversals) {
    const reversalCount = Math.floor((deck.length / 2) * Math.random());
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
  return shuffled.slice(0, num);
}

export async function createRotatedImage(imagePath) {
  const JimpModule = await import("jimp");
  const Jimp = JimpModule.Jimp;
  const image = await Jimp.read(imagePath);
  const rotatedImage = image.rotate(180);

  // Create a temporary file for the rotated image
  const tempPath = join(__dirname, "temp-rotated.jpg");
  await rotatedImage.write(tempPath);
  return tempPath;
}

export async function getTerminalImageOptions(isIterm) {
  return isIterm
    ? {
        width: "20ch",
        height: "13ch",
        preserveAspectRatio: true,
      }
    : {
        height: 13,
      };
}

export async function displayCardImage(cardName) {
  try {
    const baseCardName = cardName.replace(" (Reversed)", "");
    const isReversed = cardName.includes(" (Reversed)");
    const imageFile = cardToImage[baseCardName];

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
      let tempPath = null;

      if (isReversed) {
        tempPath = await createRotatedImage(imagePath);
        imagePathToDisplay = tempPath;
      }

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
      } finally {
        // Temp file cleanup
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
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
      if (isReversed) {
        console.log(chalk.yellow("(Card is reversed)"));
      }
    }
  } catch (error) {
    console.log(chalk.red(`(error displaying image: ${error.message})`));
  }
}
