/**
 * Image preprocessing utilities to improve OCR accuracy
 */

/**
 * Preprocess image for better OCR results
 * - Convert to grayscale
 * - Increase contrast
 * - Sharpen
 * - Resize to optimal size
 */
export async function preprocessImageForOCR(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      try {
        // Set canvas size - scale up small images, limit large ones
        const maxDimension = 2400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        } else if (width < 800 && height < 800) {
          // Scale up small images
          const ratio = Math.min(1600 / width, 1600 / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale conversion
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Increase contrast (simple threshold)
          const contrast = gray < 128 ? gray * 0.8 : gray * 1.2;
          const value = Math.min(255, Math.max(0, contrast));
          
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
          // data[i + 3] is alpha, leave unchanged
        }

        // Apply sharpening filter
        const sharpenKernel = [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ];
        const sharpened = applyConvolution(imageData, sharpenKernel, width, height);
        
        // Put processed image back
        ctx.putImageData(sharpened, 0, 0);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.95
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Apply convolution filter (for sharpening, edge detection, etc.)
 */
function applyConvolution(
  imageData: ImageData,
  kernel: number[],
  width: number,
  height: number
): ImageData {
  const src = imageData.data;
  const dst = new ImageData(width, height);
  const dstData = dst.data;
  const kernelSize = Math.sqrt(kernel.length);
  const half = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const i = (py * width + px) * 4;
          const weight = kernel[ky * kernelSize + kx];

          r += src[i] * weight;
          g += src[i + 1] * weight;
          b += src[i + 2] * weight;
        }
      }

      const i = (y * width + x) * 4;
      dstData[i] = Math.min(255, Math.max(0, r));
      dstData[i + 1] = Math.min(255, Math.max(0, g));
      dstData[i + 2] = Math.min(255, Math.max(0, b));
      dstData[i + 3] = src[i + 3]; // Alpha
    }
  }

  return dst;
}

/**
 * Convert blob to base64 for AI APIs
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

