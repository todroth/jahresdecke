export class WeatherData {

    readonly timestamp: string;
    readonly temperature: number | null;

    constructor(timestamp: string, temperature: number | null) {
        this.timestamp = timestamp;
        this.temperature = temperature;
    }
}