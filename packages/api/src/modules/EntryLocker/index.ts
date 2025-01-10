export interface LockEntry {
	registredAt: number;
	lockedAt: number | null;
	expiresAt: number | null;
	retries: number;
}

export interface EntryLockerProps {
	id: string;
	lifespan: number;
	retries?: number;
}

// IDEA: Move state managment to Redis?

export default class EntryLocker {
	private entries: Record<string, LockEntry> = {};
	private id: string;
	private lifespan: number;
	private maxRetries: number = 1;

	static DEFAULT_EXPIRATION_TIME = 60 * 15 * 1000; // 15 minutes

	/**
	 * Create a new EntryLocker
	 * @param props EntryLockerProps
	 */
	constructor(props: EntryLockerProps) {
		this.id = props.id;
		this.lifespan = props.lifespan;
		this.maxRetries = props?.retries ?? 1;

		this.log(`Created new instance (${JSON.stringify(props)})`);
	}

	/**
	 * Lock entry
	 *
	 * @param entryID
	 * @param options
	 * @returns LockEntry
	 */
	public lock(entryID: string, options?: { lifespan?: number }): LockEntry {
		// Skip if already locked and override not allowed
		//if ( (entryID in this.entries) && options?.override === true ) {
		//	return null;
		//}

		let entry: LockEntry | null = this.getEntry(entryID);

		// Create new entry
		if (!entry) {
			entry = this.registerEntry(entryID);
			this.log(`Registred entry "${entryID}"`);
		}

		// Update retry count
		entry = this.updateEntry(entryID, { retries: entry.retries + 1 });
		this.log(`Entry "${entryID}" retried for ${entry.retries} times`);

		if (entry.retries >= this.maxRetries) {
			const lockedAt = Date.now();

			entry = this.updateEntry(entryID, {
				lockedAt: lockedAt,
				expiresAt: lockedAt + (options?.lifespan ?? this.lifespan),
			});

			this.log(`Locked entry "${entryID}" (${JSON.stringify(entry)})`);

			return entry;
		}

		return entry;
	}

	/**
	 * Check if locked entry is expired
	 *
	 * @param entryID string
	 * @returns boolean|null
	 */
	public isExpired(entryID: string) {
		return this.getEntry(entryID)?.expiresAt ?? 0 < Date.now();
	}

	public expiresAt(entryID: string) {
		return this.getEntry(entryID)?.expiresAt ?? 0;
	}

	/**
	 * Unlock/clear expired entry
	 *
	 * @param entryID string
	 * @param force boolean
	 * @returns boolean|null
	 */
	public unlock(entryID: string, force = false) {
		// Skip not locked entries
		//if (!this.isLocked(entryID)) {
		//	this.log(`Entry "${entryID}" is not locked, skipping...`);
		//	return false;
		//}

		// Allow to unlock entry only if expired or is forced
		const entry = this.getEntry(entryID);
		if (entry === null) {
			return true;
		}

		const isExpired = (entry.expiresAt ?? 0) < Date.now();
		if (!force && !isExpired) {
			const expiresAt = new Date(entry.expiresAt!).toISOString();
			this.log(`Entry "${entryID}" is not expired yet, skipping... (expires at: ${expiresAt})`);
			return false;
		}

		this.log(
			`Cleared entry "${entryID}" (${JSON.stringify({ ...entry, now: Date.now(), force })})`
		);
		this.deleteEntry(entryID);
		return true;
	}

	/**
	 * Unlock/clear all expired entries
	 *
	 * @returns string[]
	 */
	public clearExpiredEntries(): string[] {
		const clearedEntries: string[] = [];

		for (const entryID of Object.keys(this.entries)) {
			if (this.unlock(entryID)) {
				clearedEntries.push(entryID);
			}
		}

		return clearedEntries;
	}

	/**
	 * Check if entry is locked (but can be expired)
	 *
	 * @param entryID
	 * @returns
	 */
	public isLocked(entryID: string): boolean {
		const entry = this.getEntry(entryID);
		if (entry !== null) {
			return entry.lockedAt !== null;
		}
		return false;
	}

	/**
	 *
	 * @param entryID
	 * @returns
	 */
	public entryExists(entryID: string): boolean {
		return entryID in this.entries;
	}

	/**
	 *
	 * @param entryID
	 * @param field
	 * @returns
	 */
	public getEntry(entryID: string): LockEntry | null {
		return this.entries[entryID] || null;
	}

	public getEntries() {
		return this.entries;
	}

	/**
	 *
	 * @param entryID
	 * @returns
	 */
	private registerEntry(entryID: string): LockEntry {
		const entry: LockEntry = {
			registredAt: Date.now(),
			lockedAt: null,
			expiresAt: Date.now() + EntryLocker.DEFAULT_EXPIRATION_TIME,
			//expiresAt: Date.now() + (20 * 1000),
			retries: 0,
		};
		this.entries[entryID] = entry;
		return entry;
	}

	/**
	 *
	 * @param entryID
	 * @param data
	 */
	private updateEntry(entryID: string, data: Partial<LockEntry>): LockEntry {
		const entry = this.entries[entryID];
		if (entry === undefined) {
			throw new Error(`[LockEntry.updateEntry] Entry '${entryID}' does not exist`);
		}

		const updatedEntry: LockEntry = {
			...entry,
			...data,
		};
		this.entries[entryID] = updatedEntry;
		return updatedEntry;
	}

	/**
	 *
	 * @param entryID
	 */
	private deleteEntry(entryID: string) {
		delete this.entries[entryID];
	}

	private log(message, level = 'debug') {
		//if ( ! (level in strapi.log) ) {
		//	return;
		//}
		strapi.log[level](`[EntryLocker | ${this.id}] ${message}`);
	}
}
