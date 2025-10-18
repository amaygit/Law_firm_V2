// backend/controllers/causelist.js
import axios from "axios";
import * as cheerio from "cheerio";

// Fetch available dates for Allahabad High Court
export const fetchAvailableDates = async (req, res) => {
  try {
    const { court } = req.body;

    if (court !== "allahabad") {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported court. Currently only Allahabad High Court is supported.",
      });
    }

    console.log("📅 Fetching available dates from Allahabad High Court...");

    const dateResponse = await axios.post(
      "https://www.allahabadhighcourt.in/causelist/input1A.jsp",
      new URLSearchParams({ listType: "Z" }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000, // 15 second timeout
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

// Fetch available courts for a specific date
export const fetchAvailableCourts = async (req, res) => {
  try {
    const { court, date } = req.body;

    if (court !== "allahabad") {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported court. Currently only Allahabad High Court is supported.",
      });
    }

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

// Download cause list PDF
export const downloadCauseList = async (req, res) => {
  try {
    const { court, date, courtNo } = req.body;

    if (court !== "allahabad") {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported court. Currently only Allahabad High Court is supported.",
      });
    }

    if (!date || !courtNo) {
      return res.status(400).json({
        success: false,
        message: "Date and court number are required",
      });
    }

    console.log(`📤 Fetching cause list for court ${courtNo} on ${date}...`);

    // Step 1: Get the PDF link
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

    // Extract PDF URL from response
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

    // Step 2: Download the PDF
    const pdfFile = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 seconds for PDF download
    });

    // Generate filename
    const getCourtPrefix = (courtNumber) => {
      if (courtNumber === "-99") return "All";
      if (courtNumber === "0") return "CJ";
      return courtNumber;
    };

    const prefix = getCourtPrefix(courtNo);
    const fileName = `CauseList_${prefix}_${date}.pdf`;

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfFile.data.length);

    console.log("✅ PDF sent successfully:", fileName);

    // Send PDF buffer
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

    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found on the court website.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to download cause list PDF. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
