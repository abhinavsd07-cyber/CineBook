require("dotenv").config();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Movie = require("../models/Movie");
const Banner = require("../models/Banner");

// Configure the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "abhinav-images-2026";
const REGION = process.env.AWS_REGION || "ap-south-1";

async function processImageUrl(url) {
  if (!url || !url.includes("amazonaws.com") || url.endsWith(".webp")) {
    return url; // Skip local, external non-s3, or already webp images
  }

  try {
    console.log(`Downloading: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const buffer = await res.buffer();

    console.log(`Compressing image to WebP...`);
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const key = `movie-images/${uniqueSuffix}.webp`;

    console.log(`Uploading as ${key}...`);
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: compressedBuffer,
      ContentType: "image/webp",
    });

    await s3Client.send(command);

    const newUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
    console.log(`Success! New URL: ${newUrl}`);
    return newUrl;

  } catch (error) {
    console.error(`Error processing ${url}:`, error.message);
    return url; // Fallback to original on failure
  }
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    // 1. Process Movies
    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies to check.`);
    
    for (let movie of movies) {
      let updated = false;

      if (movie.poster && !movie.poster.endsWith(".webp") && movie.poster.includes("amazonaws.com")) {
        movie.poster = await processImageUrl(movie.poster);
        updated = true;
      }
      if (movie.coverImage && !movie.coverImage.endsWith(".webp") && movie.coverImage.includes("amazonaws.com")) {
        movie.coverImage = await processImageUrl(movie.coverImage);
        updated = true;
      }

      if (updated) {
        await movie.save();
        console.log(`Updated Movie: ${movie.title}`);
      }
    }

    // 2. Process Banners
    const banners = await Banner.find({});
    console.log(`Found ${banners.length} banners to check.`);
    
    for (let banner of banners) {
      let updated = false;

      if (banner.imageUrl && !banner.imageUrl.endsWith(".webp") && banner.imageUrl.includes("amazonaws.com")) {
        banner.imageUrl = await processImageUrl(banner.imageUrl);
        updated = true;
      }

      if (updated) {
        await banner.save();
        console.log(`Updated Banner: ${banner._id}`);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
