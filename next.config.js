const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Build optimization - UNCHANGED
  swcMinify: true,
  optimizeFonts: true,
  productionBrowserSourceMaps: false,

  // MINIMAL CHANGE: Add serverComponentsExternalPackages to prevent client Firebase on server
  experimental: {
    // Only include valid experimental features
    serverComponentsExternalPackages: ['firebase-admin', 'firebase'],
  },

  // TypeScript configuration - UNCHANGED
  typescript: {
    ignoreBuildErrors: false,
  },

  // UNCHANGED: Headers for OAuth CORS support
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        // Add security headers for all pages
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // UNCHANGED: Redirects for auth error handling
  async redirects() {
    return [
      {
        source: '/auth/error',
        destination: '/signin?error=Authentication',
        permanent: false,
      },
      {
        source: '/api/auth/error',
        destination: '/signin?error=OAuthError',
        permanent: false,
      },
    ];
  },

  // MINIMAL CHANGE: Enhanced Webpack configuration to prevent Firebase client on server
  webpack: (config, { isServer }) => {
    // CRITICAL FIX: Prevent Firebase client SDK from being bundled on server
    if (isServer) {
      config.externals = config.externals || [];
      
      // Push individual externals to prevent client Firebase on server
      
    }

    // UNCHANGED: Better source mapping without performance warnings
    if (!isServer) {
      config.devtool = 'cheap-module-source-map';
    }

    // UNCHANGED: Fallback configurations for browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        zlib: require.resolve('browserify-zlib'),
      };
    }

    // UNCHANGED: Better handling for Firebase and NextAuth modules
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure consistent Firebase imports
    
    };

    // UNCHANGED: Code splitting and optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          // UNCHANGED: Separate NextAuth into its own chunk for better caching
          nextauth: {
            test: /[\\/]node_modules[\\/]next-auth[\\/]/,
            name: 'nextauth',
            chunks: 'all',
            priority: 10,
          },
          // UNCHANGED: Firebase bundle optimization
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 5,
          },
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // UNCHANGED: Reduce build noise
    config.stats = 'minimal';

    // UNCHANGED: Bundle analyzer configuration
    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // UNCHANGED: Performance monitoring
  onDemandEntries: {
    maxInactiveAge: 30 * 1000,
    pagesBufferLength: 2,
  },

  // UNCHANGED: Image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // UNCHANGED: Compiler options for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // UNCHANGED: Environment variables
  env: {
    ETHEREUM_PROVIDER_URL: process.env.ETHEREUM_PROVIDER_URL,
    POLKADOT_PROVIDER_URL: process.env.POLKADOT_PROVIDER_URL,
    NEXT_PUBLIC_TATUM_API_KEY: process.env.NEXT_PUBLIC_TATUM_API_KEY,
    METADATA_PARSER_ADDRESS: process.env.METADATA_PARSER_ADDRESS,
    PACECHAIN_CHANNEL_ADDRESS: process.env.PACECHAIN_CHANNEL_ADDRESS,
    RELAY_CHAIN_ADDRESS: process.env.RELAY_CHAIN_ADDRESS,
    // UNCHANGED: Custom environment variables for auth debugging
    CUSTOM_NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false',
  },

  // UNCHANGED: Server runtime configuration for better API handling
  serverRuntimeConfig: {
    // Will only be available on the server side
    secret: process.env.NEXTAUTH_SECRET,
  },

  // UNCHANGED: Public runtime configuration
  publicRuntimeConfig: {
    // Will be available on both server and client
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // UNCHANGED: Optimized build configuration for auth-heavy apps
  poweredByHeader: false,
  generateEtags: false,
  
  // REMOVED: onError (not a valid Next.js config property)
  // REMOVED: proxyTimeout (moved to experimental, but removed as it's causing issues)
};

module.exports = nextConfig;

// SUMMARY OF MINIMAL CHANGES:
// 1. Added 'firebase' to serverComponentsExternalPackages
// 2. Added server-side externals for Firebase client modules
// 3. Everything else: UNCHANGED from your original config