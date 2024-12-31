'use client';

export class Color {

    readonly min: number | null;
    readonly max: number | null;
    readonly label: string;
    readonly id: string;
    readonly dyelot: string;
    readonly hexCode: string;

    constructor(min: number | null, max: number | null, label: string, id: string, dyelot: string, hexCode: string) {
        this.min = min;
        this.max = max;
        this.label = label;
        this.id = id;
        this.dyelot = dyelot;
        this.hexCode = hexCode;
    }

    matches(temp: number): boolean {

        if (this.min !== null && this.max !== null) {
            return temp >= this.min && temp < this.max;
        }

        if (this.min !== null) {
            return temp >= this.min;
        }

        if (this.max !== null) {
            return temp < this.max;
        }

        return false;

    }

    range(): string {

        if (this.min !== null && this.max !== null) {
            return `${this.min}°C - ${this.max}°C`;
        }

        if (this.min !== null) {
            return `> ${this.min}°C`;
        }

        if (this.max !== null) {
            return `< ${this.max}°C`;
        }

        return '';

    }

}