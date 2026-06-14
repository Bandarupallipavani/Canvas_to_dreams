/**
 * Injects Cloudinary image transformation options (auto format, auto quality, custom width)
 * into Cloudinary URLs to optimize asset load sizes for mobile networks.
 */
export function getOptimizedImageUrl(url, width = 600) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return url
  }
  const parts = url.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}`
  }
  return url
}
