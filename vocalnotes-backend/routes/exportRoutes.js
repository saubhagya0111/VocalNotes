const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph } = require('docx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Use absolute path for the exports directory
const exportDir = path.resolve(__dirname, '../exports');
console.log('Export directory=,${exportDir}');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });  // Ensure the directory is created
}

// Route to export transcribed text as PDF
router.post('/export-pdf', (req, res) => {
    const transcription = req.body.text;
  
    if (!transcription || typeof transcription !== 'string') {
      return res.status(400).json({ message: 'Invalid transcription text' });
    }
  
    const fileName = `transcription-${Date.now()}.pdf`;
    const filePath = path.join(exportDir, fileName);
  
    // Log the path to make sure it's correct
    console.log(`Saving PDF to: ${filePath}`);
  
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
  
    // Write content to PDF and close the stream
    doc.pipe(writeStream);
    doc.text(transcription);
    doc.end();  // Finalize the PDF document
  
    // Handle stream events
    writeStream.on('finish', () => {
      console.log('PDF saved at:', filePath);
      
      // Check if file exists before sending it
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('File does not exist:', filePath);
          return res.status(404).json({ message: 'File not found' });
        }
  
        // Send the file to the client
        res.download(filePath, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            return res.status(500).json({ message: 'Error exporting as PDF' });
          }
          console.log('File sent to the client:', filePath);
  
          // Optionally delete the file after sending it
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      });
    });
  
    writeStream.on('error', (err) => {
      console.error('Stream error during writing:', err);
      res.status(500).json({ message: 'Error during PDF export' });
    });
  });

  

// Route to export transcribed text as Word document
router.post('/export-word', async (req, res) => {
  const transcription = req.body.text;

  if (!transcription) {
    return res.status(400).json({ message: 'No transcription text provided' });
  }

  const doc = new Document();
  const paragraphs = transcription.split('\n').map(line => new Paragraph(line));

  doc.addSection({ children: paragraphs });

  const fileName = `transcription-${Date.now()}.docx`;
  const filePath = path.join(exportDir, fileName);

  try {
    console.log(`Saving Word document to: ${filePath}`);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    console.log('Word document saved at:', filePath);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error exporting as Word document' });
      }
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Error creating Word file:', error);
    res.status(500).json({ message: 'Error exporting as Word document' });
  }
});

// Route to export transcribed text as CSV
router.post('/export-csv', (req, res) => {
  const transcription = req.body.text;

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
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    })
    .catch((err) => {
      console.error('Error writing CSV file:', err);
      res.status(500).json({ message: 'Error exporting as CSV' });
    });
});

module.exports = router;
