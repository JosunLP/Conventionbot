export default class Helper {

	/**
	 * Sleeps helper
	 * @param ms
	 * @returns
	 */
	public static sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	/**
	 * Waits for
	 * @param condition
	 * @param [timeout]
	 * @returns
	 */
	public static async waitFor(condition: () => boolean, timeout = 10000) {
		const start = Date.now();
		while (Date.now() < start + timeout) {
			if (condition()) return;
			await this.sleep(100);
		}
		throw new Error("Timeout");
	}
}
