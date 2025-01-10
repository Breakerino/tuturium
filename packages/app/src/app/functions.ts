export const formatIBAN = (iban: string) => iban.replace(/\s+/g, '').toUpperCase().match(/.{1,4}/g)?.join(' ') || iban.replace(/\s+/g, '').toUpperCase();
export const formatAmount = (amount: number, currency: string) => `${amount.toFixed(2).toString().replace('.', ',')} ${currency}`;

export const formatTransactionName = (transaction: Record<string, any>) => {
	if ( transaction?.[transaction.amount >= 0 ? 'debtor' : 'creditor']?.name ) {
		return `${transaction?.[transaction.amount >= 0 ? 'debtor' : 'creditor']?.name}${transaction.description ? ` - ${transaction.description}` : ``}`;
	}
	
	if ( transaction.description ) {
		return transaction.description;
	}
	
	if ( transaction.additionalInformation ) {
		return transaction.additionalInformation;
	}
	
	return 'Transaction';
}

export const generateRandomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');