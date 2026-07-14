import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, onComplete }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (Object.keys(remaining).length === 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center bg-black/60 backdrop-blur-md px-3 py-2 min-w-[55px] md:min-w-[65px] border-x border-white/5 first:border-l-0 last:border-r-0">
        <span className="text-xl md:text-2xl font-black text-white leading-none tracking-tighter">
            {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
        </span>
        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-primary-red/80 mt-1.5">{interval}</span>
      </div>
    );
  });

  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-sm">
      {timerComponents.length ? timerComponents : (
        <div className="bg-primary-red px-8 py-3 text-white font-black uppercase tracking-widest text-xs animate-pulse">Released Now!</div>
      )}
    </div>
  );
};

export default CountdownTimer;
