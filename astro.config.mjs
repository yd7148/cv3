// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages 專案頁：https://yd7148.github.io/yd7148-v3/
// base 會讓 Astro 自動處理 /_astro/* 與自動產生的路徑；
// 原始碼裡手寫的絕對路徑（/zh/、/images/*…）由 scripts/fix-base.mjs 在建置後補上。
export const REPO = "yd7148-v3";
export const SITE_URL = "https://yd7148.github.io/" + REPO;
// dev 保持根路徑（http://localhost:4321/zh/），只有正式建置才加 /<repo>/ 前綴。
const isProd = process.env.NODE_ENV === "production";
export const BASE = isProd ? "/" + REPO : "";

export default defineConfig({
  site: SITE_URL,
  base: BASE,
  trailingSlash: "always",
  devToolbar: { enabled: false },
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      // 語言選擇頁（/）、個人聯絡資訊（/resume/）與錯誤頁（404）不進 sitemap
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path === "/" || path === "") return false;
        return !/\/(resume|404)\/?$/.test(path);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
