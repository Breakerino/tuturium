import { defineConfig, loadEnv } from "vite";

import { getProjectBuildOptions, getProjectDefaultConfig, getProjectDefinitionsOptions, getProjectPluginsOptions, getProjectPreviewOptions, getProjectServerOptions } from './.vite/functions';
import { dependencies } from './.vite/constants';
import path from 'path';

export default defineConfig(({ mode }) => {
	const workspaceRoot = path.join(__dirname, '..', '..');
	const rootPath = process.cwd();

	const env = loadEnv(mode, process.cwd(), "");
	const sharedEnv = workspaceRoot ? loadEnv(mode, workspaceRoot, "") : {};

	const options = { mode, env, sharedEnv, rootPath, workspaceRoot, dependencies };

	const config = {
		...getProjectDefaultConfig(options),
		define: getProjectDefinitionsOptions(options),
		plugins: getProjectPluginsOptions(options),
		server: getProjectServerOptions(options),
		preview: getProjectPreviewOptions(options),
		build: getProjectBuildOptions(options),
	};
	
	return config;
});