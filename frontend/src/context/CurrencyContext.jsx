import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { convertAmount, detectCurrency, formatMoney } from "../lib/format.js";

const KEY = "dropwatch_currency";
const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const detected = useMemo(() => detectCurrency(), []);
  const [currency, setCurrencyState] = useState(() => localStorage.getItem(KEY) || detected);
  const [rates, setRates] = useState({ USD: 1, INR: 83.5 });
  const [manual, setManual] = useState(() => Boolean(localStorage.getItem(KEY)));

  useEffect(() => {
    fetch("/api/fx")
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) setRates({ USD: 1, ...data.rates });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (manual) return;
    setCurrencyState(detected);
  }, [detected, manual]);

  const value = useMemo(() => {
    const setCurrency = (code) => {
      setManual(true);
      setCurrencyState(code);
      localStorage.setItem(KEY, code);
    };
    const convert = (amount, from = "USD") => convertAmount(amount, from, currency, rates);
    const format = (amount, from = "USD") => formatMoney(convert(amount, from), currency);
    const toSource = (displayAmount, from = "USD") => convertAmount(displayAmount, currency, from, rates);
    return {
      currency,
      detected,
      rates,
      setCurrency,
      convert,
      format,
      toSource,
      usingLocation: !manual,
    };
  }, [currency, detected, rates, manual]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
