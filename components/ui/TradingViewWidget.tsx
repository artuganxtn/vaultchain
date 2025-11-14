import React, { useEffect, useRef, memo, useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface TradingViewWidgetProps {
  symbol: string;
  isAdvanced?: boolean;
  onSymbolChange?: (symbol: string) => void;
}

const TV_SCRIPT_ID = 'tradingview-widget-script';
const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, isAdvanced = false, onSymbolChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();
  
  const containerId = useMemo(() => `tradingview_widget_${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    currentContainer.id = containerId;
    
    const createWidget = () => {
        if (document.getElementById(containerId) && typeof (window as any).TradingView !== 'undefined') {
            
            const themeOverrides = {
                "paneProperties.background": "#FFFFFF",
                "paneProperties.vertGridProperties.color": "rgba(229, 231, 235, 0.5)",
                "paneProperties.horzGridProperties.color": "rgba(229, 231, 235, 0.5)",
                "scalesProperties.textColor": "#374151",
                "mainSeriesProperties.areaStyle.color1": "rgba(16, 185, 129, 0.2)",
                "mainSeriesProperties.areaStyle.color2": "rgba(16, 185, 129, 0)",
                "mainSeriesProperties.areaStyle.linecolor": "#10B981",
              };

            const widgetOptions = {
              autosize: true,
              symbol: symbol,
              interval: "D",
              timezone: "Etc/UTC",
              theme: "light",
              style: "3", // Use Area chart style directly
              locale: language,
              toolbar_bg: "#FFFFFF",
              enable_publishing: false,
              save_image: false,
              container_id: containerId,
              hide_top_toolbar: true,
              hide_legend: true,
              withdateranges: isAdvanced,
              allow_symbol_change: isAdvanced,
              hide_volume: true,
              studies: [], // Adding studies forces the advanced widget
              overrides: themeOverrides
            };

            const tvWidget = new (window as any).TradingView.widget(widgetOptions);
            
            if (onSymbolChange) {
                tvWidget.ready(() => {
                    tvWidget.activeChart().onSymbolChanged().subscribe(
                        null,
                        () => {
                            const newSymbol = tvWidget.activeChart().symbol();
                            if (onSymbolChange) {
                                onSymbolChange(newSymbol);
                            }
                        }
                    );
                });
            }
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
      const script = document.getElementById(TV_SCRIPT_ID);
      script?.removeEventListener('load', createWidget);
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [symbol, language, isAdvanced, onSymbolChange, containerId]);

  return (
    <div className="tradingview-widget-container h-full w-full relative">
      <div ref={containerRef} className="h-full w-full" />
       <div className="absolute bottom-1.5 left-1.5 rtl:left-auto rtl:right-1.5 z-10 p-1 px-2 rounded-md bg-white dark:bg-gray-900 notranslate text-sm font-bold text-gray-800 dark:text-white pointer-events-none shadow">
          <span className="text-green-500 dark:text-green-400">Vault</span>Chain
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);