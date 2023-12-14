/**
 * Csvimporter class
 */
export default class CSVImporter {

	/**
	 * Imports CSV data into JSON
	 * @param csvData CSV data as string
	 * @returns JSON data
	 */
	public static importCSV<T>(csvData: string): T[] {
		const lines = csvData.split("\n");
		const headers = lines[0].split(",");

		const result = [];

		for (let i = 1; i < lines.length; i++) {
			const obj: { [key: string]: any } = {};
			const currentline = lines[i].split(",");

			for (let j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentline[j];
			}

			result.push(obj);
		}

		return result as T[];
	}

	/**
	 * Exports JSON data to CSV
	 * @param jsonData JSON data
	 * @returns CSV data as string
	 */
	public static exportCSV(jsonData: any[]): string {
		const headers = Object.keys(jsonData[0]);
		let csv = headers.join(",") + "\n";

		for (const item of jsonData) {
			const values = Object.values(item);
			csv += values.join(",") + "\n";
		}

		return csv;
	}
}
