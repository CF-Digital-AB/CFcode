import type { ImgHTMLAttributes } from "react";

export function CFWordmark({ alt = "CF Code", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} src="/apple-touch-icon.png" alt={alt} draggable={false} />;
}

// Keep the old export name for extensions that imported the component directly.
// The rendered asset is now the CF Digital mark.
export const T3Wordmark = CFWordmark;
