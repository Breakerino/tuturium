import { DEFAULT_LOGGER_LABEL } from '@/app/constants';

export type LogLevel = 'info' | 'debug' | 'warn' | 'error' | 'table';

export const LOG_LEVELS: LogLevel[] = ['info', 'debug', 'warn', 'error', 'table']

const useLogger = (label = '', prefix = DEFAULT_LOGGER_LABEL) => {
	const logMessage = (type: LogLevel, message: string | any, ...data: any) => {
		if (['debug'].includes(type) && ! import.meta.env.DEBUG_MODE) {
			return;
		}

		console[type](`[${prefix}${label ? ` - ${label}` : ''}] ${message}`, ...(data ?? undefined));
	}

	const logTable = (data: any, keys?: any) => {
		if (! import.meta.env.DEBUG_MODE) {
			return;
		}
		console.table(data, keys);
	}

	return {
		...Object.fromEntries([
			...LOG_LEVELS.map(type => [type, (message: string, ...data: any) => logMessage(type, message, data)]),
			['table', logTable]
		]),
	}
}

export default useLogger;