const fs = require("fs-extra");
const PNG = require("pngjs").PNG;
const path = require("path");

const inputDir = "./pngs"; // Directory containing PNG files
const outputDir = "./var"; // Directory for TXT files

// Ensure output directory exists
fs.ensureDirSync(outputDir);

// Read all PNG files in the input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.log("Error reading input directory:", err);
    return;
  }

  files
    .filter((file) => path.extname(file).toLowerCase() === ".png")
    .forEach((file) => {
      fs.createReadStream(path.join(inputDir, file))
        .pipe(new PNG())
        .on("parsed", function () {
          let outputLines = [];
          for (let y = 0; y < this.height; y++) {
            let line = [];
            for (let x = 0; x < this.width; x++) {
              const idx = (this.width * y + x) << 2;
              // Check if the pixel is black (assuming grayscale)
              const isBlack =
                this.data[idx] === 0 &&
                this.data[idx + 1] === 0 &&
                this.data[idx + 2] === 0;
              line.push(isBlack ? "0" : "1");
            }
            outputLines.push(line.join(", "));
          }

          // Join all lines into a formatted string
          const formattedOutput =
            "VAR\n" +
            "\t_pixels : ARRAY [0..255] OF BYTE := [\n\t\t" +
            outputLines.join(",\n\t\t") +
            "\n\t];\n" +
            "END_VAR";

          // Write to a text file
          const outputFilePath = path.join(
            outputDir,
            path.basename(file, ".png") + ".txt"
          );
          fs.writeFileSync(outputFilePath, formattedOutput);
          console.log("Written:", outputFilePath);
        });
    });
});
