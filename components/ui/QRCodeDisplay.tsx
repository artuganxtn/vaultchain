
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Assuming QRCodeStyling is available globally from the script tag in index.html
declare const QRCodeStyling: any;

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 200 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!ref.current || !value) return;

    // Polling mechanism to wait for the script to load
    const intervalId = setInterval(() => {
      // Check if the library is loaded and if the component is still mounted
      if (typeof QRCodeStyling !== 'undefined' && ref.current) {
        clearInterval(intervalId); // Stop polling once the library is found

        // Ensure the container is empty before appending a new QR code
        ref.current.innerHTML = ''; 
        
        const qrCode = new QRCodeStyling({
          width: size,
          height: size,
          data: value,
          image: '/vite.svg', 
          dotsOptions: {
            color: theme === 'dark' ? '#10b981' : '#059669',
            type: 'rounded',
          },
          backgroundOptions: {
            color: 'transparent',
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: 4,
            imageSize: 0.2,
          },
          cornersSquareOptions: {
              type: 'extra-rounded',
              color: theme === 'dark' ? '#10b981' : '#059669',
          },
          cornersDotOptions: {
              type: 'dot',
              color: theme === 'dark' ? '#10b981' : '#059669',
          }
        });
        qrCode.append(ref.current);
      }
    }, 100); // Check every 100ms

    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
      if (ref.current) {
        ref.current.innerHTML = ''; // Clean up the DOM element
      }
    };
  }, [value, size, theme]); // Rerun effect if these props change

  return <div ref={ref} className="mx-auto flex items-center justify-center" style={{ width: size, height: size }} />;
};

export default QRCodeDisplay;
