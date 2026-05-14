const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const cvRoutes = require('./routes/cvRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/cv', cvRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});