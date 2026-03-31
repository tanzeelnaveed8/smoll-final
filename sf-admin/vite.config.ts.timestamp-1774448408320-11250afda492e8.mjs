// vite.config.ts
import { sentryVitePlugin } from "file:///C:/Users/hp/Downloads/smoll-final-main/sf-admin/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/hp/Downloads/smoll-final-main/sf-admin/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/hp/Downloads/smoll-final-main/sf-admin/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Vuetify from "file:///C:/Users/hp/Downloads/smoll-final-main/sf-admin/node_modules/vite-plugin-vuetify/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/hp/Downloads/smoll-final-main/sf-admin/vite.config.ts";
var vite_config_default = defineConfig({
  server: {
    port: 5174,
    proxy: {
      "/admin": { target: "http://localhost:3000", changeOrigin: true },
      "/files": { target: "http://localhost:3000", changeOrigin: true },
      "/specialities": { target: "http://localhost:3000", changeOrigin: true }
    }
  },
  plugins: [vue(), Vuetify({
    autoImport: true,
    styles: {
      configFile: "src/vuetify/styles/settings.scss"
    }
  }), sentryVitePlugin({
    org: "smoll-lo",
    project: "smoll-admin"
  })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxocFxcXFxEb3dubG9hZHNcXFxcc21vbGwtZmluYWwtbWFpblxcXFxzZi1hZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcaHBcXFxcRG93bmxvYWRzXFxcXHNtb2xsLWZpbmFsLW1haW5cXFxcc2YtYWRtaW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2hwL0Rvd25sb2Fkcy9zbW9sbC1maW5hbC1tYWluL3NmLWFkbWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gXCJAc2VudHJ5L3ZpdGUtcGx1Z2luXCI7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IFZ1ZXRpZnkgZnJvbSAndml0ZS1wbHVnaW4tdnVldGlmeSdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzQsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYWRtaW4nOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgICAgJy9maWxlcyc6IHsgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJywgY2hhbmdlT3JpZ2luOiB0cnVlIH0sXG4gICAgICAnL3NwZWNpYWxpdGllcyc6IHsgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJywgY2hhbmdlT3JpZ2luOiB0cnVlIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW3Z1ZSgpLCBWdWV0aWZ5KHtcbiAgICBhdXRvSW1wb3J0OiB0cnVlLFxuICAgIHN0eWxlczoge1xuICAgICAgY29uZmlnRmlsZTogJ3NyYy92dWV0aWZ5L3N0eWxlcy9zZXR0aW5ncy5zY3NzJ1xuICAgIH1cbiAgfSksIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgIG9yZzogXCJzbW9sbC1sb1wiLFxuICAgIHByb2plY3Q6IFwic21vbGwtYWRtaW5cIlxuICB9KV0sXG5cbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxuICAgIH1cbiAgfSxcblxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZVxuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlUsU0FBUyx3QkFBd0I7QUFDNVcsU0FBUyxlQUFlLFdBQVc7QUFFbkMsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sYUFBYTtBQUw2TCxJQUFNLDJDQUEyQztBQVFsUSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxVQUFVLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxLQUFLO0FBQUEsTUFDaEUsVUFBVSxFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLE1BQ2hFLGlCQUFpQixFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLElBQ3pFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLElBQUksR0FBRyxRQUFRO0FBQUEsSUFDdkIsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLElBQ2Q7QUFBQSxFQUNGLENBQUMsR0FBRyxpQkFBaUI7QUFBQSxJQUNuQixLQUFLO0FBQUEsSUFDTCxTQUFTO0FBQUEsRUFDWCxDQUFDLENBQUM7QUFBQSxFQUVGLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
