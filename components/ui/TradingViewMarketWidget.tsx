
import React, { useEffect, useRef, memo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

const TV_SCRIPT_ID = 'tradingview-widget-script';
const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

const TradingViewMarketWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();
  const containerId = 'tradingview_market_widget_container';

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Ensure the container is empty before creating a new widget
    currentContainer.innerHTML = '';
    currentContainer.id = containerId;

    const createWidget = () => {
      if (document.getElementById(containerId) && typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          "width": "100%",
          "height": "100%",
          "showChart": true,
          "showSymbolLogo": true,
          "isTransparent": false,
          "colorTheme": "light",
          "locale": language,
          "container_id": containerId,
          "tabs": [
            {
              "title": "Indices",
              "symbols": [
                { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
                { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
                { "s": "FOREXCOM:DJI", "d": "Dow 30" },
                { "s": "INDEX:NKY", "d": "Nikkei 225" },
                { "s": "INDEX:DEU40", "d": "DAX" },
                { "s": "FOREXCOM:UKXGBP", "d": "UK 100" }
              ],
              "originalName": "Indices"
            },
            {
              "title": "Commodities",
              "symbols": [
                { "s": "OANDA:XAUUSD", "d": "Gold" },
                { "s": "OANDA:XAGUSD", "d": "Silver" },
                { "s": "OANDA:WTICOUSD", "d": "Crude Oil" },
                { "s": "OANDA:NATGASUSD", "d": "Natural Gas" },
                { "s": "TVC:COPPER", "d": "Copper" },
                { "s": "CURRENCYCOM:PLATINUM", "d": "Platinum" }
              ],
              "originalName": "Commodities"
            },
            {
              "title": "Crypto",
              "symbols": [
                { "s": "BINANCE:BTCUSDT", "d": "Bitcoin" },
                { "s": "BINANCE:ETHUSDT", "d": "Ethereum" },
                { "s": "BINANCE:SOLUSDT", "d": "Solana" },
                { "s": "BINANCE:XRPUSDT", "d": "XRP" },
                { "s": "BINANCE:ADAUSDT", "d": "Cardano" },
                { "s": "BINANCE:DOGEUSDT", "d": "Dogecoin" },
                { "s": "BINANCE:AVAXUSDT", "d": "Avalanche" },
                { "s": "BINANCE:DOTUSDT", "d": "Polkadot" },
                { "s": "BINANCE:SHIBUSDT", "d": "Shiba Inu" },
                { "s": "BINANCE:MATICUSDT", "d": "Polygon" }
              ],
              "originalName": "Crypto"
            },
            {
              "title": "Forex",
              "symbols": [
                { "s": "OANDA:EURUSD", "d": "EUR/USD" },
                { "s": "OANDA:GBPUSD", "d": "GBP/USD" },
                { "s": "OANDA:USDJPY", "d": "USD/JPY" },
                { "s": "FX_IDC:USDTRY", "d": "USD/TRY" },
                { "s": "OANDA:AUDUSD", "d": "AUD/USD" },
                { "s": "OANDA:USDCAD", "d": "USD/CAD" },
                { "s": "OANDA:USDCHF", "d": "USD/CHF" },
                { "s": "OANDA:NZDUSD", "d": "NZD/USD" }
              ],
              "originalName": "Forex"
            },
            {
              "title": "Stocks",
              "symbols": [
                { "s": "NASDAQ:AAPL", "d": "Apple" },
                { "s": "NASDAQ:GOOGL", "d": "Google" },
                { "s": "NASDAQ:MSFT", "d": "Microsoft" },
                { "s": "NASDAQ:AMZN", "d": "Amazon" },
                { "s": "NASDAQ:TSLA", "d": "Tesla" },
                { "s": "NYSE:NKE", "d": "Nike" }
              ],
              "originalName": "Stocks"
            }
          ]
        });
      }
    };
    
    const script = document.getElementById(TV_SCRIPT_ID);

    if (!script) {
        const newScript = document.createElement('script');
        newScript.id = TV_SCRIPT_ID;
        newScript.src = TV_SCRIPT_SRC;
        newScript.async = true;
        newScript.onload = createWidget;
        document.head.appendChild(newScript);
    } else if (typeof (window as any).TradingView !== 'undefined') {
        createWidget();
    } else {
        script.addEventListener('load', createWidget);
    }

    return () => {
      // No need to remove the script itself, but clear the container to avoid duplicates on re-render.
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };

  }, [language]);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default memo(TradingViewMarketWidget);