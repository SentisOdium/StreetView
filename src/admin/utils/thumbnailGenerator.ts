/**
 * Generates a compressed WebP thumbnail for a given image File.
 * Resizes the image to fit within maxDimensions (e.g. 400px width/height).
 */
export function compressImage(file: File, maxDimension: number, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D context from canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image blob"));
              return;
            }

            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const suffix = maxDimension <= 400 ? "_thumb" : "";
            const newFile = new File([blob], `${originalNameWithoutExt}${suffix}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(newFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function generateThumbnail(file: File, maxDimension = 400): Promise<File> {
  return compressImage(file, maxDimension, 0.75);
}

