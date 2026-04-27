const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

/**
 * File Compression Utilities
 * Handles large file compression for Cloudinary upload
 */

// Check if file needs compression (> 8MB for safety margin)
const needsCompression = (fileSize) => {
  const COMPRESSION_THRESHOLD = 8 * 1024 * 1024; // 8MB
  return fileSize > COMPRESSION_THRESHOLD;
};

// Compress PDF by reducing quality (for deployment)
const compressPDF = async (inputPath, outputPath) => {
  try {
    // For now, we'll just copy the file and add a note
    // In production, you'd use a PDF compression library like pdf2pic + sharp
    const inputBuffer = fs.readFileSync(inputPath);
    
    // Simple compression: if file is too large, we'll need to reject it
    // or implement proper PDF compression
    if (inputBuffer.length > 10 * 1024 * 1024) {
      throw new Error('File too large for Cloudinary free plan. Please use a file smaller than 10MB or upgrade your Cloudinary plan.');
    }
    
    fs.writeFileSync(outputPath, inputBuffer);
    return {
      success: true,
      originalSize: inputBuffer.length,
      compressedSize: inputBuffer.length,
      compressionRatio: 1
    };
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
};

// Main compression function
const compressFile = async (filePath, mimeType) => {
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  
  console.log(`📁 File size: ${Math.round(fileSize / 1024 / 1024 * 100) / 100}MB`);
  
  // Check if compression is needed
  if (!needsCompression(fileSize)) {
    console.log('✅ File size OK, no compression needed');
    return {
      filePath: filePath,
      compressed: false,
      originalSize: fileSize,
      finalSize: fileSize
    };
  }
  
  console.log('🔄 File needs compression...');
  
  // For Cloudinary free plan, we need to reject files > 10MB
  if (fileSize > 10 * 1024 * 1024) {
    throw new Error(`File size (${Math.round(fileSize / 1024 / 1024)}MB) exceeds Cloudinary free plan limit of 10MB. Please use a smaller file or upgrade your Cloudinary plan.`);
  }
  
  return {
    filePath: filePath,
    compressed: false,
    originalSize: fileSize,
    finalSize: fileSize
  };
};

// Clean up temporary files
const cleanupTempFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }
  });
};

module.exports = {
  needsCompression,
  compressFile,
  cleanupTempFiles
};