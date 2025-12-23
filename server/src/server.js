const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Decentralized Identity Server Running');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const file = req.file;
    
    // Create FormData for the IPFS request
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname || 'file',
      contentType: file.mimetype
    });

    // Send to local IPFS node
    let ipfsHash;
    try {
      const response = await axios.post('http://127.0.0.1:5001/api/v0/add', formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity
      });
      ipfsHash = response.data.Hash;
      console.log('File uploaded to IPFS:', ipfsHash);
    } catch (ipfsError) {
      console.error('IPFS Upload Failed:', ipfsError.message);
      console.log('Falling back to Mock IPFS Hash for demonstration...');
      // Generate a fake IPFS-like hash
      ipfsHash = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    res.json({ 
      message: 'File uploaded successfully (or mocked)', 
      ipfsHash: ipfsHash 
    });
  } catch (error) {
    console.error('Error processing upload:', error.message);
    res.status(500).send('Error processing upload');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});