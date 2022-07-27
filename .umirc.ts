import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'pitaya-app-best-practices',
  favicon: 'https://avatars.githubusercontent.com/u/74942048',
  logo: 'https://avatars.githubusercontent.com/u/74942048',
  outputPath: 'docs-dist',
  mode: 'site',
  locales: [['zh-CN', '中文']],
  resolve: {
    passivePreview: true,
  },
});
