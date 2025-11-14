// Re-export all icons from react-icons
// Using Heroicons v2 (hi2) as the primary icon set, with fallbacks from other sets

import React from 'react';
import {
  // Heroicons v2 - Outline
  HiOutlineSquares2X2 as DashboardIcon,
  HiOutlineChartBar as TradingIcon,
  HiOutlineBanknotes as InvestmentIcon,
  HiOutlineWallet as WalletIcon,
  HiOutlineGlobeAlt as MarketsIcon,
  HiOutlinePhoto as PositionsIcon,
  HiOutlineUserGroup as UsersIcon,
  HiOutlineCog6Tooth as SettingsIcon,
  HiOutlineArrowRightOnRectangle as LogoutIcon,
  HiOutlineClock as ClockIcon,
  HiOutlineDocumentDuplicate as CopyIcon,
  HiOutlineKey as KeyIcon,
  HiOutlineCamera as CameraIcon,
  HiOutlineEye as EyeIcon,
  HiOutlineEyeSlash as EyeSlashIcon,
  HiOutlineArrowLeft as ArrowLeftIcon,
  HiOutlineXMark as CloseIcon,
  HiOutlineBars3 as MenuIcon,
  HiOutlineSun as SunIcon,
  HiOutlineMoon as MoonIcon,
  HiOutlineBell as BellIcon,
  HiOutlineExclamationTriangle as ExclamationTriangleIcon,
  HiOutlineArrowDownLeft as ArrowDownLeftIcon,
  HiOutlineArrowUpRight as ArrowUpRightIcon,
  HiOutlineGift as GiftIcon,
  HiOutlineShieldCheck as ShieldCheckIcon,
  HiOutlineCurrencyDollar as CurrencyDollarIcon,
  HiOutlineDocumentArrowUp as DocumentArrowUpIcon,
  HiOutlineArrowsRightLeft as SwitchHorizontalIcon,
  HiOutlineUserCircle as UserCircleIcon,
  HiOutlineQuestionMarkCircle as QuestionMarkCircleIcon,
  HiOutlineDocumentText as DocumentTextIcon,
  HiOutlineChatBubbleLeftRight as ChatBubbleLeftRightIcon,
  HiOutlineSparkles as SparklesIcon,
  HiOutlineScale as ScaleIcon,
  HiOutlineTrophy as TrophyIcon,
  HiOutlineCalendar as CalendarIcon,
  HiOutlineTicket as TicketIcon,
  HiOutlineMagnifyingGlass as SearchIcon,
  HiOutlineSquares2X2 as GridIcon,
  HiOutlineBars3 as ListBulletIcon,
  HiOutlineComputerDesktop as ComputerDesktopIcon,
  HiOutlineChevronRight as ChevronRightIcon,
  HiOutlineChevronDown as ChevronDownIcon,
  HiOutlineCheckCircle as CheckDoubleIcon,
  HiOutlineTrash as TrashIcon,
  HiOutlineEllipsisVertical as EllipsisVerticalIcon,
  HiOutlinePaperAirplane as SendIcon,
  HiOutlineArrowDownTray as ReceiveIcon,
  HiOutlineBuildingLibrary as BankIcon,
  HiOutlineQrCode as QrCodeIcon,
  HiOutlineUserPlus as UserPlusIcon,
  HiOutlineCreditCard as CreditCardIcon,
  // Heroicons v2 - Solid
  HiSquares2X2 as DashboardIconSolid,
  HiChartBar as TradingIconSolid,
  HiBanknotes as InvestmentIconSolid,
  HiWallet as WalletIconSolid,
  HiGlobeAlt as MarketsIconSolid,
  HiPhoto as PositionsIconSolid,
} from 'react-icons/hi2';

import { 
  FaBitcoin as BitcoinIcon,
  FaEthereum as EthereumIcon,
  FaDollarSign as DollarIcon,
  FaDog as DogeIcon,
  FaOilCan as OilIcon,
  FaBuilding as AaplIcon,
  FaGoogle as GooglIcon,
  FaVault as VaultIcon,
  FaCircleDollarToSlot as TetherIcon,
} from 'react-icons/fa6';

// Crypto icons from simple-icons (better representations)
import {
  SiSolana as SolanaIcon,
  SiXrp as XrpIcon,
  SiCardano as AdaIcon,
} from 'react-icons/si';

// Forex and currency icons
import {
  FaEuroSign as EurUsdIcon,
  FaSterlingSign as GbpUsdIcon,
  FaLiraSign as UsdTryIcon,
} from 'react-icons/fa6';

// Precious metals icons
import {
  FaGem as GoldIcon,
  FaRing as SilverIcon,
} from 'react-icons/fa6';

// Profit icon - using trending up from heroicons
import { HiOutlineArrowTrendingUp as ProfitIcon } from 'react-icons/hi2';

// Text Icon component (custom, not from react-icons)
export const TextIcon: React.FC<{ text: string, bgColor?: string, className?: string }> = ({ text, bgColor = 'bg-gray-500', className = "w-10 h-10" }) => (
  <div className={`${className} ${bgColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
    {text}
  </div>
);

// Re-export all icons
export {
  DashboardIcon,
  DashboardIconSolid,
  TradingIcon,
  TradingIconSolid,
  InvestmentIcon,
  InvestmentIconSolid,
  WalletIcon,
  WalletIconSolid,
  MarketsIcon,
  MarketsIconSolid,
  PositionsIcon,
  PositionsIconSolid,
  UsersIcon,
  SettingsIcon,
  LogoutIcon,
  TetherIcon,
  ClockIcon,
  CopyIcon,
  KeyIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CloseIcon,
  MenuIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ProfitIcon,
  GiftIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  SwitchHorizontalIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ScaleIcon,
  TrophyIcon,
  CalendarIcon,
  TicketIcon,
  SearchIcon,
  GridIcon,
  ListBulletIcon,
  ComputerDesktopIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckDoubleIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  SendIcon,
  ReceiveIcon,
  BankIcon,
  QrCodeIcon,
  UserPlusIcon,
  CreditCardIcon,
  // Additional icons
  BitcoinIcon,
  EthereumIcon,
  DollarIcon,
  // Crypto icons
  SolanaIcon,
  XrpIcon,
  DogeIcon,
  AdaIcon,
  // Forex icons
  EurUsdIcon,
  GbpUsdIcon,
  UsdTryIcon,
  // Commodities icons
  GoldIcon,
  SilverIcon,
  OilIcon,
  // Stock icons
  AaplIcon,
  GooglIcon,
  // Vault icon
  VaultIcon,
};

// Export GlobeAltIcon alias for compatibility
export { HiOutlineGlobeAlt as GlobeAltIcon } from 'react-icons/hi2';
