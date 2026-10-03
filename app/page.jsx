'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, CreditCard, Banknote, Car, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [pickup, setPickup] = useState('Шарбакты, Моё местоположение');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('kaspi');
  const [needChange, setNeedChange] = useState(false);
  const [changeFrom, setChangeFrom] = useState('2000');
  const [isOrdering, setIsOrdering] = useState(false);
  const [order, setOrder] = useState(null);
  const [tgUser, setTgUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTgUser(user);
        syncProfile(user);
      }
    }
  }, []);

  // Создание или обновление профиля пассажира
  const syncProfile = async (user) => {
    try {
      await supabase.from('profiles').upsert(
        {
          telegram_id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: 'passenger',
        },
        { onConflict: 'telegram_id' }
      );
    } catch (err) {
      console.error('Ошибка синхронизации профиля:', err);
    }
  };

  // Создание заказа в базе данных
  const handleOrder = async () => {
    if (!destination.trim()) {
      alert('Пожалуйста, укажите пункт назначения');
      return;
    }

    setIsOrdering(true);

    try {
      // Ищем ID профиля по telegram_id
      let profileId = null;
      if (tgUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('telegram_id', tgUser.id)
          .single();
        if (profile) profileId = profile.id;
      }

      const orderData = {
        passenger_id: profileId,
        pickup_address: pickup,
        pickup_lat: 52.4931, // Координаты Шарбакты по умолчанию
        pickup_lng: 78.1506,
        destination_address: destination,
        destination_lat: 52.4931,
        destination_lng: 78.1506,
        estimated_price: 500,
        payment_method: paymentMethod,
        cash_change_from: paymentMethod === 'cash' && needChange ? parseFloat(changeFrom) : null,
        status: 'searching_driver',
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      setOrder(data);
    } catch (err) {
      console.error('Ошибка создания заказа:', err);
      alert('Не удалось создать заказ. Попробуйте ещё раз.');
    } finally {
      setIsOrdering(false);
    }
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

      {/* Выполнение или карта */}
      {order ? (
        <div className="my-6 bg-slate-800/90 border border-yellow-400/50 p-6 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 rounded-full flex items-center justify-center mx-auto border border-yellow-400/30">
            <Car className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Заказ #{order.id.slice(0, 8)}</span>
            <h2 className="text-lg font-extrabold text-white mt-1">Ищем ближайшего водителя</h2>
            <p className="text-xs text-slate-400 mt-1">Шарбакты • {order.destination_address}</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs text-left space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Стоимость:</span>
              <span className="font-bold text-yellow-400">{order.estimated_price} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Оплата:</span>
              <span className="font-semibold uppercase">{order.payment_method}</span>
            </div>
            {order.cash_change_from && (
              <div className="flex justify-between">
                <span className="text-slate-400">Сдача с:</span>
                <span className="font-semibold">{order.cash_change_from} ₸</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setOrder(null)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-xs transition-colors"
          >
            Отменить заказ
          </button>
        </div>
      ) : (
        <>
          {/* Имитация карты */}
          <div className="my-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl h-40 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
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

          {/* Кнопка заказа */}
          <div className="pt-2">
            <button
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold py-4 rounded-2xl shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2 text-base transition-all active:scale-95 disabled:opacity-50"
            >
              {isOrdering ? (
                <span>Сохранение в базу...</span>
              ) : (
                <>
                  <span>Заказать БАЦ Такси</span>
                  <span className="bg-slate-950/20 px-2 py-0.5 rounded-lg text-xs font-bold">500 ₸</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
