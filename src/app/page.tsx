'use client';

import React, {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isToday from 'dayjs/plugin/isToday';
import {Color} from '@/app/Color';
import 'dayjs/locale/de';
import {LocalStorage} from "@/app/LocalStorage";
import {WeatherData} from "@/app/WeatherData";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.locale('de');

export default function Home() {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [count, setCount] = useState<Record<string, number>>({});

    const colors = [
        new Color(null, 0, 'Mintgrün', '21', '3901', '#d5e3ca'),
        new Color(0, 3, 'Meeresgrün', '62', '1014', '#7B9A9B'),
        new Color(3, 6, 'Hellgrau', '23', '0906', '#C6C3C5'),
        new Color(6, 9, 'Zink', '24', '0425', '#82798B'),
        new Color(9, 12, 'Pistazie', '69', '3901', '#C7BB8D'),
        new Color(12, 15, 'Moosgrün', '25', '1014', '#A1A27D'),
        new Color(15, 18, 'Mandel', '68', '1014', '#C39070'),
        new Color(18, 21, 'Amethyst', '64', '3403', '#B87F8F'),
        new Color(21, 24, 'Rost', '65', '3901', '#D0694F'),
        new Color(24, 27, 'Wüstenrose', '63', '0226', '#EBBBAA'),
        new Color(27, null, 'Pfirsich', '27', '0226', '#F4AF92'),
    ];

    const nullColor = new Color(null, null, '—', '', '', '#333333');

    useEffect(() => {

        const fetchWeather = async () => {
            const today = dayjs();
            const pastYear = today.subtract(365, 'day');

            const promises: Promise<WeatherData[]>[] = [];
            for (let d = today; d.isAfter(pastYear) || d.isSame(pastYear, 'day'); d = d.subtract(1, 'day')) {

                if (d.isToday() && dayjs().hour() < 12) {
                    continue;
                }

                const date = d.format('YYYY-MM-DD');

                if (LocalStorage.contains(date)) {
                    promises.push(fetchFromLocalStorage(date));
                } else {
                    promises.push(fetchFromApi(date));
                }

            }

            try {

                const results = await Promise.all(promises);
                const flattenedResults = results.flat();

                setWeatherData(flattenedResults);
                setInLocalStorage(flattenedResults);

                const colorCount = calculateColorCount(flattenedResults);
                setCount(colorCount);

            } catch (error) {
                console.error('Error fetching weather data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();

    }, []);

    const fetchFromLocalStorage = (date: string): Promise<WeatherData[]> => {

        const timestamp = dayjs(date).set('hour', 12).toString();
        const weatherData = new WeatherData(timestamp, LocalStorage.get(date));

        console.log(`Get LocalStorage: ${date} - ${weatherData.temperature}`);

        return new Promise<WeatherData[]>((resolve) => {
            resolve([weatherData]);
        });

    };

    const fetchFromApi = (date: string): Promise<WeatherData[]> => {

        const lat = 47.66;
        const lon = 9.18;

        return fetch(`https://api.brightsky.dev/weather?lat=${lat}&lon=${lon}&date=${date}`)
            .then((response) => response.json())
            .then((data) => {
                return data.weather.filter((entry: WeatherData) => {
                    const hour = dayjs(entry.timestamp).hour();
                    return hour === 12; // Filter for 12 o'clock UTC
                });
            });

    };

    const setInLocalStorage = (weatherDataArr: WeatherData[]): void => {

        weatherDataArr
            .filter(weatherData => !dayjs(weatherData.timestamp).isToday())
            .filter(weatherData => weatherData.temperature !== null)
            .forEach(weatherData => {
                const date = dayjs(weatherData.timestamp).format('YYYY-MM-DD');
                LocalStorage.set(date, weatherData.temperature!)

                console.log(`Set LocalStorage: ${date} - ${weatherData.temperature}`);

            })

    };

    const calculateColorCount = (weatherDataArr: WeatherData[]): Record<string, number> => {

        const grouped = weatherDataArr.reduce((acc: Record<string, WeatherData[]>, result) => {
            const color = getColor(result.temperature);
            acc[color.id] = acc[color.id] || [];
            acc[color.id].push(result);
            return acc;
        }, {});

        return Object.fromEntries(
            Object.entries(grouped).map(([key, value]) => [key, value.length])
        );

    }

    const getWeekDay = (dateString: string): string => {
        return dayjs(dateString).format('dddd');
    };

    const getTemperature = (temp: number | null): string => {
        return temp === null ? '—' : temp + '°C';
    };

    const getDate = (dateString: string): string => {
        return dayjs(dateString).format('DD.MM.');
    };

    const getColor = (temp: number | null): Color => {
        if (temp === null) {
            return nullColor;
        }

        return colors.find((color) => color.matches(temp))!;
    };

    const isWeekend = (dateString: string): boolean => {
        const date = dayjs(dateString);
        return [0, 6].includes(date.day());
    };

    return (
        <div>
            <h2>Farben</h2>

            <table border={1}>
                <thead>
                <tr>
                    <th>Spanne</th>
                    <th>Name</th>
                    <th>Farbe</th>
                    <th>Dyelot</th>
                    <th style={{width: 100}}></th>
                    <th>Anzahl</th>
                </tr>
                </thead>
                <tbody>
                {colors.map((color) => (
                    <tr key={color.id}>
                        <td>{color.range()}</td>
                        <td>{color.label}</td>
                        <td>{color.id}</td>
                        <td>{color.dyelot}</td>
                        <td style={{background: color.hexCode}}></td>
                        <td>{count[color.id] || 0}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2>Temperaturen</h2>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <table border={1}>
                    <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Wochentag</th>
                        <th>Temperatur</th>
                        <th>Farbe</th>
                        <th style={{width: 100}}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {weatherData.map((entry, index) => (
                        <tr
                            key={index}
                            style={{
                                color: isWeekend(entry.timestamp) ? '#666666' : undefined,
                            }}
                        >
                            <td>{getDate(entry.timestamp)}</td>
                            <td>{getWeekDay(entry.timestamp)}</td>
                            <td>{getTemperature(entry.temperature)}</td>
                            <td>{getColor(entry.temperature).label}</td>
                            <td
                                style={{
                                    background: isWeekend(entry.timestamp)
                                        ? undefined
                                        : getColor(entry.temperature).hexCode,
                                }}
                            ></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
