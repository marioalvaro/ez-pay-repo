
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001; // or another available port


app.use(cors());
app.use(bodyParser.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
