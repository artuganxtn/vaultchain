import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { User, Transaction, TransactionType, CryptoAsset } from './types';
import { useTranslation } from './contexts/LanguageContext';
import Card from './components/ui/Card';
import Modal from './components/ui/Modal';
import { SendIcon, InvestmentIcon, ProfitIcon, TetherIcon, ExclamationTriangleIcon, GiftIcon, CopyIcon, ReceiveIcon } from './components/ui/Icons';
import { AppContext } from './App';
import TransactionRow from './components/ui/TransactionRow';
import DepositModal from './components/wallet/DepositModal';
import InvestmentCard from './components/ui/InvestmentCard';
import TransactionDetailModal from './components/wallet/TransactionDetailModal';

interface WalletViewProps {
    user: User;
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
    // FIX: Add missing prop
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
        <button onClick={handleClick} title={title} className="flex flex-col items-center space-y-2 text-white/90 hover:text-white transition-colors group w-16 disabled:opacity-60 disabled:cursor-not-allowed">
            <div className="w-14 h-14 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                {React.cloneElement(icon, { className: "w-6 h-6 text-white" })}
            </div>
            <span className="text-xs font-semibold truncate">{label}</span>
        </button>
    );
};


const WalletView: React.FC<WalletViewProps> = (props) => {
  const { t } = useTranslation();
  const context = useContext(AppContext);
  const { user, isVerified, onVerifyClick, handleWithdrawalRequest, onFileDispute, onRefundDispute, onEscalateDispute } = props;
  
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
  // FIX: Initialize useRef with null to prevent potential issues with overloads that require an initial argument.
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [netWithdrawAmount, setNetWithdrawAmount] = useState(0);

  // General UI
  const [receiptDetails, setReceiptDetails] = useState<{ transaction: Transaction; recipientName: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setReceiptDetails(null);
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
  const { data, updateUser, addTransaction, adminAddTransaction } = context;
  const { users, transactions } = data;

  const userTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.userId === user.id || tx.recipientId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user.id]);

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
    const totalDebit = sendAmount + fee;

    let recipientUser: User | undefined;
    recipientUser = users.find(u => u.accountNumber === recipient || u.email === recipient);
    if (!recipientUser) { setErrors({ recipient: t('userNotFound') }); setIsSending(false); return; }

    const feeCollector = users.find(u => u.email === 'khtab7342@gmail.com');

    await updateUser({ ...user, balance: user.balance - totalDebit });
    await updateUser({ ...recipientUser, balance: recipientUser.balance + sendAmount });
    
    if (fee > 0 && feeCollector) {
        await updateUser({ ...feeCollector, balance: feeCollector.balance + fee });
        // FIX: Pass transaction object to adminAddTransaction.
        await adminAddTransaction(feeCollector.id, { description: `Fee from transfer by ${user.name}`, amount: fee, type: TransactionType.ADMIN_ADJUSTMENT, status: 'Completed' });
        // FIX: Pass transaction object to addTransaction.
        await addTransaction({ description: 'Transfer Fee', amount: -fee, type: TransactionType.PENALTY_FEE, status: 'Completed' });
    }

    const description = `Transfer to ${recipientUser.name}`;
    const txData: Omit<Transaction, 'id'|'date'|'userId'> = {
        description, 
        amount: -sendAmount, 
        type: TransactionType.INTERNAL_TRANSFER,
        recipientId: recipientUser.id,
        status: 'Completed',
    };
    
    const newTx = await addTransaction(txData);
    if (newTx) {
        setReceiptDetails({ transaction: newTx, recipientName: recipientUser.name });
        setSendModalOpen(false);
        setReceiptModalOpen(true);
    }
    setIsSending(false);
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

    const actionDisabled = !isVerified || !!user.isFrozen || !!user.isBanned;
    let disabledTitle = '';
    if (!isVerified) disabledTitle = t('verificationRequired');
    else if (user.isFrozen) disabledTitle = t('accountFrozen');
    else if (user.isBanned) disabledTitle = t('accountBanned');

    const actionButtonProps = {
        disabled: actionDisabled,
        title: disabledTitle,
        onDisabledClick: !isVerified ? onVerifyClick : () => {}, // Don't do anything for frozen/banned
    };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('myWallet')}</h2>
      
        <div>
            <div ref={scrollContainerRef} onScroll={() => { if (scrollContainerRef.current) setActiveCard(Math.round(scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth))}} className="grid grid-flow-col auto-cols-[100%] overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-6">
                <div className="snap-center px-4 sm:px-6">
                    <div className="relative p-6 rounded-3xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-2xl h-56 flex flex-col justify-between">
                        <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full"></div>
                        <div className="flex justify-between items-start z-10">
                            <h2 className="text-2xl font-bold notranslate">vaultchain</h2>
                            <div className="text-right rtl:text-left">
                                <p className="text-sm font-medium text-white/80">{t('mainBalance')}</p>
                                <p className="text-3xl font-bold tracking-tight">{user.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                {user.onHoldBalance > 0 && <p className="text-xs font-medium text-yellow-300">{t('onHoldBalance')}: {user.onHoldBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>}
                            </div>
                        </div>
                        <div className="z-10 text-left rtl:text-right"><p className="text-sm font-light text-white/90">{user.name}</p><p className="font-mono text-lg tracking-widest text-white mt-1">{user.accountNumber}</p></div>
                        <div className="flex items-start justify-around z-10">
                            <ActionButton icon={<ReceiveIcon />} label={t('Deposit')} onClick={() => setDepositModalOpen(true)} {...actionButtonProps} />
                            <ActionButton icon={<TetherIcon className="w-8 h-8 p-0.5" />} label={t('Withdrawal')} onClick={() => setIsWithdrawModalOpen(true)} {...actionButtonProps} />
                            <ActionButton icon={<SendIcon />} label={t('send')} onClick={() => { resetSendForm(); setSendModalOpen(true); }} {...actionButtonProps} />
                        </div>
                    </div>
                </div>
                <div className="snap-center px-4 sm:px-6"><InvestmentCard {...props} totalCopyTradingInvested={props.totalCopyTradingInvested} isCompact={true} /></div>
            </div>
            <div className="flex justify-center mt-4 space-x-2 rtl:space-x-reverse">
                {[0, 1].map(i => <div key={i} className={`w-2 h-2 rounded-full transition-colors ${activeCard === i ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>)}
            </div>
        </div>
      
      <Card>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('recentTransactions')}</h3>
        {userTransactions.length > 0 ? <div className="space-y-1">{userTransactions.slice(0, 5).map(tx => <TransactionRow key={tx.id} tx={tx} onSelect={setSelectedTx}/>)}</div> : <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noTransactions')}</p>}
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
                    <input value={amount} onChange={e => {setAmount(e.target.value); if(errors.amount) setErrors(p=>({...p,amount:''}))}} type="number" placeholder={t('amount')} className="w-full px-4 py-2 bg-gray-20