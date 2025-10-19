// // backend/controllers/causelist.js
// import axios from "axios";
// import * as cheerio from "cheerio";

// // Fetch available dates for Allahabad High Court
// export const fetchAvailableDates = async (req, res) => {
//   try {
//     const { court } = req.body;

//     if (court !== "allahabad") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Unsupported court. Currently only Allahabad High Court is supported.",
//       });
//     }

//     console.log("📅 Fetching available dates from Allahabad High Court...");

//     const dateResponse = await axios.post(
//       "https://www.allahabadhighcourt.in/causelist/input1A.jsp",
//       new URLSearchParams({ listType: "Z" }).toString(),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 15000, // 15 second timeout
//       }
//     );

//     const $dates = cheerio.load(dateResponse.data);
//     const dateOptions = $dates("select[name='listDate'] option")
//       .map((_, el) => $dates(el).attr("value"))
//       .get()
//       .filter(Boolean);

//     console.log(`✅ Found ${dateOptions.length} available dates`);

//     if (dateOptions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No dates available at the moment. Please try again later.",
//       });
//     }

//     res.json({
//       success: true,
//       dates: dateOptions,
//       count: dateOptions.length,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching dates:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The court website may be slow or unavailable.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch available dates. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Fetch available courts for a specific date
// export const fetchAvailableCourts = async (req, res) => {
//   try {
//     const { court, date } = req.body;

//     if (court !== "allahabad") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Unsupported court. Currently only Allahabad High Court is supported.",
//       });
//     }

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required",
//       });
//     }

//     console.log(`🔍 Fetching available courts for ${date}...`);

//     const courtResponse = await axios.post(
//       "https://www.allahabadhighcourt.in/causelist/input2A.jsp",
//       new URLSearchParams({
//         criteria: "court",
//         listDate: date,
//         listType: "Z",
//       }).toString(),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 15000,
//       }
//     );

//     const $courts = cheerio.load(courtResponse.data);
//     const courtOptions = $courts("select[name='courtNo'] option")
//       .map((_, el) => ({
//         value: $courts(el).attr("value"),
//         text: $courts(el).text().trim(),
//       }))
//       .get()
//       .filter((o) => o.value && o.text);

//     console.log(`✅ Found ${courtOptions.length} available courts`);

//     if (courtOptions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No courts available for the selected date.",
//       });
//     }

//     res.json({
//       success: true,
//       courts: courtOptions,
//       count: courtOptions.length,
//       date: date,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching courts:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The court website may be slow or unavailable.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch available courts. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Download cause list PDF
// export const downloadCauseList = async (req, res) => {
//   try {
//     const { court, date, courtNo } = req.body;

//     if (court !== "allahabad") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Unsupported court. Currently only Allahabad High Court is supported.",
//       });
//     }

//     if (!date || !courtNo) {
//       return res.status(400).json({
//         success: false,
//         message: "Date and court number are required",
//       });
//     }

//     console.log(`📤 Fetching cause list for court ${courtNo} on ${date}...`);

//     // Step 1: Get the PDF link
//     const pdfResponse = await axios.post(
//       "https://www.allahabadhighcourt.in/causelist/viewlistA.jsp",
//       new URLSearchParams({
//         courtNo: courtNo,
//         location: "A",
//         listType: "Z",
//         listDate: date,
//       }).toString(),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 15000,
//       }
//     );

//     // Extract PDF URL from response
//     const linkMatch = pdfResponse.data.match(/href="(.*?\.pdf)"/i);

//     if (!linkMatch) {
//       console.log("❌ No PDF found for that date/court.");
//       return res.status(404).json({
//         success: false,
//         message: "No cause list PDF found for the selected date and court.",
//       });
//     }

//     const pdfUrl = linkMatch[1].startsWith("http")
//       ? linkMatch[1]
//       : "https://www.allahabadhighcourt.in" + linkMatch[1];

//     console.log("✅ Found PDF URL:", pdfUrl);
//     console.log("📥 Downloading PDF...");

//     // Step 2: Download the PDF
//     const pdfFile = await axios.get(pdfUrl, {
//       responseType: "arraybuffer",
//       timeout: 30000, // 30 seconds for PDF download
//     });

//     // Generate filename
//     const getCourtPrefix = (courtNumber) => {
//       if (courtNumber === "-99") return "All";
//       if (courtNumber === "0") return "CJ";
//       return courtNumber;
//     };

//     const prefix = getCourtPrefix(courtNo);
//     const fileName = `CauseList_${prefix}_${date}.pdf`;

//     // Set headers for PDF download
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
//     res.setHeader("Content-Length", pdfFile.data.length);

//     console.log("✅ PDF sent successfully:", fileName);

//     // Send PDF buffer
//     res.send(Buffer.from(pdfFile.data));
//   } catch (error) {
//     console.error("❌ Error downloading PDF:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The PDF download took too long. Please try again.",
//       });
//     }

//     if (error.response && error.response.status === 404) {
//       return res.status(404).json({
//         success: false,
//         message: "PDF file not found on the court website.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to download cause list PDF. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// backend/controllers/causelist.js
// import axios from "axios";
// import * as cheerio from "cheerio";
// import puppeteer from "puppeteer";

// // ==================== ALLAHABAD HIGH COURT ====================

// // Fetch available dates for Allahabad High Court
// export const fetchAllahabadDates = async (req, res) => {
//   try {
//     console.log("📅 Fetching available dates from Allahabad High Court...");

//     const dateResponse = await axios.post(
//       "https://www.allahabadhighcourt.in/causelist/input1A.jsp",
//       new URLSearchParams({ listType: "Z" }).toString(),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 15000,
//       }
//     );

//     const $dates = cheerio.load(dateResponse.data);
//     const dateOptions = $dates("select[name='listDate'] option")
//       .map((_, el) => $dates(el).attr("value"))
//       .get()
//       .filter(Boolean);

//     console.log(`✅ Found ${dateOptions.length} available dates`);

//     if (dateOptions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No dates available at the moment. Please try again later.",
//       });
//     }

//     res.json({
//       success: true,
//       dates: dateOptions,
//       count: dateOptions.length,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching dates:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The court website may be slow or unavailable.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch available dates. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Fetch available courts for Allahabad High Court
// export const fetchAllahabadCourts = async (req, res) => {
//   try {
//     const { date } = req.body;

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required",
//       });
//     }

//     console.log(`🔍 Fetching available courts for ${date}...`);

//     const courtResponse = await axios.post(
//       "https://www.allahabadhighcourt.in/causelist/input2A.jsp",
//       new URLSearchParams({
//         criteria: "court",
//         listDate: date,
//         listType: "Z",
//       }).toString(),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 15000,
//       }
//     );

//     const $courts = cheerio.load(courtResponse.data);
//     const courtOptions = $courts("select[name='courtNo'] option")
//       .map((_, el) => ({
//         value: $courts(el).attr("value"),
//         text: $courts(el).text().trim(),
//       }))
//       .get()
//       .filter((o) => o.value && o.text);

//     console.log(`✅ Found ${courtOptions.length} available courts`);

//     if (courtOptions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No courts available for the selected date.",
//       });
//     }

//     res.json({
//       success: true,
//       courts: courtOptions,
//       count: courtOptions.length,
//       date: date,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching courts:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The court website may be slow or unavailable.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch available courts. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Download Allahabad cause list PDF
// export const downloadAllahabadCauseList = async (req, res) => {
//   try {
//     const { date, courtNo } = req.body;

//     if (!date || !courtNo) {
//       return res.status(400).json({
//         success: false,
//         message: "Date and court number are required",
//       });
//     }

//     console.log(`📤 Fetching cause list for court ${courtNo} on ${date}...`);

//     const pdfResponse = await axios.post(
//       "https://www.allahabadhighcourt.in/causelist/viewlistA.jsp",
//       new URLSearchParams({
//         courtNo: courtNo,
//         location: "A",
//         listType: "Z",
//         listDate: date,
//       }).toString(),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 15000,
//       }
//     );

//     const linkMatch = pdfResponse.data.match(/href="(.*?\.pdf)"/i);

//     if (!linkMatch) {
//       console.log("❌ No PDF found for that date/court.");
//       return res.status(404).json({
//         success: false,
//         message: "No cause list PDF found for the selected date and court.",
//       });
//     }

//     const pdfUrl = linkMatch[1].startsWith("http")
//       ? linkMatch[1]
//       : "https://www.allahabadhighcourt.in" + linkMatch[1];

//     console.log("✅ Found PDF URL:", pdfUrl);
//     console.log("📥 Downloading PDF...");

//     const pdfFile = await axios.get(pdfUrl, {
//       responseType: "arraybuffer",
//       timeout: 30000,
//     });

//     const getCourtPrefix = (courtNumber) => {
//       if (courtNumber === "-99") return "All";
//       if (courtNumber === "0") return "CJ";
//       return courtNumber;
//     };

//     const prefix = getCourtPrefix(courtNo);
//     const fileName = `Allahabad_CauseList_${prefix}_${date}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
//     res.setHeader("Content-Length", pdfFile.data.length);

//     console.log("✅ PDF sent successfully:", fileName);
//     res.send(Buffer.from(pdfFile.data));
//   } catch (error) {
//     console.error("❌ Error downloading PDF:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The PDF download took too long. Please try again.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to download cause list PDF. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // ==================== KARNATAKA HIGH COURT ====================

// // Helper function to get encryption token for Karnataka
// async function getKarnatakaEncryptToken(urlString) {
//   const encUrl = "https://judiciary.karnataka.gov.in/encrypt.php";
//   const body = new URLSearchParams({ url: urlString }).toString();

//   const resp = await axios.post(encUrl, body, {
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//       "User-Agent": "Mozilla/5.0 (Node)",
//       Accept: "text/plain, */*; q=0.01",
//     },
//     timeout: 20000,
//   });

//   return resp.data && typeof resp.data === "string" ? resp.data.trim() : null;
// }

// // Helper function to get cause list response for Karnataka
// async function getKarnatakaCauseListResp(paramName, token) {
//   const resp = await axios.get(
//     `https://judiciary.karnataka.gov.in/causeListSearchResp.php?${paramName}=${encodeURIComponent(
//       token
//     )}`,
//     {
//       headers: { "User-Agent": "Mozilla/5.0 (Node)" },
//       timeout: 20000,
//     }
//   );
//   return resp.data;
// }

// // Helper function to parse court options from Karnataka HTML
// function parseKarnatakaCourtOptions(htmlFragment) {
//   const $ = cheerio.load(htmlFragment);
//   const options = [];
//   let sel = $("#chno");
//   if (!sel || sel.length === 0) sel = $("select").first();

//   sel.find("option").each((i, el) => {
//     const $el = $(el);
//     const val = $el.attr("value");
//     const text = $el.text().trim();
//     if (val !== undefined && text.length > 0) {
//       options.push({ value: String(val), text });
//     }
//   });
//   return options;
// }

// // Helper function to clean HTML and prepare for PDF conversion
// function cleanKarnatakaHTMLForPDF(rawHtml) {
//   const $ = cheerio.load(rawHtml);
//   let table = $("table.common_table").html();

//   if (!table) {
//     $("table").each((i, el) => {
//       const tableHtml = $(el).html();
//       if (
//         tableHtml &&
//         (tableHtml.includes("Cause List") || tableHtml.includes("COURT HALL"))
//       ) {
//         table = tableHtml;
//         return false;
//       }
//     });
//   }

//   if (!table) {
//     return null;
//   }

//   return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <style>
//         @page { margin: 15mm; }
//         body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.3; margin: 0; padding: 0; }
//         table { width: 100%; border-collapse: collapse; table-layout: fixed; }
//         td, th { border: 1px solid #000; padding: 5px; vertical-align: top; word-wrap: break-word; }
//         .tb-font, .mtable { background-color: burlywood !important; border: 3px solid #7c2020 !important; font-weight: bold; text-align: center; padding: 15px 10px; font-size: 11pt; }
//         .disp { background-color: #d3d3d3 !important; font-weight: bold; text-align: left; padding: 8px 5px; }
//         .trbor { border-bottom: 1px solid #000; }
//         .bgcol { background-color: #f5f5f5 !important; }
//         .cen, .trfont { text-align: center; font-weight: bold; background-color: #e0e0e0 !important; padding: 8px; font-size: 10pt; }
//         a { color: #0000EE; text-decoration: none; }
//         b { font-weight: bold; }
//         i { font-style: italic; }
//         u { text-decoration: underline; }
//         font[color='red'], [color='red'] { color: red !important; }
//         font[color='blue'], [color='blue'] { color: blue !important; }
//         @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
//     </style>
// </head>
// <body>
//     <table class="common_table">${table}</table>
// </body>
// </html>`;
// }

// // Helper function to convert HTML to PDF using Puppeteer
// async function convertKarnatakaHTMLToPDF(html, outputPath) {
//   const cleanedHtml = cleanKarnatakaHTMLForPDF(html);
//   if (!cleanedHtml) {
//     throw new Error("Could not extract cause list table from response");
//   }

//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   try {
//     const page = await browser.newPage();
//     await page.setContent(cleanedHtml, { waitUntil: "networkidle0" });

//     await page.pdf({
//       path: outputPath,
//       format: "A4",
//       printBackground: true,
//       margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
//       preferCSSPageSize: true,
//     });
//   } finally {
//     await browser.close();
//   }
// }

// // Fetch Karnataka court halls
// export const fetchKarnatakaCourts = async (req, res) => {
//   try {
//     const { bench, date } = req.body;

//     if (!bench || !date) {
//       return res.status(400).json({
//         success: false,
//         message: "Bench and date are required",
//       });
//     }

//     // Validate bench
//     if (!["B", "D", "K"].includes(bench.toUpperCase())) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid bench. Use B (Bengaluru), D (Dharwad), or K (Kalaburagi)",
//       });
//     }

//     console.log(
//       `🔍 Fetching Karnataka court halls for bench ${bench} on ${date}...`
//     );

//     const so = 1;
//     const radioc = "D";
//     const urlForOptions = `flg::1|so::${so}|bench::${bench}|radioc::${radioc}`;

//     const token = await getKarnatakaEncryptToken(urlForOptions);
//     if (!token) {
//       return res.status(500).json({
//         success: false,
//         message: "Could not get authentication token from Karnataka HC",
//       });
//     }

//     const fragmentHtml = await getKarnatakaCauseListResp("params", token);
//     const courtOptions = parseKarnatakaCourtOptions(fragmentHtml);

//     if (!courtOptions || courtOptions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No court halls found for this bench and date",
//       });
//     }

//     console.log(`✅ Found ${courtOptions.length} court halls`);

//     res.json({
//       success: true,
//       courts: courtOptions,
//       count: courtOptions.length,
//       bench,
//       date,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching Karnataka courts:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message:
//           "Request timeout. The court website may be slow or unavailable.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch court halls. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // Download Karnataka cause list PDF
// export const downloadKarnatakaCauseList = async (req, res) => {
//   try {
//     const { bench, date, courtNo } = req.body;

//     if (!bench || !date || !courtNo) {
//       return res.status(400).json({
//         success: false,
//         message: "Bench, date, and court number are required",
//       });
//     }

//     console.log(
//       `📤 Fetching Karnataka cause list for court ${courtNo} on ${date}...`
//     );

//     const [dd, mm, yyyy] = date.split("-");
//     const fromDt = `${dd}/${mm}/${yyyy}`;
//     const toDt = fromDt;
//     const radioc = "D";
//     const searchType = 1;
//     const flg = 2;

//     const urlForSearch = [
//       `flg::${flg}`,
//       `so::1`,
//       `bench::${bench}`,
//       `SearchType::${searchType}`,
//       `keyWord::${courtNo}`,
//       `fromDt::${fromDt}`,
//       `toDt::${toDt}`,
//       `radioc::${radioc}`,
//     ].join("|");

//     const token = await getKarnatakaEncryptToken(urlForSearch);
//     if (!token) {
//       return res.status(500).json({
//         success: false,
//         message: "Could not get search token from Karnataka HC",
//       });
//     }

//     const resultHtml = await getKarnatakaCauseListResp("dataset", token);

//     if (
//       !resultHtml ||
//       (!resultHtml.includes("Cause List") && !resultHtml.includes("COURT HALL"))
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "No cause list data found for this selection",
//       });
//     }

//     // Check for direct PDF links first
//     const $ = cheerio.load(resultHtml);
//     const pdfLinks = [];
//     $("a").each((i, el) => {
//       const href = $(el).attr("href");
//       if (href && href.toLowerCase().endsWith(".pdf")) {
//         const url = href.startsWith("http")
//           ? href
//           : `https://judiciary.karnataka.gov.in/${href.replace(/^\//, "")}`;
//         pdfLinks.push(url);
//       }
//     });

//     // Generate filename
//     const fileName = `Karnataka_${bench}_Court${courtNo}_${date}.pdf`;

//     if (pdfLinks.length > 0) {
//       // Download existing PDF
//       console.log("📥 Downloading existing PDF...");
//       const pdfResp = await axios.get(pdfLinks[0], {
//         responseType: "arraybuffer",
//         timeout: 30000,
//       });

//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${fileName}"`
//       );
//       res.setHeader("Content-Length", pdfResp.data.length);

//       console.log("✅ PDF sent successfully:", fileName);
//       res.send(Buffer.from(pdfResp.data));
//     } else {
//       // Convert HTML to PDF
//       console.log("📄 Converting HTML to PDF...");
//       const tempPath = `/tmp/${fileName}`;

//       await convertKarnatakaHTMLToPDF(resultHtml, tempPath);

//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${fileName}"`
//       );

//       const fs = await import("fs");
//       const pdfBuffer = fs.readFileSync(tempPath);
//       res.send(pdfBuffer);

//       // Cleanup temp file
//       fs.unlinkSync(tempPath);

//       console.log("✅ PDF generated and sent successfully:", fileName);
//     }
//   } catch (error) {
//     console.error("❌ Error downloading Karnataka PDF:", error.message);

//     if (error.code === "ECONNABORTED") {
//       return res.status(504).json({
//         success: false,
//         message: "Request timeout. Please try again.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to download cause list. Please try again later.",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// backend/controllers/causelist.js
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import os from "os";
import path from "path";
import fs from "fs";

// ==================== ALLAHABAD HIGH COURT ====================

// Fetch available dates for Allahabad High Court
export const fetchAllahabadDates = async (req, res) => {
  try {
    console.log("📅 Fetching available dates from Allahabad High Court...");

    const dateResponse = await axios.post(
      "https://www.allahabadhighcourt.in/causelist/input1A.jsp",
      new URLSearchParams({ listType: "Z" }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    const $dates = cheerio.load(dateResponse.data);
    const dateOptions = $dates("select[name='listDate'] option")
      .map((_, el) => $dates(el).attr("value"))
      .get()
      .filter(Boolean);

    console.log(`✅ Found ${dateOptions.length} available dates`);

    if (dateOptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No dates available at the moment. Please try again later.",
      });
    }

    res.json({
      success: true,
      dates: dateOptions,
      count: dateOptions.length,
    });
  } catch (error) {
    console.error("❌ Error fetching dates:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message:
          "Request timeout. The court website may be slow or unavailable.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch available dates. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Fetch available courts for Allahabad High Court
export const fetchAllahabadCourts = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    console.log(`🔍 Fetching available courts for ${date}...`);

    const courtResponse = await axios.post(
      "https://www.allahabadhighcourt.in/causelist/input2A.jsp",
      new URLSearchParams({
        criteria: "court",
        listDate: date,
        listType: "Z",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    const $courts = cheerio.load(courtResponse.data);
    const courtOptions = $courts("select[name='courtNo'] option")
      .map((_, el) => ({
        value: $courts(el).attr("value"),
        text: $courts(el).text().trim(),
      }))
      .get()
      .filter((o) => o.value && o.text);

    console.log(`✅ Found ${courtOptions.length} available courts`);

    if (courtOptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courts available for the selected date.",
      });
    }

    res.json({
      success: true,
      courts: courtOptions,
      count: courtOptions.length,
      date: date,
    });
  } catch (error) {
    console.error("❌ Error fetching courts:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message:
          "Request timeout. The court website may be slow or unavailable.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch available courts. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Download Allahabad cause list PDF
export const downloadAllahabadCauseList = async (req, res) => {
  try {
    const { date, courtNo } = req.body;

    if (!date || !courtNo) {
      return res.status(400).json({
        success: false,
        message: "Date and court number are required",
      });
    }

    console.log(`📤 Fetching cause list for court ${courtNo} on ${date}...`);

    const pdfResponse = await axios.post(
      "https://www.allahabadhighcourt.in/causelist/viewlistA.jsp",
      new URLSearchParams({
        courtNo: courtNo,
        location: "A",
        listType: "Z",
        listDate: date,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    const linkMatch = pdfResponse.data.match(/href="(.*?\.pdf)"/i);

    if (!linkMatch) {
      console.log("❌ No PDF found for that date/court.");
      return res.status(404).json({
        success: false,
        message: "No cause list PDF found for the selected date and court.",
      });
    }

    const pdfUrl = linkMatch[1].startsWith("http")
      ? linkMatch[1]
      : "https://www.allahabadhighcourt.in" + linkMatch[1];

    console.log("✅ Found PDF URL:", pdfUrl);
    console.log("📥 Downloading PDF...");

    const pdfFile = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const getCourtPrefix = (courtNumber) => {
      if (courtNumber === "-99") return "All";
      if (courtNumber === "0") return "CJ";
      return courtNumber;
    };

    const prefix = getCourtPrefix(courtNo);
    const fileName = `Allahabad_CauseList_${prefix}_${date}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfFile.data.length);

    console.log("✅ PDF sent successfully:", fileName);
    res.send(Buffer.from(pdfFile.data));
  } catch (error) {
    console.error("❌ Error downloading PDF:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message:
          "Request timeout. The PDF download took too long. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to download cause list PDF. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== KARNATAKA HIGH COURT ====================

// Helper function to get encryption token for Karnataka
async function getKarnatakaEncryptToken(urlString) {
  const encUrl = "https://judiciary.karnataka.gov.in/encrypt.php";
  const body = new URLSearchParams({ url: urlString }).toString();

  const resp = await axios.post(encUrl, body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Node)",
      Accept: "text/plain, */*; q=0.01",
    },
    timeout: 20000,
  });

  return resp.data && typeof resp.data === "string" ? resp.data.trim() : null;
}

// Helper function to get cause list response for Karnataka
async function getKarnatakaCauseListResp(paramName, token) {
  const resp = await axios.get(
    `https://judiciary.karnataka.gov.in/causeListSearchResp.php?${paramName}=${encodeURIComponent(
      token
    )}`,
    {
      headers: { "User-Agent": "Mozilla/5.0 (Node)" },
      timeout: 20000,
    }
  );
  return resp.data;
}

// Helper function to parse court options from Karnataka HTML
function parseKarnatakaCourtOptions(htmlFragment) {
  const $ = cheerio.load(htmlFragment);
  const options = [];
  let sel = $("#chno");
  if (!sel || sel.length === 0) sel = $("select").first();

  sel.find("option").each((i, el) => {
    const $el = $(el);
    const val = $el.attr("value");
    const text = $el.text().trim();
    if (val !== undefined && text.length > 0) {
      options.push({ value: String(val), text });
    }
  });
  return options;
}

// Helper function to clean HTML and prepare for PDF conversion
function cleanKarnatakaHTMLForPDF(rawHtml) {
  const $ = cheerio.load(rawHtml);
  let table = $("table.common_table").html();

  if (!table) {
    $("table").each((i, el) => {
      const tableHtml = $(el).html();
      if (
        tableHtml &&
        (tableHtml.includes("Cause List") || tableHtml.includes("COURT HALL"))
      ) {
        table = tableHtml;
        return false;
      }
    });
  }

  if (!table) {
    return null;
  }

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 15mm; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.3; margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        td, th { border: 1px solid #000; padding: 5px; vertical-align: top; word-wrap: break-word; }
        .tb-font, .mtable { background-color: burlywood !important; border: 3px solid #7c2020 !important; font-weight: bold; text-align: center; padding: 15px 10px; font-size: 11pt; }
        .disp { background-color: #d3d3d3 !important; font-weight: bold; text-align: left; padding: 8px 5px; }
        .trbor { border-bottom: 1px solid #000; }
        .bgcol { background-color: #f5f5f5 !important; }
        .cen, .trfont { text-align: center; font-weight: bold; background-color: #e0e0e0 !important; padding: 8px; font-size: 10pt; }
        a { color: #0000EE; text-decoration: none; }
        b { font-weight: bold; }
        i { font-style: italic; }
        u { text-decoration: underline; }
        font[color='red'], [color='red'] { color: red !important; }
        font[color='blue'], [color='blue'] { color: blue !important; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <table class="common_table">${table}</table>
</body>
</html>`;
}

// Helper function to convert HTML to PDF using Puppeteer
async function convertKarnatakaHTMLToPDF(html, outputPath) {
  const cleanedHtml = cleanKarnatakaHTMLForPDF(html);
  if (!cleanedHtml) {
    throw new Error("Could not extract cause list table from response");
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(cleanedHtml, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}

// Fetch Karnataka court halls
export const fetchKarnatakaCourts = async (req, res) => {
  try {
    const { bench, date } = req.body;

    if (!bench || !date) {
      return res.status(400).json({
        success: false,
        message: "Bench and date are required",
      });
    }

    // Validate bench
    if (!["B", "D", "K"].includes(bench.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid bench. Use B (Bengaluru), D (Dharwad), or K (Kalaburagi)",
      });
    }

    console.log(
      `🔍 Fetching Karnataka court halls for bench ${bench} on ${date}...`
    );

    const so = 1;
    const radioc = "D";
    const urlForOptions = `flg::1|so::${so}|bench::${bench}|radioc::${radioc}`;

    const token = await getKarnatakaEncryptToken(urlForOptions);
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Could not get authentication token from Karnataka HC",
      });
    }

    const fragmentHtml = await getKarnatakaCauseListResp("params", token);
    const courtOptions = parseKarnatakaCourtOptions(fragmentHtml);

    if (!courtOptions || courtOptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No court halls found for this bench and date",
      });
    }

    console.log(`✅ Found ${courtOptions.length} court halls`);

    res.json({
      success: true,
      courts: courtOptions,
      count: courtOptions.length,
      bench,
      date,
    });
  } catch (error) {
    console.error("❌ Error fetching Karnataka courts:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message:
          "Request timeout. The court website may be slow or unavailable.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch court halls. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Download Karnataka cause list PDF
export const downloadKarnatakaCauseList = async (req, res) => {
  let tempPath = null;

  try {
    const { bench, date, courtNo } = req.body;

    if (!bench || !date || !courtNo) {
      return res.status(400).json({
        success: false,
        message: "Bench, date, and court number are required",
      });
    }

    console.log(
      `📤 Fetching Karnataka cause list for court ${courtNo} on ${date}...`
    );

    const [dd, mm, yyyy] = date.split("-");
    const fromDt = `${dd}/${mm}/${yyyy}`;
    const toDt = fromDt;
    const radioc = "D";
    const searchType = 1;
    const flg = 2;

    const urlForSearch = [
      `flg::${flg}`,
      `so::1`,
      `bench::${bench}`,
      `SearchType::${searchType}`,
      `keyWord::${courtNo}`,
      `fromDt::${fromDt}`,
      `toDt::${toDt}`,
      `radioc::${radioc}`,
    ].join("|");

    const token = await getKarnatakaEncryptToken(urlForSearch);
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Could not get search token from Karnataka HC",
      });
    }

    const resultHtml = await getKarnatakaCauseListResp("dataset", token);

    if (
      !resultHtml ||
      (!resultHtml.includes("Cause List") && !resultHtml.includes("COURT HALL"))
    ) {
      return res.status(404).json({
        success: false,
        message: "No cause list data found for this selection",
      });
    }

    // Check for direct PDF links first
    const $ = cheerio.load(resultHtml);
    const pdfLinks = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.toLowerCase().endsWith(".pdf")) {
        const url = href.startsWith("http")
          ? href
          : `https://judiciary.karnataka.gov.in/${href.replace(/^\//, "")}`;
        pdfLinks.push(url);
      }
    });

    // Generate filename
    const fileName = `Karnataka_${bench}_Court${courtNo}_${date}.pdf`;

    if (pdfLinks.length > 0) {
      // Download existing PDF
      console.log("📥 Downloading existing PDF...");
      const pdfResp = await axios.get(pdfLinks[0], {
        responseType: "arraybuffer",
        timeout: 30000,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Length", pdfResp.data.length);

      console.log("✅ PDF sent successfully:", fileName);
      res.send(Buffer.from(pdfResp.data));
    } else {
      // Convert HTML to PDF
      console.log("📄 Converting HTML to PDF...");

      // Use OS temp directory with proper path joining
      const tempDir = os.tmpdir();
      tempPath = path.join(tempDir, fileName);

      console.log(`📁 Temp file path: ${tempPath}`);

      await convertKarnatakaHTMLToPDF(resultHtml, tempPath);

      // Check if file was created
      if (!fs.existsSync(tempPath)) {
        throw new Error("PDF file was not created successfully");
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      const pdfBuffer = fs.readFileSync(tempPath);
      res.send(pdfBuffer);

      console.log("✅ PDF generated and sent successfully:", fileName);
    }
  } catch (error) {
    console.error("❌ Error downloading Karnataka PDF:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Request timeout. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to download cause list. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // Cleanup temp file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
        console.log("🗑️  Temp file cleaned up");
      } catch (cleanupError) {
        console.error("⚠️  Failed to cleanup temp file:", cleanupError.message);
      }
    }
  }
};
