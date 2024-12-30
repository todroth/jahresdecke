'use client'

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function Home() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      const lat = 47.66;
      const lon = 9.18;
      const today = dayjs();
      const pastYear = today.subtract(365, 'day');

      const promises = [];
      for (let d = today; d.isAfter(pastYear) || d.isSame(pastYear, 'day'); d = d.subtract(1, 'day')) {
        const date = d.format('YYYY-MM-DD'); // Format date as YYYY-MM-DD
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

      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  function formatDateWithLeadingZeros(dateString: string) {
    return dayjs(dateString).format('DD.MM.YYYY');
  }

  return (
      <div>
        <h1>Weather Data for the Last 365 Days</h1>
        {loading ? (
            <p>Loading...</p>
        ) : (
            <table border={1}>
              <thead>
              <tr>
                <th>Date</th>
                <th>Temperature at Noon (°C)</th>
              </tr>
              </thead>
              <tbody>
              {weatherData.map((entry: {timestamp: string, temperature: number}, index) => (
                  <tr key={index}>
                    <td>{formatDateWithLeadingZeros(entry.timestamp)}</td>
                    <td>{entry.temperature}°C</td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}
      </div>
  );
}
