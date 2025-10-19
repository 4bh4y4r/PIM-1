const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Test server is running');
});

app.listen(5001, '0.0.0.0', () => {
  console.log('Test server running on:');
  console.log('- http://localhost:5001');
  console.log('- http://192.168.1.31:5001');
});