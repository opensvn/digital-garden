module.exports = {
    output: "export",
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
