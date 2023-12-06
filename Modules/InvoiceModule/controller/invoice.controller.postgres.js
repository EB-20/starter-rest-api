const puppeteer = require("puppeteer");
const fs = require('fs');

const printPDF = async (req, res) => {
  res.download('./samp-le.html');
};
// const printPDF = async (req, res) => {
//   const browser = await puppeteer.launch({headless: "new" });

//   // Create a new page
//   const page = await browser.newPage();

//   //Get HTML content from HTML file
//   const html = fs.readFileSync('sample.html', 'utf-8');
//   await page.setContent(html, { waitUntil: 'domcontentloaded' });

//   //To reflect CSS used for screens instead of print
//   await page.emulateMediaType("screen");

//   // Downlaod the PDF
//   const pdf = await page.pdf({
//     path: "result.pdf",
//     margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
//     printBackground: true,
//     format: "A4",
//   });

//   // Close the browser instance
//   await browser.close();

//   // res.set({ "Content-Type": "application/pdf", "Content-Length": pdf.length });
//   // res.send(pdf);
// };

module.exports = { printPDF };
