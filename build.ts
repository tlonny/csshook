import dts from "bun-plugin-dts"

await Bun.build({
    entrypoints: ['./index.ts'],
    outdir: './build',
    minify: true,
    plugins: [dts()]
  });
  