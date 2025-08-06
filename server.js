// npm i express puppeteer-core
import express from 'express';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

// Serve the front-end
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));

// Accept HTML upload & return PDF
app.post('/convert', express.raw({ type: 'multipart/form-data', limit: '10mb' }), async (req, res) => {
  const boundary = req.headers['content-type'].split('boundary=')[1];
  const raw = req.body.toString();
  const start = raw.indexOf('\r\n\r\n') + 4;
  const end = raw.lastIndexOf(`--${boundary}--`);
  const html = raw.slice(start, end - 2).toString(); // crude but works for demo

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  res.set('Content-Type', 'application/pdf');
  res.send(pdf);
});

app.listen(port, () => console.log(`Server on http://localhost:${port}`));
