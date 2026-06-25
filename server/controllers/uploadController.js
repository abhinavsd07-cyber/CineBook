const asyncHandler = require("express-async-handler");
const fetch = require("node-fetch");

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../middleware/uploadMiddleware");
const sharp = require("sharp");

// @desc    Upload an image to S3
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file");
  }

  // Compress and convert to WebP using sharp
  const compressedBuffer = await sharp(req.file.buffer)
    .webp({ quality: 80 })
    .toBuffer();

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const key = `movie-images/${uniqueSuffix}.webp`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME || "abhinav-images-2026";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: compressedBuffer,
    ContentType: "image/webp",
  });

  await s3Client.send(command);

  const region = process.env.AWS_REGION || "ap-south-1";
  const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    url: s3Url, // Public S3 URL
  });
});

// @desc    Proxy an external image to bypass CORS limits
// @route   GET /api/proxy-image
// @access  Public
const proxyImage = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400);
    throw new Error("URL parameter is required");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.buffer();
    
    res.set("Content-Type", contentType);
    res.set("Access-Control-Allow-Origin", "*");
    res.send(buffer);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to proxy image: " + error.message);
  }
});

module.exports = {
  uploadImage,
  proxyImage,
};
