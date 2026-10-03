'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, CreditCard, Banknote, Check, Car } from 'lucide-react';

export default function Home() {
  const [pickup, setPickup] = useState('Шарбакты, Моё местоположение');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('kaspi');
  const [needChange, setNeedChange] = useState(false);
  const [changeFrom, setChangeFrom] = useState('2000');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleOrder = () => {
    if (!destination.trim()) {
      alert('Пожалуйста, укажите пункт назначения');
      return;
    }
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderStatus('SEARCHING_DRIVER');
    }, 1500);
  };

  return (
    <main className="max-w-md mx-auto p-4 flex flex-col min-h-screen justify-between">
      {/* Шапка БАЦ */}
      <header className="flex items-center justify-between py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 text-black font-black px-3 py-1 rounded-xl text-xl tracking-wider">
            БАЦ
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Такси</span>
        </div>
        <div className="text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Шарбакты
        </div>
      </header>

      {/* Имитация карты */}
      <div className="my-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl h-44 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <Car className="w-10 h-10 text-yellow-400 mb-2 animate-bounce" />
        <span className="text-xs text-slate-400 font-medium z-10">Карта OpenStreetMap подключается...</span>
      </div>

      {/* Выбор маршрута */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
          <Navigation className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Откуда?"
            className="bg-transparent text-sm w-full outline-none text-slate-200 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
          <MapPin className="w-5 h-5 text-yellow-400 shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Куда едем в Шарбакты?"
            className="bg-transparent text-sm w-full outline-none text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Выбор оплаты */}
      <div className="my-4 space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
          Способ оплаты
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPaymentMethod('kaspi')}
            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
              paymentMethod === 'kaspi'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Kaspi Перевод
          </button>

          <button
            onClick={() => setPaymentMethod('halyk')}
            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
              paymentMethod === 'halyk'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Halyk Перевод
          </button>

          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
              paymentMethod === 'cash'
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Наличные
          </button>
        </div>

        {/* Настройка сдачи для наличных */}
        {paymentMethod === 'cash' && (
          <div className="mt-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Нужна сдача?</span>
              <button
                onClick={() => setNeedChange(!needChange)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  needChange ? 'bg-yellow-400' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-slate-900 absolute top-0.5 transition-transform ${
                    needChange ? 'left-5' : 'left-0.5'
                  }`}
                ></span>
              </button>
            </div>

            {needChange && (
              <div className="flex gap-1.5 pt-1">
                {['2000', '5000', '10000'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setChangeFrom(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                      changeFrom === val
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    с {val} ₸
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Статус или кнопка заказа */}
      <div className="pt-2">
        {orderStatus === 'SEARCHING_DRIVER' ? (
          <div className="bg-slate-800 border border-yellow-400/40 p-4 rounded-2xl text-center space-y-2 animate-pulse">
            <div className="text-yellow-400 font-bold text-sm">Ищем ближайшего водителя в Шарбакты...</div>
            <p className="text-xs text-slate-400">Ожидайте подтверждения поездки</p>
          </div>
        ) : (
          <button
            onClick={handleOrder}
            disabled={isOrdering}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold py-4 rounded-2xl shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2 text-base transition-all active:scale-95"
          >
            {isOrdering ? (
              <span>Оформление...</span>
            ) : (
              <>
                <span>Заказать БАЦ Такси</span>
                <span className="bg-slate-950/20 px-2 py-0.5 rounded-lg text-xs font-bold">500 ₸</span>
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}
