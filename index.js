require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('DB Connected!'))

const { Schema } = mongoose;
const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true },
});

const Url = mongoose.model('Url', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }
  const urlCount = await Url.countDocuments();
  const newUrl = new Url({ original_url: url, short_url: urlCount + 1 });
  await newUrl.save();
  return res.json({ original_url: url, short_url: urlCount + 1 });
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
