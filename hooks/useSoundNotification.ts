import { useEffect, useRef } from 'react';
import { UserNotification } from '../types';

interface UseSoundNotificationProps {
    notifications: UserNotification[];
    userId: string | undefined;
    enabled?: boolean;
}

/**
 * Hook to play sound notification when new money-related notifications arrive
 */
export const useSoundNotification = ({ notifications, userId, enabled = true }: UseSoundNotificationProps) => {
    const previousNotificationIdsRef = useRef<Set<string>>(new Set());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                audioRef.current = new Audio('/sounds/notification.m4a');
                audioRef.current.volume = 0.7; // Set volume to 70%
                audioRef.current.preload = 'auto';
                
                // Handle audio loading errors
                audioRef.current.addEventListener('error', (e) => {
                    console.warn('[Sound Notification] Audio file could not be loaded:', e);
                });
            } catch (error) {
                console.warn('[Sound Notification] Could not initialize audio:', error);
            }
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!enabled || !userId || !notifications.length || !audioRef.current) return;

        // Filter notifications for this user
        const userNotifications = notifications.filter(n => n.userId === userId);
        
        // Find new notifications (not in previous set)
        const newNotifications = userNotifications.filter(
            n => !previousNotificationIdsRef.current.has(n.id)
        );

        // Check if any new notification is money-related
        const moneyRelatedKeys = [
            'notif_received_money',
            'notif_deposit_approved',
            'notif_investment_withdrawal_approved',
            'notif_withdrawal_approved',
            'notif_balance_adjusted'
        ];

        const hasMoneyNotification = newNotifications.some(notification => {
            // Check if it's a money-related notification
            const isMoneyRelated = moneyRelatedKeys.includes(notification.messageKey);
            
            // Also check if it's a success type (usually means money received)
            const isSuccessType = notification.type === 'success';
            
            // Check if message contains money-related keywords
            const messageParams = notification.messageParams 
                ? (typeof notification.messageParams === 'string' 
                    ? JSON.parse(notification.messageParams) 
                    : notification.messageParams)
                : {};
            const hasAmount = messageParams.amount !== undefined;
            
            return isMoneyRelated || (isSuccessType && hasAmount);
        });

        // Play sound if there's a new money-related notification
        if (hasMoneyNotification && audioRef.current) {
            try {
                // Reset audio to start from beginning
                audioRef.current.currentTime = 0;
                
                // Play the sound
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Handle autoplay restrictions
                        // Some browsers require user interaction before playing audio
                        // The sound will work after the first user interaction
                        if (error.name !== 'NotAllowedError') {
                            console.log('[Sound Notification] Could not play sound:', error);
                        }
                    });
                }
            } catch (error) {
                console.warn('[Sound Notification] Error playing sound:', error);
            }
        }

        // Update the set of known notification IDs
        userNotifications.forEach(n => {
            previousNotificationIdsRef.current.add(n.id);
        });

        // Clean up old notification IDs (keep only last 100 to prevent memory issues)
        if (previousNotificationIdsRef.current.size > 100) {
            const idsArray = Array.from(previousNotificationIdsRef.current);
            const recentIds = idsArray.slice(-50);
            previousNotificationIdsRef.current = new Set(recentIds);
        }
    }, [notifications, userId, enabled]);
};

