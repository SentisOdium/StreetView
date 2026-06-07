import * as THREE from "three";

const textureCache = new Map<string, THREE.Texture>();

export const loadTexture = (url: string): Promise<THREE.Texture> => {
  if (textureCache.has(url)) {
    return Promise.resolve(textureCache.get(url)!);
  }

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.offset.x = 1;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        textureCache.set(url, texture);
        resolve(texture);
      },
      undefined,
      (err) => {
        console.group("TEXTURE ERROR");
        console.log("URL:", url);
        console.dir(err);
        console.log(err);
        console.groupEnd();

        reject(err);
      }
    );
  });
};

export const getCachedTexture = (url: string): THREE.Texture | undefined => {
  return textureCache.get(url);
};
