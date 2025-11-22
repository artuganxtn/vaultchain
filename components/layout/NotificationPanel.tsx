import React, { useContext, useMemo, useState, useRef } from 'react';
import { AppContext } from '../../App';
import { useTranslation } from '../../contexts/LanguageContext';
import { CloseIcon, BellIcon, ArrowDownLeftIcon, ArrowUpRightIcon, ShieldCheckIcon, EllipsisVerticalIcon, CheckDoubleIcon, TrashIcon } from '../ui/Icons';
import { UserNotification } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (link: string) => void;
}

const NotificationIcon: React.FC<{ type: UserNotification['type'] }> = ({ type }) => {
    const iconMap = {
        success: <ArrowDownLeftIcon className="text-green-500" />,
        info: <ArrowUpRightIcon className="text-blue-500" />,
        warning: <ShieldCheckIcon className="text-yellow-500" />,
        error: <ShieldCheckIcon className="text-red-500" />,
        admin: <ShieldCheckIcon className="text-purple-500" />,
    };
    return (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700/50`}>
            {iconMap[type] || <BellIcon />}
        </div>
    );
};

const NotificationItem: React.FC<{ notification: UserNotification; onNavigate: (link: string) => void }> = ({ notification, onNavigate }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const [isItemMenuOpen, setItemMenuOpen] = useState(false);
    const itemMenuRef = useRef(null);
    useClickOutside(itemMenuRef, () => setItemMenuOpen(false));

    // Parse messageParams if it's a string (from database)
    const parsedMessageParams = useMemo(() => {
        if (!notification.messageParams) return {};
        if (typeof notification.messageParams === 'string') {
            try {
                return JSON.parse(notification.messageParams);
            } catch (e) {
                console.error('[Notification] Error parsing messageParams:', e);
                return {};
            }
        }
        return notification.messageParams;
    }, [notification.messageParams]);

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return t('yearsAgo', { count: interval.toString(), defaultValue: `${interval} years ago` });
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return t('monthsAgo', { count: interval.toString(), defaultValue: `${interval} months ago` });
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return t('daysAgo', { count: interval.toString(), defaultValue: `${interval} days ago` });
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return t('hoursAgo', { count: interval.toString(), defaultValue: `${interval} hours ago` });
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return t('minutesAgo', { count: interval.toString(), defaultValue: `${interval} minutes ago` });
        }
        return t('justNow', { defaultValue: 'Just now' });
    };

    const handleToggleRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        context?.markSingleNotificationAsRead(notification.id, !notification.isRead);
        setItemMenuOpen(false);
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        context?.deleteSingleNotification(notification.id);
        setItemMenuOpen(false);
    }
    
    const handleItemClick = () => {
        if (notification.link) {
            onNavigate(notification.link);
        }
        if (!notification.isRead) {
            context?.markSingleNotificationAsRead(notification.id, true);
        }
    }

    return (
        <div 
            onClick={handleItemClick}
            className={`p-4 flex items-start space-x-3 rtl:space-x-reverse border-b border-gray-200 dark:border-gray-700/50 relative transition-colors duration-200 ${notification.link ? 'cursor-pointer' : ''} ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700/40'}`}
        >
            <NotificationIcon type={notification.type} />
            <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200"
                   dangerouslySetInnerHTML={{ __html: t(notification.messageKey, { defaultValue: notification.messageKey, ...parsedMessageParams }) }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo(notification.timestamp)}</p>
            </div>
            <div ref={itemMenuRef} className="relative flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setItemMenuOpen(p => !p); }} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {isItemMenuOpen && (
                    <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-20">
                        <button onClick={handleToggleRead} className="w-full text-start flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <CheckDoubleIcon className="w-5 h-5"/>
                            <span>{notification.isRead ? t('markAsUnread', { defaultValue: 'Mark as Unread' }) : t('markAsRead', { defaultValue: 'Mark as Read' })}</span>
                        </button>
                        <button onClick={handleDelete} className="w-full text-start flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                            <TrashIcon className="w-5 h-5"/>
                            <span>{t('delete', { defaultValue: 'Delete' })}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onNavigate }) => {
    const { t } = useTranslation();
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setMenuOpen(false));

    const allNotifications = useMemo(() => {
        if (!context?.user || !context.data?.notifications) return [];
        return context.data.notifications
            .filter(n => n.userId === context.user?.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [context?.data?.notifications, context?.user]);

    const displayedNotifications = useMemo(() => {
        if (activeTab === 'unread') {
            return allNotifications.filter(n => !n.isRead);
        }
        return allNotifications;
    }, [allNotifications, activeTab]);
    
    const unreadCount = useMemo(() => allNotifications.filter(n => !n.isRead).length, [allNotifications]);
    
    const groupNotificationsByDate = (notifications: UserNotification[]) => {
        const groups: { [key: string]: UserNotification[] } = {
            today: [],
            yesterday: [],
            older: [],
        };

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        notifications.forEach(n => {
            const nDate = new Date(n.timestamp);
            if (nDate.toDateString() === today.toDateString()) {
                groups.today.push(n);
            } else if (nDate.toDateString() === yesterday.toDateString()) {
                groups.yesterday.push(n);
            } else {
                groups.older.push(n);
            }
        });

        return groups;
    };

    const groupedNotifications = groupNotificationsByDate(displayedNotifications);

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div 
                className={`fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full max-w-sm bg-gray-50 dark:bg-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="notification-panel-title"
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800/80 backdrop-blur-sm sticky top-0">
                    <h2 id="notification-panel-title" className="text-xl font-bold text-gray-900 dark:text-white">{t('notifications', { defaultValue: 'Notifications' })}</h2>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div ref={menuRef} className="relative">
                             <button onClick={() => setMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <EllipsisVerticalIcon />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10">
                                    <button onClick={() => { context?.markNotificationsAsRead(); setMenuOpen(false); }} className="w-full text-start flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <CheckDoubleIcon className="w-5 h-5"/>
                                        <span>{t('markAllAsRead', { defaultValue: 'Mark all as read' })}</span>
                                    </button>
                                    <button onClick={() => { context?.clearReadNotifications(); setMenuOpen(false); }} className="w-full text-start flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <TrashIcon className="w-5 h-5"/>
                                        <span>{t('clearRead', { defaultValue: 'Clear read' })}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <CloseIcon />
                        </button>
                    </div>
                </header>
                 <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800/80">
                    <div className="flex bg-gray-200 dark:bg-gray-900/50 rounded-lg p-1">
                        <button onClick={() => setActiveTab('all')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>{t('all', { defaultValue: 'All' })}</button>
                        <button onClick={() => setActiveTab('unread')} className={`w-full py-2.5 rounded-md transition-all duration-200 text-sm font-semibold relative ${activeTab === 'unread' ? 'bg-white dark:bg-gray-700 shadow-md text-green-600 dark:text-green-400 font-bold' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                            {t('unread', { defaultValue: 'Unread' })}
                            {unreadCount > 0 && <span className="absolute top-1 right-2 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
                        </button>
                    </div>
                </div>
                <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
                    {displayedNotifications.length > 0 ? (
                        <div>
                            {groupedNotifications.today.length > 0 && (
                                <div>
                                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50">{t('today', { defaultValue: 'Today' })}</h3>
                                    {groupedNotifications.today.map(n => <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />)}
                                </div>
                            )}
                            {groupedNotifications.yesterday.length > 0 && (
                                <div>
                                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50">{t('yesterday', { defaultValue: 'Yesterday' })}</h3>
                                    {groupedNotifications.yesterday.map(n => <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />)}
                                </div>
                            )}
                            {groupedNotifications.older.length > 0 && (
                                <div>
                                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50">{t('older', { defaultValue: 'Older' })}</h3>
                                    {groupedNotifications.older.map(n => <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">{t('noNotificationsTitle', { defaultValue: 'No Notifications Yet' })}</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('noNotificationsBody', { defaultValue: 'Your recent notifications will appear here.' })}</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default NotificationPanel;