module.exports = {
  // Ceci indique à Next.js de traiter les fichiers HTML directement
  trailingSlash: true,
  // Configuration pour que les fichiers statiques soient correctement servis
  images: {
    domains: ['images.unsplash.com'],
  },
  // Permet aux API routes de fonctionner sans framework complet
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}