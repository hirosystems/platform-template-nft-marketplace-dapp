export function storeTxid(txid: string) {
  const existingTxids = localStorage.getItem('txid') ? JSON.parse(localStorage.getItem('txid')!) : {};
  localStorage.setItem('txid', JSON.stringify({ ...existingTxids, txid }));
} 