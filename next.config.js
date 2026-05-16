module.exports = {
    output: process.env.NODE_ENV === "production" ? "export" : undefined,
    images: { unoptimized: true },
    trailingSlash: true,
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            buffer: false,
        };
        return config;
    },
    devIndicators: false,
}
