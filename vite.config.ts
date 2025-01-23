import { defineConfig } from "vite";
import path from "path";
import fg from "fast-glob";
import dts from "vite-plugin-dts";

const inputFiles = Object.fromEntries(
   fg.sync('src/**/*.ts').map(file => [
       /* Remove `src/` and `.ts` extension for the output path */
       file.slice(4, -3),
       path.resolve(__dirname, file)
   ])
);

export default defineConfig({
    base: "./",
    plugins: [dts()],
    build: {
        rollupOptions: {
            input: inputFiles,
            external: ["focus-trap", "mitt", "cropperjs"],
            preserveEntrySignatures: 'exports-only',
            output: [
                {
                    format: 'es', // ES Modules
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name]-[hash].js',
                    assetFileNames: '[name]-[hash].[ext]',
                    sourcemap: true,
                    exports: 'named',
                    globals: {
                        'focus-trap': 'createFocusTrap',
                        mitt: 'mitt',
                        cropperjs: 'Cropper',
                    },
                },
                {
                    format: 'cjs', // CommonJS Modules
                    entryFileNames: '[name].cjs',
                    chunkFileNames: '[name]-[hash].cjs',
                    assetFileNames: '[name]-[hash].[ext]',
                    sourcemap: true,
                    exports: 'named',
                    globals: {
                        'focus-trap': 'createFocusTrap',
                        mitt: 'mitt',
                        cropperjs: 'Cropper',
                    },
                },
            ],
        },
        minify: true,
    },
});
