'use client';

export class LocalStorage {

    static contains(date: string): boolean {
        return localStorage.getItem(date) !== null;
    }

    static set(date: string, temperature: number): void {
        const weatherDataStr = JSON.stringify(temperature);
        localStorage.setItem(date, weatherDataStr);
    }

    static get(date: string): number | null {

        const temperatureStr = localStorage.getItem(date);

        if (!temperatureStr) {
            return null;
        }

        return Number.parseFloat(temperatureStr);

    }

}