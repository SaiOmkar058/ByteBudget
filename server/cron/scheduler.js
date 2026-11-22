const cron = require('node-cron');
const Debt = require('../models/Debt');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

/**
 * Run recurring background automation for active subscriptions and automated EMIs.
 */
async function processRecurringItems() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Process Due Subscriptions
    const dueSubscriptions = await Subscription.find({
      isActive: true,
      nextDueDate: { $lte: new Date() },
    });

    for (const sub of dueSubscriptions) {
      // Create expense transaction for subscription
      await Transaction.create({
        user: sub.user,
        type: 'expense',
        category: sub.category || 'Entertainment',
        amount: sub.amount,
        description: `Subscription Renewal: ${sub.name}`,
        date: new Date(),
        budgetCategory: 'Want',
      });

      // Advance nextDueDate
      const nextDate = new Date(sub.nextDueDate);
      if (sub.billingCycle === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      sub.nextDueDate = nextDate;
      await sub.save();
    }

    if (dueSubscriptions.length > 0) {
      console.log(`[Cron] Processed ${dueSubscriptions.length} automated subscription renewal(s).`);
    }
  } catch (error) {
    console.error('[Cron] Error running scheduled jobs:', error);
  }
}

/**
 * Initialize all cron jobs.
 */
function initScheduler() {
  // Run every day at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', () => {
    console.log('[Cron] Running daily recurring finance checks...');
    processRecurringItems();
  });

  console.log('⏰ Background cron scheduler initialized.');
}

module.exports = { initScheduler, processRecurringItems };
