import React, { useEffect, useRef, memo, useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { CryptoAsset } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface TradingViewSymbolOverviewWidgetProps {
  asset: CryptoAsset;
}

const TV_SCRIPT_ID = 'tradingview-widget-script';
const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

const TradingViewSymbolOverviewWidget: React.FC<TradingViewSymbolOverviewWidgetProps> = ({ asset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();
  const { theme } = useTheme();

  const containerId = useMemo(() => `tradingview_overview_${Math.random().toString(36).substr(2, 9)}`, [asset.id]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;
    
    currentContainer.id = containerId;

    const createWidget = () => {
      if (document.getElementById(containerId) && typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          "symbols": [[asset.name, `${asset.tradingViewSymbol}|1D`]],
          "chartOnly": false,
          "width": "100%",
          "height": "100%",
          "locale": language,
          "colorTheme": theme,
          "autosize": true,
          "showVolume": false,
          "showMA": false,
          "hideDateRanges": true,
          "hideMarketStatus": true,
          "hideSymbolLogo": true,
          "scalePosition": "no",
          "scaleMode": "Normal",
          "fontFamily": "inherit",
          "fontSize": "10",
          "noTimeScale": true,
          "valuesTracking": "1",
          "changeMode": "price-and-percent",
          "chartType": "area",
          "maLineColor": "#2962FF",
          "maLineWidth": 1,
          "maLength": 9,
          "lineWidth": 2,
          "lineType": 0,
          "dateRanges": ["1d", "1w", "1m"],
          "container_id": containerId,
          "isTransparent": true,
          "backgroundColor": "rgba(0,0,0,0)"
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
      const script = document.getElementById(TV_SCRIPT_ID);
      script?.removeEventListener('load', createWidget);
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [asset, language, theme, containerId]);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default memo(TradingViewSymbolOverviewWidget);