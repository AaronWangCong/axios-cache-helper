import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  target: 'esnext',
  format: ['esm'],
  // 代码分割
  splitting: true,
  // 源代码
  sourcemap: true,
  // 压缩
  minify: true,
  // 清除目录
  clean: true,
  // 打包不包含
  external: ['axios'],
})
