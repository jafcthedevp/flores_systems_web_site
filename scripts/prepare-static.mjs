import { cp, mkdir } from "node:fs/promises";

const images = new URL("../img/", import.meta.url);
const publicImages = new URL("../public/img/", import.meta.url);

await mkdir(publicImages, { recursive: true });
await cp(images, publicImages, { recursive: true });
