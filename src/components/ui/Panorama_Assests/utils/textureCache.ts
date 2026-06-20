import * as THREE from "three";

const textureCache = new Map<string, THREE.Texture>();

const blobCache = new Map<string, Blob>();
const MAX_BLOBS = 10;

const storeBlob = (url: string, blob: Blob) => {
  blobCache.set(url, blob);
  if (blobCache.size > MAX_BLOBS) {
    const oldestKey = blobCache.keys().next().value;
    if (oldestKey !== undefined) {
      blobCache.delete(oldestKey);
    }
  }
};

const pendingFetches = new Map<string, Promise<Blob>>();
const pendingDecodes = new Map<string, Promise<THREE.Texture>>();

export const loadTexture = async (url: string): Promise<THREE.Texture> => {
  if (textureCache.has(url)) return textureCache.get(url)!;
  if (pendingDecodes.has(url)) return pendingDecodes.get(url)!;

  const decodePromise = (async () => {
    let blobPromise = pendingFetches.get(url);
    if (!blobPromise) {
      const cachedBlob = blobCache.get(url);
      if (cachedBlob) {
        blobPromise = Promise.resolve(cachedBlob);
      } else {
        blobPromise = fetch(url, { mode: "cors" }).then((r) => r.blob());
        pendingFetches.set(url, blobPromise);

        blobPromise.finally(() => {
          if (pendingFetches.get(url) === blobPromise) {
            pendingFetches.delete(url);
          }
        });
      }
    }

    try {
      const blob = await blobPromise;
      const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
      
      const texture = new THREE.Texture(imageBitmap);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.x = -1;
      texture.offset.x = 1;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      
      textureCache.set(url, texture);
      return texture;
    } catch (err) {
      console.error("TEXTURE ERROR", url, err);
      throw err;
    } finally {
      pendingDecodes.delete(url);
    }
  })();

  pendingDecodes.set(url, decodePromise);
  return decodePromise;
};

export const getCachedTexture = (url: string): THREE.Texture | undefined => {
  return textureCache.get(url);
};

export const preloadTextureLowPriority = (url: string) => {
  if (textureCache.has(url) || pendingFetches.has(url) || pendingDecodes.has(url) || blobCache.has(url)) return;
  
  const promise = fetch(url, { priority: "low", mode: "cors" } as RequestInit)
    .then((r) => r.blob())
    .then((blob) => {
      storeBlob(url, blob);
      return blob;
    })
    .catch((err) => {
      console.warn("Failed to preload texture:", url, err);
      throw err;
    });
    
  pendingFetches.set(url, promise);
  
  promise.finally(() => {
    if (pendingFetches.get(url) === promise) {
      pendingFetches.delete(url);
    }
  });
};
