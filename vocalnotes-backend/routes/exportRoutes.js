const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph } = require('docx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Use absolute path for the exports directory
const exportDir = path.resolve(__dirname, '../exports');
console.log(`Export directory=${exportDir}`);
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });  // Ensure the directory is created
}

// Route to export transcribed text as word
router.post('/export-word', async (req, res) => {
  const transcription = req.body.text;

  if (!transcription || typeof transcription !== 'string') {
    return res.status(400).json({ message: 'Invalid transcription text' });
  }

  const fileName = `transcription-${Date.now()}.docx`;
  const filePath = path.join(exportDir, fileName);

  try {
    console.log(`Saving Word document to: ${filePath}`);

    // Create a new document and add the transcription as paragraphs
    const doc = new Document({
      sections: [
        {
          children: transcription.split('\n').map(line => new Paragraph(line)), // Add each line as a new paragraph
        },
      ],
    });

    // Generate the Word document buffer
    const buffer = await Packer.toBuffer(doc);

    // Save the document to the file system
    fs.writeFileSync(filePath, buffer);

    console.log('Word document saved at:', filePath);

    // Send the file to the client
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ message: 'Error exporting as Word document' });
      }
      console.log('File sent to the client:', filePath);

      // Optionally, delete the file after sending it
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Error creating Word file:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error exporting as Word document', error: error.message });
    }
  }
});

  

// Route to export transcribed text as Word document
// const exportDir = path.resolve(__dirname, '../exports');
console.log(`Export directory path: ${exportDir}`);

if (!fs.existsSync(exportDir)) {
  console.log('Creating exports directory...');
  fs.mkdirSync(exportDir, { recursive: true });
}

router.post('/export-pdf', (req, res) => {
  const transcription = req.body.text;

  if (!transcription || typeof transcription !== 'string') {
    return res.status(400).json({ message: 'Invalid transcription text' });
  }

  const fileName = `transcription-${Date.now()}.pdf`;
  const filePath = path.join(exportDir, fileName);

  try {
    console.log(`Saving PDF to: ${filePath}`);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);

    // Write content to PDF and close the stream
    doc.pipe(writeStream);
    doc.text(transcription);
    doc.end();  // Finalize the PDF document

    writeStream.on('finish', () => {
      console.log('PDF saved at:', filePath);

      // Send the file to the client
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          return res.status(500).json({ message: 'Error exporting as PDF' });
        }
        console.log('File sent to the client:', filePath);

        // Optionally, delete the file after sending it
        // fs.unlink(filePath, (err) => {
        //   if (err) console.error('Error deleting file:', err);
        // });
      });
    });

    // Handle stream errors
    writeStream.on('error', (err) => {
      console.error('Stream error during writing:', err);
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Error during PDF export' });
      }
    });
  } catch (error) {
    console.error('Error creating PDF file:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'PDF export failed', error: error.message });
    }
  }
});

// Route to export transcribed text as CSV
router.post('/export-csv', (req, res) => {
  const transcription = req.body.text;  // Ensure it's receiving 'text'

  if (!transcription) {
    return res.status(400).json({ message: 'No transcription text provided' });
  }

  const csvData = transcription.split('\n').map((line, index) => ({
    id: index + 1,
    text: line
  }));

  const fileName = `transcription-${Date.now()}.csv`;
  const filePath = path.join(exportDir, fileName);

  console.log(`Saving CSV to: ${filePath}`);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'text', title: 'Transcription' }
    ]
  });

  csvWriter.writeRecords(csvData)
    .then(() => {
      console.log('CSV file saved at:', filePath);
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).json({ message: 'Error exporting as CSV' });
        }
        // Optionally delete the file after sending it
        // fs.unlink(filePath, (err) => {
        //   if (err) console.error('Error deleting file:', err);
        // });
      });
    })
    .catch((err) => {
      console.error('Error writing CSV file:', err);
      res.status(500).json({ message: 'Error exporting as CSV' });
    });
});

module.exports = router;
