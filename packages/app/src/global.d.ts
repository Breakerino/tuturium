declare global {
	// TODO: Infer types from passed object (is possible)
	interface ObjectConstructor {
		entries<K, V>(o): ([K, V])[]
	}
}