
import React from 'react';

// --- Main Navigation Icons (Solid Style) ---

export const DashboardIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
    </svg>
);

export const TradingIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 1.5a.5.5 0 01.5.5v11.586l2.293-2.293a.5.5 0 01.707.707l-3.5 3.5a.5.5 0 01-.707 0l-3.5-3.5a.5.5 0 11.707-.707L11.5 13.586V2a.5.5 0 01.5-.5z" clipRule="evenodd" transform="rotate(45 10 10)" />
        <path d="M3.5 12.5a.5.5 0 010-1h13a.5.5 0 010 1h-13z" />
    </svg>
);

export const InvestmentIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
    </svg>
);

export const WalletIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zm-2 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

export const MarketsIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11h3v5H2v-5zM6 6h3v10H6V6zM10 3h3v13h-3V3zM14 8h3v8h-3V8z" />
    </svg>
);

export const PositionsIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 4a1 1 0 00-2 0v2a1 1 0 002 0V7zm4 0a1 1 0 00-2 0v2a1 1 0 002 0V7zm4 0a1 1 0 00-2 0v2a1 1 0 002 0V7z" clipRule="evenodd" />
    </svg>
);

export const UsersIcon = ({ className = "w-6 h-6" }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
);

export const SettingsIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);

export const LogoutIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
);

// --- Asset Icons ---
export const BitcoinIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" fill="#F7931A" r="16"/><path d="M21.78 17.03c.53-.33.88-1.01.88-1.56 0-.6-.2-1.14-.6-1.5-.4-.37-.9-.63-1.5-.78V11h-2.1v2.03c-.2 0-.4.02-.6.05V11h-2.1v2.1c-.53.1-1.05.3-1.48.6l-.01-.01-1.4-1.4-1.5 1.5 1.28 1.28c-.12.3-.23.6-.32.92H10v2.2h1.8c.08.43.2.85.38 1.25H10v2.2h2.2c.43.3.9.53 1.4.7l-1.3 1.3 1.5 1.5 1.4-1.4s.01.01.01.01c.44.25.9.43 1.38.56v2.13h2.1v-2.1c.2-.03.4-.06.6-.1v2.2h2.1v-2.26c1.3-.43 2.2-1.63 2.2-3.04 0-.9-.4-1.7-1.12-2.27zm-3.48 2.53v-4.6c.9 0 1.5.7 1.5 1.6v1.4c0 .9-.6 1.6-1.5 1.6zm-2.7-5.1v5.1c-1.1 0-1.8-.8-1.8-1.8v-1.5c0-1 .7-1.8 1.8-1.8z" fill="#FFF"/></g></svg>
);

export const EthereumIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" fill="#627EEA" r="16"/><g fill="#FFF"><path d="M16.49 4.1v8.32l6.49 3.8-6.49-12.12z"/><path d="M16.49 4.1L10 16.22l6.49-3.8V4.1z"/><path d="M16.49 17.58v10.32l6.5-6.02-6.5-4.3z"/><path d="M16.49 27.9v-10.32l-6.49 4.3 6.49 6.02z"/><path d="M16.49 16.22L22.98 12.42 16.49 8.42 10 12.42z" fillOpacity=".6"/></g></g></svg>
);

export const TetherIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" fill="#26A17B" r="16"/><path d="M21 16.5h-3.5V20H15v-3.5H11.5v-2.5H15V10.5h2.5V14H21v2.5z" fill="#FFF"/></g></svg>
);

export const SolanaIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" r="16" fill="#9945FF"/><path d="M7 17.93h18v-2H7v2zm0-4.99h18v-2H7v2zm0-4.98h18v-2H7v2z" fill="url(#sol-a)" transform="matrix(.7071 .7071 -.7071 .7071 16 -6.627)"/><defs><linearGradient id="sol-a" x1="7" x2="25" y1="12.95" y2="12.95" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient></defs></g></svg>
);

export const XrpIcon = ({ className = "w-8 h-8" }) => (
     <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" r="16" fill="#23292F"/><path fill="#fff" d="m16.31 11.53 3.66 3.65-1.53 1.53-2.13-2.12-2.13 2.12-1.53-1.53 3.66-3.65zm-3.66 5.25L11.12 18.3l-1.53-1.53L16.31 10l6.72 6.72-1.53 1.53L20 16.72l-2.16 2.15h-3.06l-2.12-2.12z"/></g></svg>
);

export const AdaIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" r="16" fill="#0033AD"/><path d="M18.23 23.35c.34-.17.5-.4.5-.72v-5.26l4.1-2.45v5.02c0 .9-.5 1.5-1.3 1.83l-3.3 1.58zm-4.46 0-3.3-1.58c-.8-.33-1.3-.92-1.3-1.83v-5.02l4.1 2.45v5.26c0 .32.16.55.5.72zm5.7-8.15L16 13.43l-3.47 1.77-4.6-2.73 8.07-4.6 8.07 4.6-4.6 2.73zM23.83 13l-4.1-2.3v-5c0-.9-.5-1.5-1.3-1.83L15.13 2.3c-.4-.17-.87-.17-1.27 0l-3.3 1.58c-.8.33-1.3.92-1.3 1.83v5l-4.1 2.3c-.4.25-.63.6-.63 1.05v.2c0 .45.23.8.63 1.05l7.9 4.75h.5l7.9-4.75c.4-.25.63-.6.63-1.05v-.2c0-.45-.23-.8-.63-1.05z" fill="#fff"/></g></svg>
);

export const DogeIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="16" cy="16" r="16" fill="#C3A634"/><path d="m20.09 18.1-2.92 4.4a.26.26 0 0 1-.46 0l-5.3-7.98a.26.26 0 0 1 .05-.35l.8-.62c.1-.08.24-.07.33.02l4.28 4.28-1.7-4.83a.26.26 0 0 1 .1-.3l7.9-3.93a.26.26 0 0 1 .34.15l1.63 3.3a.26.26 0 0 1-.06.34l-4.4 3.44a.26.26 0 0 0-.1.25l.4 2.81zm-9.5-8.8 2.92-4.4a.26.26 0 0 1 .46 0l5.3 7.98a.26.26 0 0 1-.05.35l-.8.62a.26.26 0 0 1-.33-.02l-4.28-4.28 1.7 4.83a.26.26 0 0 1-.1.3l-7.9 3.93a.26.26 0 0 1-.34-.15l-1.63-3.3a.26.26 0 0 1 .06-.34l4.4-3.44a.26.26 0 0 0 .1-.25L9.2 7.5a.26.26 0 0 0-.1-.25l-1.5-1.55a.26.26 0 0 1-.04-.32l.8-1.65a.26.26 0 0 1 .4-.1l2.84 1.42z" fill="#fff"/></g></svg>
);


export const GoldIcon = ({ className = "w-8 h-8" }) => (
    <div className={`flex items-center justify-center bg-yellow-400 rounded-full ${className} p-1.5`}>
       <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 17.25V18.75C2 19.1642 2.33579 19.5 2.75 19.5H21.25C21.6642 19.5 22 19.1642 22 18.75V17.25C22 16.8358 21.6642 16.5 21.25 16.5H2.75C2.33579 16.5 2 16.8358 2 17.25Z" />
        <path d="M4 11.25V12.75C4 13.1642 4.33579 13.5 4.75 13.5H19.25C19.6642 13.5 20 13.1642 20 12.75V11.25C20 10.8358 19.6642 10.5 19.25 10.5H4.75C4.33579 10.5 4 10.8358 4 11.25Z" />
        <path d="M6 5.25V6.75C6 7.16421 6.33579 7.5 6.75 7.5H17.25C17.6642 7.5 18 7.16421 18 6.75V5.25C18 4.83579 17.6642 4.5 17.25 4.5H6.75C6.33579 4.5 6 4.83579 6 5.25Z" />
       </svg>
    </div>
);

export const SilverIcon = ({ className = "w-8 h-8" }) => (
    <div className={`flex items-center justify-center bg-gray-400 rounded-full ${className} p-1.5`}>
       <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 17.25V18.75C2 19.1642 2.33579 19.5 2.75 19.5H21.25C21.6642 19.5 22 19.1642 22 18.75V17.25C22 16.8358 21.6642 16.5 21.25 16.5H2.75C2.33579 16.5 2 16.8358 2 17.25Z" />
        <path d="M4 11.25V12.75C4 13.1642 4.33579 13.5 4.75 13.5H19.25C19.6642 13.5 20 13.1642 20 12.75V11.25C20 10.8358 19.6642 10.5 19.25 10.5H4.75C4.33579 10.5 4 10.8358 4 11.25Z" />
        <path d="M6 5.25V6.75C6 7.16421 6.33579 7.5 6.75 7.5H17.25C17.6642 7.5 18 7.16421 18 6.75V5.25C18 4.83579 17.6642 4.5 17.25 4.5H6.75C6.33579 4.5 6 4.83579 6 5.25Z" />
       </svg>
    </div>
);

export const OilIcon = ({ className = "w-8 h-8" }) => (
    <div className={`flex items-center justify-center bg-gray-800 rounded-full ${className} p-1.5`}>
       <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.25c-5.18 0-9.42 4.06-9.72 9.19-.04.64.48 1.18 1.12 1.18.51 0 .95-.35 1.09-.85.39-1.44 1.83-3.08 3.55-4.32 1.25-.9 2.08-2.3 2.08-3.82 0-.2.02-.39.05-.58-.02.19-.05.38-.05.58 0 1.52-.83 2.92-2.08 3.82C6.77 10.81 5.33 12.45 4.94 13.89c-.14.5.28 1 .79.85a7.5 7.5 0 0 1 12.54 0c.5.15.93-.35.79-.85-.39-1.44-1.83-3.08-3.55-4.32-1.25-.9-2.08-2.3-2.08-3.82 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.52-.83 2.92-2.08 3.82-1.72 1.24-3.16 2.88-3.55 4.32-.14.5.38 1 .88 1 .64 0 1.16-.54 1.12-1.18C21.42 6.31 17.18 2.25 12 2.25z"/>
       </svg>
    </div>
);

export const TextIcon = ({ className = "w-8 h-8", text, bgColor = "bg-gray-500" }: { className?: string, text: string, bgColor?: string }) => (
    <div className={`flex items-center justify-center rounded-full text-white font-bold text-xs ${className} ${bgColor}`}>
        {text}
    </div>
);

export const NaturalGasIcon = ({ className="w-8 h-8" }) => <TextIcon text="NG" className={className} bgColor="bg-cyan-500" />;
export const CopperIcon = ({ className="w-8 h-8" }) => <TextIcon text="HG" className={className} bgColor="bg-orange-700" />;
export const PlatinumIcon = ({ className="w-8 h-8" }) => <TextIcon text="PL" className={className} bgColor="bg-slate-400" />;

export const AvaxIcon = ({ className="w-8 h-8" }) => <TextIcon text="AVAX" className={className} bgColor="bg-red-600" />;
export const DotIcon = ({ className="w-8 h-8" }) => <TextIcon text="DOT" className={className} bgColor="bg-pink-600" />;
export const ShibIcon = ({ className="w-8 h-8" }) => <TextIcon text="SHIB" className={className} bgColor="bg-orange-500" />;
export const MaticIcon = ({ className="w-8 h-8" }) => <TextIcon text="MATIC" className={className} bgColor="bg-purple-600" />;

export const EurUsdIcon = ({ className="w-8 h-8" }) => <TextIcon text="€$" className={className} bgColor="bg-blue-600" />;
export const GbpUsdIcon = ({ className="w-8 h-8" }) => <TextIcon text="£$" className={className} bgColor="bg-red-600" />;
export const UsdJpyIcon = ({ className="w-8 h-8" }) => <TextIcon text="$¥" className={className} bgColor="bg-gray-700" />;
export const UsdTryIcon = ({ className="w-8 h-8" }) => <TextIcon text="$₺" className={className} bgColor="bg-red-700" />;
export const AudUsdIcon = ({ className="w-8 h-8" }) => <TextIcon text="A$" className={className} bgColor="bg-teal-600" />;
export const UsdCadIcon = ({ className="w-8 h-8" }) => <TextIcon text="C$" className={className} bgColor="bg-indigo-600" />;
export const UsdChfIcon = ({ className="w-8 h-8" }) => <TextIcon text="S₣" className={className} bgColor="bg-pink-700" />;
export const NzdUsdIcon = ({ className="w-8 h-8" }) => <TextIcon text="N$" className={className} bgColor="bg-sky-600" />;

export const AaplIcon = ({ className="w-8 h-8" }) => <TextIcon text="AAPL" className={className} bgColor="bg-gray-800" />;
export const GooglIcon = ({ className="w-8 h-8" }) => <TextIcon text="GOOG" className={className} bgColor="bg-blue-500" />;
export const MsftIcon = ({ className="w-8 h-8" }) => <TextIcon text="MSFT" className={className} bgColor="bg-sky-500" />;
export const AmznIcon = ({ className="w-8 h-8" }) => <TextIcon text="AMZN" className={className} bgColor="bg-orange-400" />;
export const TslaIcon = ({ className="w-8 h-8" }) => <TextIcon text="TSLA" className={className} bgColor="bg-red-500" />;
export const NkeIcon = ({ className="w-8 h-8" }) => <TextIcon text="NKE" className={className} bgColor="bg-black" />;

// --- Other UI Icons ---
export const EyeIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
</svg>;
export const EyeSlashIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A10.005 10.005 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
</svg>;
export const MenuIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
export const ExclamationTriangleIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
export const CloseIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
export const UserCircleIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
export const CreditCardIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
export const ShieldCheckIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917L12 22l9-1.083A12.02 12.02 0 0021 8.944c0-1.317-.266-2.59-.748-3.752z" /></svg>;
export const QuestionMarkCircleIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const CheckCircleIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const XCircleIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const DocumentTextIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
export const CameraIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
export const KeyIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1.258a1 1 0 01-.97-1.243l1.258-7.547a1 1 0 01.97-1.243H4a1 1 0 011 1v1h1V7a2 2 0 012-2h1" /></svg>;
export const DevicePhoneMobileIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
export const FingerPrintIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.24.99-4.605.99-7.132A8 8 0 008 4a8 8 0 00-1.28 15.901" /></svg>;
export const GlobeAltIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.704 4.343a9 9 0 0110.592 0m-12.592 0a9 9 0 0010.592 0M12 6a2 2 0 100-4 2 2 0 000 4zm-2 2a2 2 0 100-4 2 2 0 000 4zm4 0a2 2 0 100-4 2 2 0 000 4zm-2 2a2 2 0 100-4 2 2 0 000 4z" /></svg>;
export const SunIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
export const MoonIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
export const ChatBubbleLeftRightIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
export const TrashIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
export const ArrowLeftIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
export const ComputerDesktopIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
export const BellIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
export const CurrencyDollarIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 14c1.657 0 3-.895 3-2s-1.343-2-3-2m0 4c-1.11 0-2.08-.402-2.599-1M12 14v1m0-1v-.01M12 16v1m0 1v.01M12 18v-1m0-1v-.01M12 20v-1m0-1v-.01M12 4h.01M12 2h.01M12 22h.01M12 6a2 2 0 00-2 2v8a2 2 0 002 2h0a2 2 0 002-2V8a2 2 0 00-2-2h0z" /></svg>;
export const ClockIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const DocumentArrowUpIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2zM12 11v6m0 0l-3-3m3 3l3-3" /></svg>;
export const SwitchHorizontalIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
export const UserPlusIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
export const SendIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
export const ProfitIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
export const GiftIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
export const CopyIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
export const ReceiveIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" /></svg>;
export const BankIcon = ({ className = "w-8 h-8" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 12h6m-6 5.25h6M5.25 6h.008v.008H5.25V6zm.75 0h.008v.008H6V6zm.75 0h.008v.008H6.75V6zm10.5 0h.008v.008h-.008V6zm-.75 0h.008v.008h-.008V6zm-.75 0h.008v.008h-.008V6z" /></svg>;
export const QrCodeIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h2v2H3zM3 16h2v2H3zM8 11h2v2H8zM8 16h2v2H8zM13 11h2v2h-2zM13 16h2v2h-2zM18 11h2v2h-2zM18 16h2v2h-2zM3 6h2v2H3zM8 6h2v2H8zM13 6h2v2h-2zM18 6h2v2h-2zM3 3h18v18H3z"/></svg>;
export const SparklesIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22l-.648-1.437a2.25 2.25 0 01-1.49-1.49L12.75 18l1.438-.648a2.25 2.25 0 011.49 1.49L16.25 20l.648.562a2.25 2.25 0 011.49-1.49L20.25 18l-1.438.648a2.25 2.25 0 01-1.49 1.49z" /></svg>;
export const GridIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
export const ListBulletIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0h.008v.008h-.008V6.75zm.375 0h.008v.008h-.008V6.75zM3.75 12h.007v.008H3.75V12zm.375 0h.008v.008h-.008V12zm.375 0h.008v.008h-.008V12zm-1.125 5.25h.007v.008H3.75v-.008zm.375 0h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008z" /></svg>;
export const SearchIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
export const VaultIcon = ({ className = "w-10 h-10" }) => <div className={`flex items-center justify-center font-bold text-3xl ${className}`}>V</div>;
export const ChevronRightIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;

export const AtSymbolIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>;
export const EnvelopeIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
export const MapPinIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;