import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { User, Transaction, TransactionType, CryptoAsset } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { SendIcon, ExclamationTriangleIcon, GiftIcon, CopyIcon, ReceiveIcon, ChevronDownIcon, CurrencyDollarIcon, TetherIcon } from '../components/ui/Icons';
import { AppContext } from '../App';
import TransactionRow from '../components/ui/TransactionRow';
import DepositModal from '../components/wallet/DepositModal';
import TransactionDetailModal from '../components/wallet/TransactionDetailModal';
import TransactionReceipt from '../components/wallet/TransactionReceipt';
import InvestmentCard from '../components/ui/InvestmentCard';
import * as api from '../services/api';

// Declare jspdf and html2canvas from window object
declare const jspdf: any;
declare const html2canvas: any;


interface WalletViewProps {
    user: User;
    users: User[];
    assets: CryptoAsset[];
    todaysProfit: number;
    isVerified: boolean;
    onVerifyClick: () => void;
    handleAddToInvestment: (amount: number) => Promise<boolean>;
    handleWithdrawProfit: () => Promise<boolean>;
    handleRequestInvestmentWithdrawal: () => Promise<boolean | 'pending'>;
    handleWithdrawalRequest: (amount: number, details: Transaction['withdrawalDetails']) => void;
    onFileDispute: (transactionId: string, reason: string, details: string) => Promise<boolean>;
    onRefundDispute: (transactionId: string) => void;
    onEscalateDispute: (transactionId: string) => void;
    areProfitsWithdrawable: boolean;
    totalCopyTradingInvested: number;
}

const ActionButton: React.FC<{ icon: React.ReactElement<any>; label: string; onClick: () => void; disabled?: boolean; title?: string; onDisabledClick?: () => void; }> = ({ icon, label, onClick, disabled = false, title, onDisabledClick }) => {
    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            onDisabledClick?.();
        } else {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            title={title}
            disabled={disabled}
            className="flex flex-col items-center justify-center space-y-2 py-4 bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/80 dark:border-green-400/20 rounded-2xl shadow-md dark:shadow-lg dark:shadow-black/20 text-center transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                {React.cloneElement(icon, { className: "w-6 h-6 text-green-600 dark:text-green-300" })}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        </button>
    );
};


const WalletView: React.FC<WalletViewProps> = (props) => {
  const { t } = useTranslation();
  const context = useContext(AppContext);
  const { user, users, isVerified, onVerifyClick, handleWithdrawalRequest, onFileDispute, onRefundDispute, onEscalateDispute, totalCopyTradingInvested, todaysProfit: todaysStakingProfit } = props;
  
  // Modals and Forms
  const [isSendModalOpen, setSendModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDisputeSuccessOpen, setDisputeSuccessOpen] = useState(false);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  
  // Send Logic
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Withdraw Logic
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT (TRC20)');
  const [withdrawErrors, setWithdrawErrors] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState(9);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [netWithdrawAmount, setNetWithdrawAmount] = useState(0);


  // General UI & Receipt
  const [receiptDetails, setReceiptDetails] = useState<{ transaction: Transaction; sender: User, recipient: User | null } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [showProfitDetails, setShowProfitDetails] = useState(false);

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setReceiptDetails(null);
  };
  
    const handleDownloadPdf = () => {
        const input = receiptRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`receipt-${receiptDetails?.transaction.id}.pdf`);
        });
    };

  useEffect(() => {
    const amountNum = parseFloat(withdrawAmount);
    if (!isNaN(amountNum) && amountNum > 0) {
        const fee = user.isFeeExempt ? 0 : amountNum * 0.055;
        setWithdrawFee(fee);
        setNetWithdrawAmount(amountNum - fee);
    } else {
        setWithdrawFee(0);
        setNetWithdrawAmount(0);
    }
  }, [withdrawAmount, user.isFeeExempt]);

  useEffect(() => {
    if (withdrawStep === 'confirm' && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [withdrawStep, countdown]);

  if (!context || !context.user || !context.data) return null;
  const { data, updateUser, addTransaction, adminAddTransaction, refetchData } = context;
  const { transactions, agentProfitConfig } = data;
  
  // Force re-render when transactions change by using transactions length as dependency
  const transactionsKey = transactions?.length || 0;
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force update when transactions array reference changes
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      setForceUpdate(prev => prev + 1);
      console.log('[WalletView] Transactions array changed, forcing update. Count:', transactions.length);
    }
  }, [transactions]);

  const userTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    // Only show transactions where the user is the owner (userId)
    // For internal transfers, each user has their own transaction record:
    // - Sender has: userId=senderId, amount=-X, description="Transfer to {recipient}"
    // - Recipient has: userId=recipientId, amount=+X, description="Transfer from {sender}"
    // Don't show transactions where recipientId === user.id (that's the other party's transaction)
    const filtered = transactions
      .filter(tx => tx.userId === user.id) // Only show transactions owned by this user
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log('[WalletView] userTransactions updated, count:', filtered.length, 'Latest:', filtered[0]?.id, 'Force update:', forceUpdate);
    return filtered;
  }, [transactions, user.id, forceUpdate]);

    const todaysCopyTradingProfit = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return transactions
            .filter(tx => tx.userId === user.id && tx.type === TransactionType.COPY_TRADING_PROFIT && tx.date.startsWith(todayStr))
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions, user.id]);

    const todaysTeamBonus = useMemo(() => {
        const today = new Date();
        if (today.getDay() === 0 || today.getDay() === 6) return 0;
        if (!user.isAgent) return 0;
        
        const teamCapital = user.referrals
            .map(ref => users.find(u => u.id === ref.userId))
            .filter(Boolean)
            .reduce((sum, u) => sum + (u!.invested || 0), 0);

        return teamCapital * (agentProfitConfig.teamCapitalBonusRate || 0);
    }, [user, users, agentProfitConfig]);

    const totalDailyProfit = todaysStakingProfit + todaysCopyTradingProfit + todaysTeamBonus;
    const totalInvested = user.invested + totalCopyTradingInvested;
    const totalBalance = user.balance + totalInvested;

  const resetSendForm = () => { setRecipient(''); setAmount(''); setErrors({}); };
  
  const resetWithdrawState = () => {
    setIsWithdrawModalOpen(false);
    setTimeout(() => { // Delay reset to allow modal to fade out
        setWithdrawStep('form');
        setWithdrawAmount('');
        setCryptoAddress('');
        setCryptoNetwork('USDT (TRC20)');
        setWithdrawErrors({});
        setCountdown(9);
    }, 300);
  };
  
  const validateSend = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const sendAmount = parseFloat(amount);
    const fee = user.isFeeExempt ? 0 : sendAmount * 0.025;
    if (!amount || isNaN(sendAmount) || sendAmount <= 0) newErrors.amount = t('amountRequired');
    else if (sendAmount < 25) newErrors.amount = t('minTransferError');
    else if (user.balance < (sendAmount + fee)) newErrors.amount = t('insufficientFundsForTx');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const accountNumberRegex = /^\d{8}$/;
    if (!recipient || (!emailRegex.test(recipient) && !accountNumberRegex.test(recipient))) {
        newErrors.recipient = t('invalidRecipientIdentifier', { defaultValue: "Invalid recipient email or account number."});
    } else if (recipient === user.accountNumber || recipient === user.email) {
        newErrors.recipient = t('cannotSendToSelf');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateWithdrawal = (): boolean => {
      const newErrors: { [key: string]: string } = {};
      const wAmount = parseFloat(withdrawAmount);
      if (!withdrawAmount || isNaN(wAmount) || wAmount <= 0) {
          newErrors.amount = t('amountRequired');
      } else if (wAmount < 100) {
          newErrors.amount = t('minimumWithdrawalIs', {amount: '$100'});
      } else if (wAmount > user.balance) {
          newErrors.amount = t('insufficientFunds');
      }

      if (!cryptoAddress.trim()) newErrors.address = t('addressRequired');
      
      setWithdrawErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };


  const handleSend = async () => {
    if (!validateSend()) return;
    setIsSending(true);
    const sendAmount = parseFloat(amount);
    const fee = user.isFeeExempt ? 0 : sendAmount * 0.025;

    let recipientUser: User | undefined;
    recipientUser = users.find(u => u.accountNumber === recipient || u.email === recipient);
    if (!recipientUser) { setErrors({ recipient: t('userNotFound') }); setIsSending(false); return; }

    // Find fee collector account by ID (system account for collecting transfer fees)
    const feeCollector = users.find(u => u.id === 'fee_collector');

    try {
      // Use backend API to process transfer atomically
      const result = await api.processInternalTransfer(
        user.id,
        recipientUser.id,
        sendAmount,
        fee,
        feeCollector?.id
      );

      if (result.success && result.transaction) {
        console.log('[WalletView] Transfer successful, refetching data...');
        // Refetch data first to get updated balances and transactions
        await refetchData();
        // Wait a bit longer to ensure state has fully updated
        await new Promise(resolve => setTimeout(resolve, 200));
        // Force another refetch to ensure we have the latest data
        await refetchData();
        // Then show receipt with updated data
        setReceiptDetails({ transaction: result.transaction, sender: user, recipient: recipientUser });
        setSendModalOpen(false);
        setReceiptModalOpen(true);
        console.log('[WalletView] Receipt modal opened');
      }
    } catch (error: any) {
      console.error('[Transfer] Error:', error);
      setErrors({ recipient: error.message || t('transferFailed') || 'Transfer failed. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleProceedToConfirm = () => {
      if (validateWithdrawal()) {
          setWithdrawStep('confirm');
          setCountdown(9); // Reset countdown
      }
  };
  
  const handleConfirmWithdrawal = async () => {
      const wAmount = parseFloat(withdrawAmount);
      const details: Transaction['withdrawalDetails'] = {
          method: 'crypto',
          cryptoAddress: cryptoAddress,
          cryptoNetwork: cryptoNetwork,
      };
      await handleWithdrawalRequest(wAmount, details);
      setWithdrawStep('success');
  };

    const getWithdrawalModalTitle = () => {
        switch(withdrawStep) {
            case 'form': return t('cryptoWithdrawalDetails');
            case 'confirm': return t('confirmWithdrawal');
            case 'success': return t('withdrawalRequested');
            default: return t('withdrawFunds');
        }
    };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('myWallet')}</h2>
      
        <div className="grid grid-flow-col auto-cols-[100%] overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="snap-center w-full">
                 <div className="relative p-6 rounded-3xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-2xl">
                    <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold notranslate">VaultChain</h2>
                            <div className="text-sm text-end font-light text-white/90">
                                <p>{user.name}</p>
                                <p className="font-mono">{user.accountNumber}</p>
                            </div>
                        </div>

                        <hr className="my-3 border-white/20" />

                        <div className="space-y-1 text-sm font-medium">
                            <div className="flex justify-between"><span>{t('totalBalance')}</span><span className="font-bold tracking-tight">{totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                            <div className="flex justify-between"><span>{t('availableBalance')}</span><span className="font-bold tracking-tight">{user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                            <div className="flex justify-between"><span>{t('investedInSystems')}</span><span className="font-bold tracking-tight">{totalInvested.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                        </div>
                        
                        <hr className="my-3 border-white/20" />

                        <div className="space-y-2">
                            <button onClick={() => setShowProfitDetails(!showProfitDetails)} className="w-full flex justify-between items-center text-sm font-medium">
                                <span>{t('todaysProfits')}</span>
                                <span className="font-bold flex items-center tracking-tight">
                                    {totalDailyProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    <ChevronDownIcon className={`w-4 h-4 ms-2 transition-transform ${showProfitDetails ? 'rotate-180' : ''}`} />
                                </span>
                            </button>
                            {showProfitDetails && (
                                <div className="text-xs space-y-1 ps-4 text-white/80 animate-fade-in-down">
                                    <div className="flex justify-between"><span>{t('stakingProfit')}</span><span className="font-mono">{todaysStakingProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                    <div className="flex justify-between"><span>{t('copyTradingProfit')}</span><span className="font-mono">{todaysCopyTradingProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                    {user.isAgent && todaysTeamBonus > 0 && <div className="flex justify-between"><span>{t('teamBonus')}</span><span className="font-mono">{todaysTeamBonus.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="snap-center w-full">
                <InvestmentCard
                    user={props.user}
                    todaysProfit={props.todaysProfit}
                    isVerified={props.isVerified}
                    onVerifyClick={props.onVerifyClick}
                    handleAddToInvestment={props.handleAddToInvestment}
                    handleWithdrawProfit={props.handleWithdrawProfit}
                    handleRequestInvestmentWithdrawal={props.handleRequestInvestmentWithdrawal}
                    areProfitsWithdrawable={props.areProfitsWithdrawable}
                    totalCopyTradingInvested={props.totalCopyTradingInvested}
                />
            </div>
        </div>
      
        <div className="grid grid-cols-3 gap-4">
            <ActionButton icon={<ReceiveIcon />} label={t('Deposit')} onClick={() => setDepositModalOpen(true)} disabled={!isVerified || !!user.isFrozen || !!user.isBanned} title={!isVerified ? t('verificationRequired') : (user.isFrozen ? t('accountFrozen') : (user.isBanned ? t('accountBanned') : ''))} onDisabledClick={!isVerified ? onVerifyClick : () => {}} />
            <ActionButton icon={<CurrencyDollarIcon />} label={t('Withdrawal')} onClick={() => setIsWithdrawModalOpen(true)} disabled={!isVerified || !!user.isFrozen || !!user.isBanned} title={!isVerified ? t('verificationRequired') : (user.isFrozen ? t('accountFrozen') : (user.isBanned ? t('accountBanned') : ''))} onDisabledClick={!isVerified ? onVerifyClick : () => {}} />
            <ActionButton icon={<SendIcon />} label={t('send')} onClick={() => { resetSendForm(); setSendModalOpen(true); }} disabled={!isVerified || !!user.isFrozen || !!user.isBanned} title={!isVerified ? t('verificationRequired') : (user.isFrozen ? t('accountFrozen') : (user.isBanned ? t('accountBanned') : ''))} onDisabledClick={!isVerified ? onVerifyClick : () => {}} />
        </div>

      <Card>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('recentTransactions')}</h3>
        {userTransactions.length > 0 ? <div className="space-y-1" key={`transactions-${transactionsKey}-${forceUpdate}`}>{userTransactions.slice(0, 5).map(tx => <TransactionRow key={tx.id} tx={tx} onSelect={setSelectedTx}/>)}</div> : <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noTransactions')}</p>}
      </Card>
      
      {/* Modals */}
      {selectedTx && <TransactionDetailModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} transaction={selectedTx} user={user} allUsers={users} onFileDispute={onFileDispute} onRefundDispute={onRefundDispute} onEscalateDispute={onEscalateDispute} onDisputeSuccess={() => setDisputeSuccessOpen(true)} />}
      {isDepositModalOpen && <DepositModal isOpen={isDepositModalOpen} onClose={() => setDepositModalOpen(false)} />}
      <Modal isOpen={isSendModalOpen} onClose={() => setSendModalOpen(false)} title={t('sendFunds')}>
        <div className="space-y-4">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">{t('internalTransfer')}</p>
            <div className="space-y-3">
                <div>
                    <input value={recipient} onChange={e => {setRecipient(e.target.value); if(errors.recipient) setErrors(p=>({...p,recipient:''}))}} type="text" placeholder={t('recipientsAccountNumber')} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    {errors.recipient && <p className="text-red-500 text-xs mt-1 px-1">{errors.recipient}</p>}
                </div>
                <div>
                    <input value={amount} onChange={e => {setAmount(e.target.value); if(errors.amount) setErrors(p=>({...p,amount:''}))}} type="number" placeholder={t('amount')} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    {errors.amount && <p className="text-red-500 text-xs mt-1 px-1">{errors.amount}</p>}
                </div>
            </div>
            <button onClick={handleSend} disabled={isSending} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70">{isSending ? t('processing') : t('sendNow')}</button>
        </div>
      </Modal>
      <Modal isOpen={isReceiptModalOpen} onClose={closeReceiptModal} title={t('receipt_title', { defaultValue: 'Transaction Receipt' })}>
         {receiptDetails && (
            <div>
                 <div ref={receiptRef}>
                    <TransactionReceipt
                        transaction={receiptDetails.transaction}
                        sender={receiptDetails.sender}
                        recipient={receiptDetails.recipient}
                        allUsers={users}
                    />
                </div>
                 <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={handleDownloadPdf} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">{t('receipt_download_pdf', { defaultValue: 'Download PDF' })}</button>
                    <button onClick={closeReceiptModal} className="w-full py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('close')}</button>
                </div>
            </div>
        )}
      </Modal>
      <Modal isOpen={isDisputeSuccessOpen} onClose={() => setDisputeSuccessOpen(false)} title={t('disputeSubmittedTitle')}><div className="text-center py-4 space-y-4"><div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center"><svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><p className="text-gray-700 dark:text-gray-300">{t('disputeSubmittedMessage')}</p><button onClick={() => setDisputeSuccessOpen(false)} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('close')}</button></div></Modal>
      
      {/* WITHDRAWAL MODAL */}
      <Modal isOpen={isWithdrawModalOpen} onClose={resetWithdrawState} title={getWithdrawalModalTitle()}>
          {withdrawStep === 'form' && <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amountToWithdraw')}</label><input type="number" value={withdrawAmount} onChange={e=>{setWithdrawAmount(e.target.value); if(withdrawErrors.amount) setWithdrawErrors(p=>({...p,amount:''}))}} placeholder="0.00" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" /><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('availableBalance')}: {user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>{withdrawErrors.amount && <p className="text-red-500 text-xs mt-1">{withdrawErrors.amount}</p>} {withdrawAmount && parseFloat(withdrawAmount) >= 100 && (<div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md"><div className="flex justify-between"><span>{t('fee')}</span><span>- {withdrawFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div><div className="flex justify-between font-semibold"><span>{t('youWillReceive')}</span><span>{netWithdrawAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div></div>)}</div><><input type="text" value={cryptoAddress} onChange={e=>{setCryptoAddress(e.target.value); if(withdrawErrors.address) setWithdrawErrors(p=>({...p,address:''}))}} placeholder={t('cryptoAddress')} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />{withdrawErrors.address && <p className="text-red-500 text-xs mt-1">{withdrawErrors.address}</p>}<select value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"><option>USDT (TRC20)</option><option>BTC</option><option>ETH (ERC20)</option></select></><div className="flex items-center space-x-3 rtl:space-x-reverse pt-2"><button onClick={resetWithdrawState} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button><button onClick={handleProceedToConfirm} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90">{t('next')}</button></div></div>}
          {withdrawStep === 'confirm' && <div className="space-y-4"><div className="space-y-2 text-sm border-t border-b dark:border-gray-600 py-3"><div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('amountToWithdraw')}</span><span className="font-medium">{parseFloat(withdrawAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div><div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('fee')}</span><span className="font-medium text-red-500">- {withdrawFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div><div className="flex justify-between font-bold text-base mt-1 pt-1 border-t dark:border-gray-600"><span className="text-gray-600 dark:text-gray-300">{t('youWillReceive')}</span><span>{netWithdrawAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div></div><div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 rounded-r-lg"><div className="flex"><ExclamationTriangleIcon className="w-5 h-5 me-3 flex-shrink-0" /><p className="text-sm font-medium">{t('withdrawalWarning')}</p></div></div><p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('withdrawalProcessingTime')}</p><div className="flex items-center space-x-3 rtl:space-x-reverse pt-2"><button onClick={resetWithdrawState} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button><button onClick={handleConfirmWithdrawal} disabled={countdown > 0} className="w-full py-3 bg-gradient-to-tr from-green-500 to-emerald-700 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-wait">{countdown > 0 ? t('confirmAfterCountdown', {countdown}) : t('confirm')}</button></div></div>}
          {withdrawStep === 'success' && <div className="text-center py-4 space-y-4"><div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center"><svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><p className="text-gray-700 dark:text-gray-300">{t('withdrawalSuccessMessage')}</p><button onClick={resetWithdrawState} className="w-full py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('close')}</button></div>}
      </Modal>

    </div>
  );
};

export default WalletView;