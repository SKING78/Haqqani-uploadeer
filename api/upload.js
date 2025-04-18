// File: /api/upload.js (Vercel Serverless Function) import formidable from 'formidable'; import fs from 'fs'; import aws from 'aws-sdk';

export const config = { api: { bodyParser: false } };

const handler = async (req, res) => { if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

const form = new formidable.IncomingForm({ multiples: false }); form.parse(req, async (err, fields, files) => { if (err) return res.status(500).json({ error: 'Form parsing error' });

const file = files.video;
const title = fields.title || 'haqqani-video';
const fileStream = fs.createReadStream(file.filepath);
const key = `haqqani_${Date.now()}_${file.originalFilename}`;

// Archive.org S3-compatible setup
const s3 = new aws.S3({
  endpoint: 'https://s3.us.archive.org',
  accessKeyId: 'FW7x4cknX0iMBDN1',
  secretAccessKey: 'V3PWWvXdWlylUGa0',
  region: 'us-east-1',
  signatureVersion: 'v4'
});

try {
  await s3.putObject({
    Bucket: 'haqqanijan30', // this is your archive.org username
    Key: key,
    Body: fileStream,
    ACL: 'public-read',
    Metadata: {
      'title': title,
      'mediatype': 'movies'
    }
  }).promise();

  return res.status(200).json({
    message: 'Upload successful',
    url: `https://archive.org/download/${key}/${file.originalFilename}`
  });
} catch (uploadErr) {
  return res.status(500).json({ error: uploadErr.message });
}

}); };

export default handler;

