const axios = require('axios');
const cron = require('node-cron');
const Widget = require('../models/Widget');

const fetchWeatherForCoords = async (lat, lon) => {
    try {
        const latFixed = parseFloat(lat).toFixed(4);
        const lonFixed = parseFloat(lon).toFixed(4);
        const res = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latFixed}&lon=${lonFixed}`, {
            headers: { 'User-Agent': 'NewsWebPunjabi/1.0' }
        });
        const current = res.data.properties.timeseries[0].data.instant.details;
        const symbol = res.data.properties.timeseries[0].data.next_1_hours?.summary?.symbol_code || '';
        const mapCondition = (sym) => {
            if (sym.includes('clear')) return 'CLEAR';
            if (sym.includes('fair') || sym.includes('cloud')) return 'CLOUDY';
            if (sym.includes('rain')) return 'RAIN';
            if (sym.includes('thunder')) return 'THUNDERSTORM';
            return 'MODERATE';
        };
        const temp = current.air_temperature;
        const hum = current.relative_humidity;
        const windKmh = Math.round(current.wind_speed * 3.6);
        let feelsLike = temp;
        if (temp > 20) feelsLike = temp + (0.1 * hum); 

        return {
            city: 'Detecting...', 
            temp: Math.round(temp),
            feelsLike: Math.round(feelsLike),
            humidity: Math.round(hum),
            condition: mapCondition(symbol),
            warning: `Wind speed: ${windKmh} km/h`
        };
    } catch (err) { return null; }
};

const updateWeather = async () => {
    try {
        const data = await fetchWeatherForCoords(30.69, 76.86);
        if (data) {
            data.city = 'Panchkula';
            await Widget.findOneAndUpdate({ type: 'weather' }, { data, lastUpdated: new Date() }, { upsert: true });
        }
    } catch (err) {}
};

const updateMarket = async () => {
    try {
        // Only NIFTY and SENSEX as requested
        const symbols = ['^NSEI', '^BSESN'];
        
        const results = await Promise.all(
            symbols.map(async (sym) => {
                try {
                    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
                    });
                    const result = res.data.chart.result[0];
                    const meta = result.meta;
                    const validCloses = result.indicators.quote[0].close.filter(c => c !== null);
                    
                    const price = meta.regularMarketPrice ?? (validCloses.length > 0 ? validCloses[validCloses.length - 1] : 0);
                    // Robust previousClose extraction. Fallback to chart data if meta.previousClose is missing.
                    let prev = meta.previousClose;
                    if (prev === undefined || prev === null) {
                        prev = (validCloses.length > 1) ? validCloses[validCloses.length - 2] : price;
                    }
                    
                    return { 
                        id: sym, 
                        price, 
                        prev: prev || price, // Ensure never zero if price exists
                        high: meta.regularMarketDayHigh || price, 
                        low: meta.regularMarketDayLow || price 
                    };
                } catch (e) { 
                    console.error(`[Market API Error] Failed to fetch ${sym}:`, e.message);
                    return { id: sym, price: 0, prev: 0, high: 0, low: 0 }; 
                }
            })
        );

        const dataMap = results.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});
        const marketData = [];
        const getPct = (p, pr) => (!pr || pr === 0) ? 0 : ((p - pr) / pr) * 100;

        // 1. NIFTY 50
        const nifty = dataMap['^NSEI'];
        if (nifty.price > 0) {
            const pct = getPct(nifty.price, nifty.prev);
            marketData.push({ 
                name: 'NIFTY 50', exchange: 'NSE', symbol: '^NSEI', 
                price: nifty.price.toLocaleString('en-IN', { maximumFractionDigits: 1 }), 
                change: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%', 
                up: pct >= 0,
                high: nifty.high.toLocaleString('en-IN'),
                low: nifty.low.toLocaleString('en-IN')
            });
        }

        // 2. SENSEX
        const sensex = dataMap['^BSESN'];
        if (sensex.price > 0) {
            const pct = getPct(sensex.price, sensex.prev);
            marketData.push({ 
                name: 'SENSEX', exchange: 'BSE', symbol: '^BSESN', 
                price: sensex.price.toLocaleString('en-IN', { maximumFractionDigits: 1 }), 
                change: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%', 
                up: pct >= 0,
                high: sensex.high.toLocaleString('en-IN'),
                low: sensex.low.toLocaleString('en-IN')
            });
        }

        if (marketData.length > 0) {
            await Widget.findOneAndUpdate({ type: 'market' }, { data: marketData, lastUpdated: new Date() }, { upsert: true });
            console.log(`[Market Update] Success. Updated ${marketData.length} items.`);
        } else {
            console.warn('[Market Update] No data items were pushed. Checking database state...');
        }
    } catch (err) {
        console.error('Market Update Error:', err.message);
    }
};


const startWidgetService = () => {
    updateWeather();
    updateMarket();
    cron.schedule('*/10 * * * *', updateWeather);
    cron.schedule('*/5 * * * *', updateMarket);
};

module.exports = { startWidgetService, fetchWeatherForCoords };
