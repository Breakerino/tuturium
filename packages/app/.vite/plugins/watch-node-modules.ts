import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';
import { rimraf } from 'rimraf';

/**
 * Vite plugin to watch specific node modules for changes
 * @param {string[]} modules - Array of module names to watch
 * @returns {Plugin}
 */
export default function watchNodeModules(modules: string[]): Plugin {
  return {
    name: 'watch-node-modules',
    config() {
      return {
        server: {
          watch: {
            ignored: modules.map(moduleName => `!**/node_modules/${moduleName}/**`)
          }
        }
      };
    },
    configureServer(server) {
      const nodeModulesPath = path.resolve('node_modules');

      const pathsToWatch = modules.map(moduleName => {
        const modulePath = path.join(nodeModulesPath, moduleName);
        if (fs.existsSync(modulePath)) {
          console.log(`[watch-node-modules] Watching module: ${moduleName}`);
          return modulePath;
        } else {
          console.warn(`[watch-node-modules] Module not found: ${moduleName}`);
          return null;
        }
      }).filter((modulePath): modulePath is string => !!modulePath);

      pathsToWatch.forEach(modulePath => {
        server.watcher.add(modulePath);
      });

      server.watcher.on('change', async (filePath) => {
        if (pathsToWatch.some(modulePath => filePath.startsWith(modulePath))) {
          console.log(`[watch-node-modules] Change detected in: ${filePath}`);

          // Clear Vite cache directory
          const cacheDir = server.config.cacheDir;
          if (cacheDir) {
            await new Promise((resolve, reject) => {
							// @ts-ignore
              rimraf(cacheDir, (err) => {
                if (err) {
                  console.error(`[watch-node-modules] Failed to clear cache directory: ${cacheDir}`, err);
                  reject(err);
                } else {
                  console.log(`[watch-node-modules] Cleared cache directory: ${cacheDir}`);
                  resolve(null);
                }
              });
            });
          }

          server.restart();
        }
      });
    }
  };
}
