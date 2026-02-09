import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const fileBuffer = fs.readFileSync('testinvoice1.pdf');

async function debug() {
    try {
        let PDFParseClass = pdfParse;
        if (pdfParse.PDFParse) {
            PDFParseClass = pdfParse.PDFParse;
        } else if (pdfParse.default && pdfParse.default.PDFParse) {
            PDFParseClass = pdfParse.default.PDFParse;
        }

        // Match server logic exactly
        // server/index.js: const uint8Buffer = new Uint8Array(fileBuffer);
        // server/index.js: const parser = new PDFParseClass(uint8Buffer);
        // server/index.js: const pdfData = await parser.getText();

        // Wait, standard pdf-parse is NOT used like this.
        // If server/index.js uses this, verify if it throws error or works.
        // If it throws, then server logic is broken.

        if (typeof PDFParseClass === 'function' && PDFParseClass.prototype) {
            console.log("Attempting class-based usage (like server)...");
            const uint8Buffer = new Uint8Array(fileBuffer);
            const parser = new PDFParseClass(uint8Buffer);
            const pdfData = await parser.getText();
            console.log("PDF TEXT START");
            console.log(pdfData.text);
            console.log("PDF TEXT END");
        } else {
            console.log("PDFParseClass is not a class. Trying standard pdf-parse usage...");
            const data = await pdfParse(fileBuffer);
            console.log("PDF TEXT START");
            console.log(data.text);
            console.log("PDF TEXT END");
        }

    } catch (err) {
        console.error("Error parsing PDF:", err);
    }
}

debug();
