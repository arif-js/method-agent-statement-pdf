// Imports
const express = require("express");
const app = express();
const port = 5000;
const ejs = require("ejs");
const { default: puppeteer } = require("puppeteer");
const { PDFDocument } = require("pdf-lib");

const lastPageFooterTemplate = '<div style="display: flex; flex-wrap: wrap; margin-right: 30px; margin-left: 30px; margin-bottom: 12px">\
        <div style="flex: 0 0 100%; max-width: 100%">\
          <h4 style="font-size: 8.5px; font-family: \'Nunito\', sans-serif; margin: 0!important; padding: 0!important; margin-bottom: 3px!important">Payment Options:</h4>\
          <p style="font-size: 8.5px; font-family: \'Nunito\', sans-serif; margin: 0!important; padding: 0!important; line-height: 1.4; text-align: justify;">\
              Payments can be made via <b>a check delivered to the Roswell office</b>, or <b>electronically via Zelle</b>. Please make all checks\
              payable to “Method” and include the words “Tab Payment” in the memo. When sending Zelle payments, please send to our\
              phone number at 770-329-9484. Please include your First name, Last name and the words “Tab Payment” in your payment\
              description.\
          </p>\
        </div>\
    </div>'

// Static Files
app.use(express.static("assets"));
// Specific folder example

app.use(express.static("public"));
app.use("/assets", express.static("public"));

// Set View's
app.set("views", "./views");
app.set("view engine", "ejs");

const data = [
  {
    date: "05/12/2023",
    description: 'Client Gifts and Party Favors',
    debit: "-$87.00",
    credit: "",
    balance: "$87.00",
    marketingDebit: "",
    marketingCredit: "",
    marketingBalance: "$0.00"
  },
  {
    date: "01/12/2023",
    description: 'Client Gifts and Party Favors',
    debit: "-$87.00",
    credit: "",
    balance: "$87.00",
    marketingDebit: "",
    marketingCredit: "",
    marketingBalance: "$0.00"
  },
  {
    date: "01/12/2023",
    description: 'Client Gifts and Party Favors',
    debit: "-$87.00",
    credit: "",
    balance: "$87.00",
    marketingDebit: "",
    marketingCredit: "",
    marketingBalance: "$0.00"
  },
];

// Navigation
app.get("", async (req, res) => {
  const pdfDoc = await PDFDocument.create()

  let n = data.length;// number of items in the array
  let itemsPerPage = 10; // number of items to display on the first page
  let remainingItemsPerPage = 20; // number of items to display on the rest of the pages
  let pageCount = Math.ceil((n - itemsPerPage) / remainingItemsPerPage) + 1; // total number of pages

  for (let i = 0; i < pageCount; i++) {
    let start = i == 0 ? 0 : itemsPerPage + (i - 1) * remainingItemsPerPage; // starting index for the current page
    let end = i == 0 ? itemsPerPage : start + remainingItemsPerPage; // ending index for the current page
    // display the jth item on the current page
    if (i === 0) {
      // first page
      let html = await ejs.renderFile("views/index.ejs", { data: data.slice(start, end), totalBalance: "$5675.00", marketingBalance: "$456.00", pageNumber: i+1, pageCount }, { async: true });
      let page1 = await createPDF(html, {
        height: "11.00in",
        width: "8.50in",
        margin: { top: 30, bottom: 0 },
        footerTemplate: lastPageFooterTemplate,
        displayHeaderFooter: i === pageCount-1
      });
      const page1Doc = await PDFDocument.load(page1)
      const [firstPage] = await pdfDoc.copyPages(page1Doc, [0])
      pdfDoc.addPage(firstPage)
    } else {
      let html = await ejs.renderFile("views/index2.ejs", { data: data.slice(start, end), pageNumber: i+1, pageCount }, { async: true });
      let page2 = await createPDF(html, {
        height: "11.00in",
        width: "8.50in",
        margin: { top: 0, bottom: 80 },
        footerTemplate: lastPageFooterTemplate,
        displayHeaderFooter: i === pageCount-1
      });
      const page2Doc = await PDFDocument.load(page2)
      const [secondPage] = await pdfDoc.copyPages(page2Doc, [0])
      pdfDoc.addPage(secondPage)
    }
  }
  
  const pdfBytes = await pdfDoc.save()
  res.type("application/pdf");
  return res.end(Buffer.from(pdfBytes), "binary");
});

const createPDF = async (html, options) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ ...options, printBackground: true });
  await browser.close();
  return pdf;
};

// Listen on Port 5000
app.listen(port, () => console.info(`App listening on port ${port}`));
