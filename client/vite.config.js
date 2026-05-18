import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/ProShop/",
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        checkout: resolve(__dirname, "checkout.html"),
        Support: resolve(__dirname, "support.html"),
        logIn: resolve(__dirname, "logIn.html"),
        product: resolve(__dirname, "product.html"),
        profile: resolve(__dirname, "profile.html"),
        signUp: resolve(__dirname, "signUp.html"),
      },
    },
  },
  server: {
    port: 5500,
  },
});
