
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/image-to-pdf', upload.array('images'), (req, res) => {
  // Simulate success
  res.send('Image to PDF conversion success!');
});

app.post('/api/combine-pdfs', upload.array('pdfs'), (req, res) => {
  res.send('PDFs combined successfully!');
});

app.post('/api/split-pdf', upload.single('pdf'), (req, res) => {
  res.send('PDF split done!');
});

app.post('/api/compress-image', upload.single('image'), (req, res) => {
  res.send('Image compressed successfully!');
});

app.post('/api/compress-pdf', upload.single('pdf'), (req, res) => {
  res.send('PDF compressed successfully!');
});

app.listen(port, () => {
  console.log(`PDF Tool backend running at http://localhost:${port}`);
});
