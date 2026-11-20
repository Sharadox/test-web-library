export interface SocialImageSuiteOptions {
  /** The site's languages: each serves every image. */
  locales: readonly string[];
  /** The images and their sizes: metadata-web-library's `SOCIAL_IMAGES`. */
  images: Readonly<Record<string, { width: number; height: number }>>;
}
