import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === "development" && componentTagger(),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\./i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "api-cache",
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 24 * 60 * 60, // 24 hours
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "images",
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                            },
                        },
                    },
                    {
                        urlPattern: new RegExp("/*"),
                        handler: "StaleWhileRevalidate",
                        options: {
                            cacheName: "all-cache",
                            cacheableResponse: {
                                statuses: [200],
                            },
                        },
                    },
                ],
            },
            includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
            manifest: {
                name: "Progress",
                short_name: "Progress",
                start_url: "/",
                display: "standalone",
                background_color: "#000",
                theme_color: "#000",
                icons: [
                    {
                        src: "icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
