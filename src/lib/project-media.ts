const videoExtension = /\.(mp4|webm|ogg|mov)(?:\?.*)?$/i;

/**
 * Project Markdown stores media as /project-slug/file.ext.
 * Files live in public/images/work/project-slug/file.ext.
 */
export function resolveProjectMedia(source: string) {
  if (source.startsWith('/images/work/')) return source;

  return `/images/work/${source.replace(/^\/+/, '')}`;
}

export function isProjectVideo(source: string) {
  return videoExtension.test(source);
}
