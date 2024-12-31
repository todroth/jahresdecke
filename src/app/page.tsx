'use client'

import React, {useState, useEffect} from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isToday from 'dayjs/plugin/isToday';
import {Color} from "@/app/Color";
import 'dayjs/locale/de';

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.locale('de');

export default function Home() {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState({});

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
        new Color(27, null, 'Pfirsich', '27', '0226', '#F4AF92')
    ];

    useEffect(() => {
        async function fetchWeather() {
            const lat = 47.66;
            const lon = 9.18;
            const today = dayjs();
            const pastYear = today.subtract(365, 'day');

            const promises = [];
            for (let d = today; d.isAfter(pastYear) || d.isSame(pastYear, 'day'); d = d.subtract(1, 'day')) {
                const date = d.format('YYYY-MM-DD');

                if (d.isToday() && dayjs().utc().hour() < 12) {
                    continue;
                }

                promises.push(
                    fetch(`https://api.brightsky.dev/weather?lat=${lat}&lon=${lon}&date=${date}`)
                        .then((response) => response.json())
                        .then((data) => {
                            return data.weather.filter((entry: { timestamp: string }) => {
                                const hour = dayjs(entry.timestamp).utc().hour();
                                return hour === 12; // Filter for 12 o'clock UTC
                            });
                        })
                );
            }

            try {

                const results = await Promise.all(promises);
                const flattenedResults: any[] = results.flat();

                // @ts-ignore
                setWeatherData(flattenedResults);

                const grouped = Object.groupBy(flattenedResults, result => getColor(result.temperature).id);
                const colorCount = Object.entries(grouped).reduce((acc, [key, value]) => {
                    acc[key] = value.length;
                    return acc;
                }, {});
                setCount(colorCount);

            } catch (error) {
                console.error('Error fetching weather data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    function getWeekDay(dateString: string) {
        return dayjs(dateString).format('dddd');
    }

    function getDate(dateString: string) {
        return dayjs(dateString).format('DD.MM.');
    }

    function getColor(temp: number): Color {
        return colors.filter(color => color.matches(temp))[0];
    }

    return (
        <div>
            <h2>Farben</h2>

            <table border={1}>
                <thead>
                <tr>
                    <th>Range</th>
                    <th>Name</th>
                    <th>Colour</th>
                    <th>Dyelot</th>
                    <th style={{width: 100}}></th>
                    <th>Count</th>
                </tr>
                </thead>
                <tbody>
                {colors.map(color => (
                    <tr key={color.id}>
                        <td>{color.range()}</td>
                        <td>{color.label}</td>
                        <td>{color.id}</td>
                        <td>{color.dyelot}</td>
                        <td style={{background: color.hexCode}}></td>
                        <td>{count[color.id]}</td>
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
                        <th style={{width: 100}}> </th>
                    </tr>
                    </thead>
                    <tbody>
                    {weatherData.map((entry: { timestamp: string, temperature: number }, index) => (
                        <tr key={index}>
                            <td>{getDate(entry.timestamp)}</td>
                            <td>{getWeekDay(entry.timestamp)}</td>
                            <td>{entry.temperature}°C</td>
                            <td>{getColor(entry.temperature).label}</td>
                            <td style={{background: getColor(entry.temperature).hexCode}}> </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
