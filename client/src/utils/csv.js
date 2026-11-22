/**
 * CSV Import and Export Utilities for ByteBudget
 */

export const exportTransactionsToCSV = (transactions, filename = 'bytebudget-transactions.csv') => {
  if (!transactions || !transactions.length) return;

  const headers = ['Date', 'Type', 'Category', 'Subcategory', 'Budget Group', 'Amount', 'Description'];
  const rows = transactions.map((t) => {
    const date = new Date(t.date).toISOString().split('T')[0];
    const type = t.type;
    const category = `"${(t.category || '').replace(/"/g, '""')}"`;
    const subcategory = `"${(t.subcategory || '').replace(/"/g, '""')}"`;
    const budgetCategory = `"${(t.budgetCategory || '').replace(/"/g, '""')}"`;
    const amount = Number(t.amount) || 0;
    const description = `"${(t.description || '').replace(/"/g, '""')}"`;

    return [date, type, category, subcategory, budgetCategory, amount, description].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseTransactionsCSV = (csvText) => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV row parser handling quotes
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    const amount = parseFloat(rowObj['amount'] || rowObj['value'] || 0);
    if (!amount || isNaN(amount) || amount <= 0) continue;

    const type = (rowObj['type'] || 'expense').toLowerCase().includes('inc') ? 'income' : 'expense';
    const category = rowObj['category'] || (type === 'income' ? 'Salary' : 'Other');
    const subcategory = rowObj['subcategory'] || rowObj['sub category'] || rowObj['sub-category'] || '';
    const description = rowObj['description'] || rowObj['note'] || rowObj['memo'] || '';
    const date = rowObj['date'] ? new Date(rowObj['date']).toISOString() : new Date().toISOString();
    const budgetCategory = rowObj['budget group'] || rowObj['budgetcategory'] || '';

    results.push({
      type,
      category,
      subcategory,
      amount,
      description,
      date,
      budgetCategory,
    });
  }

  return results;
};
