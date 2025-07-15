import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import PDFMerger from "pdf-merger-js";
import { PDFDocument } from "pdf-lib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// 🖼️ Image to PDF
app.post("/api/image-to-pdf", upload.single("file"), async (req, res) => {
  const imagePath = req.file.path;
  const pdfPath = `${imagePath}.pdf`;

  try {
    const doc = await PDFDocument.create();
    const imageBytes = fs.readFileSync(imagePath);
    const image = await doc.embedJpg(imageBytes).catch(() => doc.embedPng(imageBytes));
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

    const pdfBytes = await doc.save();
    fs.writeFileSync(pdfPath, pdfBytes);
    res.download(pdfPath, () => {
      fs.unlinkSync(imagePath);
      fs.unlinkSync(pdfPath);
    });
  } catch (err) {
    res.status(500).send("Failed to convert image to PDF");
  }
});

// 📎 Combine PDFs
app.post("/api/combine-pdf", upload.array("files"), async (req, res) => {
  const merger = new PDFMerger();
  try {
    for (let file of req.files) {
      await merger.add(file.path);
    }
    const combinedPath = "uploads/combined.pdf";
    await merger.save(combinedPath);
    res.download(combinedPath, () => {
      req.files.forEach(f => fs.unlinkSync(f.path));
      fs.unlinkSync(combinedPath);
    });
  } catch {
    res.status(500).send("Failed to combine PDFs");
  }
});

// ✂️ Split PDF (first page only)
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  const pdfBytes = fs.readFileSync(req.file.path);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();
  const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
  newPdf.addPage(firstPage);
  const output = await newPdf.save();
  const outPath = `${req.file.path}-split.pdf`;
  fs.writeFileSync(outPath, output);
  res.download(outPath, () => {
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(outPath);
  });
});

// 📉 Compress PDF (re-save with reduced quality)
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
  try {
    const inputBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(inputBytes);
    const outputBytes = await pdfDoc.save({ useObjectStreams: false });
    const outPath = `${req.file.path}-compressed.pdf`;
    fs.writeFileSync(outPath, outputBytes);
    res.download(outPath, () => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outPath);
    });
  } catch {
    res.status(500).send("PDF compression failed");
  }
});

// 📷 Compress Image
app.post("/api/compress-image", upload.single("file"), async (req, res) => {
  const input = req.file.path;
  const output = `${input}-compressed.jpg`;
  try {
    await sharp(input)
      .jpeg({ quality: 60 })
      .toFile(output);
    res.download(output, () => {
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    });
  } catch {
    res.status(500).send("Image compression failed");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
