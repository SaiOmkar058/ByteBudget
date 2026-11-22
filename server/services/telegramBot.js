/**
 * ByteBudget Telegram Bot Service
 *
 * Implements Telegram long polling for ByteBudget:
 * - Single-instance polling guard.
 * - Secure single-use account linking via 5-minute cryptographic codes.
 * - Telegram numeric user ID linking (prevents duplicate account links).
 * - Commands: /start, /help, /link, /unlink, /balance, /recent.
 * - Natural language transaction creation with duplicate update safeguards.
 * - Graceful shutdown and error handling.
 */

const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { parseTelegramMessage } = require('./telegramParser');

let botInstance = null;
let isPollingActive = false;

// Duplicate protection: track message identifiers for 10 minutes
const processedMessages = new Map();

function isDuplicateMessage(chatId, messageId) {
  if (!messageId) return false;
  const key = `${chatId}:${messageId}`;
  const now = Date.now();
  if (processedMessages.has(key)) {
    return true;
  }
  processedMessages.set(key, now);

  // Periodic pruning of records older than 10 minutes
  if (processedMessages.size > 2000) {
    for (const [k, time] of processedMessages.entries()) {
      if (now - time > 10 * 60 * 1000) {
        processedMessages.delete(k);
      }
    }
  }
  return false;
}

/**
 * Format currency with Indian Rupee symbol or user preference
 */
function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Find ByteBudget user linked to a Telegram numeric chat/user ID
 */
async function findLinkedUser(telegramId) {
  if (!telegramId) return null;
  return await User.findOne({ telegramChatId: String(telegramId) });
}

/**
 * Initializes and starts the Telegram Bot polling instance.
 */
function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.trim() === '') {
    console.warn('⚠️ [Telegram Bot] TELEGRAM_BOT_TOKEN is not configured in .env. Bot will not start.');
    return null;
  }

  // Prevent multiple polling instances
  if (botInstance && isPollingActive) {
    console.log('ℹ️ [Telegram Bot] Polling instance is already running.');
    return botInstance;
  }

  try {
    botInstance = new TelegramBot(token, { polling: true });
    isPollingActive = true;
    console.log('🤖 [Telegram Bot] Long polling started successfully.');

    // Graceful error logging
    botInstance.on('polling_error', (error) => {
      console.error(`[Telegram Polling Error] ${error.code || error.message}`);
    });

    botInstance.on('error', (error) => {
      console.error(`[Telegram Bot Error] ${error.message}`);
    });

    // Handle commands and messages
    setupCommandHandlers(botInstance);

    return botInstance;
  } catch (error) {
    console.error(`❌ [Telegram Bot] Failed to initialize: ${error.message}`);
    isPollingActive = false;
    return null;
  }
}

/**
 * Stop polling gracefully on application shutdown.
 */
async function stopTelegramBot() {
  if (botInstance && isPollingActive) {
    try {
      console.log('🛑 [Telegram Bot] Stopping long polling...');
      await botInstance.stopPolling();
      isPollingActive = false;
      botInstance = null;
      console.log('✅ [Telegram Bot] Stopped successfully.');
    } catch (err) {
      console.error(`[Telegram Bot] Error while stopping polling: ${err.message}`);
    }
  }
}

/**
 * Register command routes and message listeners
 */
function setupCommandHandlers(bot) {
  // ─── /start ─────────────────────────────────────────────────────────────
  bot.onText(/^\/start\b/i, async (msg) => {
    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    try {
      const user = await findLinkedUser(chatId);
      if (user) {
        return bot.sendMessage(
          chatId,
          `👋 *Welcome back to ByteBudget, ${user.name}!* 📊\n\n` +
          `Your Telegram account is linked to *${user.email}*.\n\n` +
          `You can record transactions anytime by texting me:\n` +
          `• _Spent 150 on lunch_\n` +
          `• _Paid 800 for electricity_\n` +
          `• _Received 26000 salary_\n` +
          `• _Invested 1000 in SIP_\n\n` +
          `Use /balance to view your balance or /recent for recent activity. Type /help for all commands.`,
          { parse_mode: 'Markdown' }
        );
      }

      bot.sendMessage(
        chatId,
        `👋 *Welcome to ByteBudget Bot!* 📊\n\n` +
        `Track your expenses, income, and investments directly from Telegram.\n\n` +
        `*To link your ByteBudget account:*\n` +
        `1. Open ByteBudget in your browser.\n` +
        `2. Go to *Settings* ➔ *Telegram Bot*.\n` +
        `3. Click *Generate Linking Code*.\n` +
        `4. Send the code here as:\n` +
        `   \`/link YOUR_CODE\`\n\n` +
        `⏱️ _Linking codes expire in 5 minutes for your security._`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('[Telegram /start Error]', err.message);
      bot.sendMessage(chatId, 'An error occurred while processing /start. Please try again later.');
    }
  });

  // ─── /help ──────────────────────────────────────────────────────────────
  bot.onText(/^\/help\b/i, async (msg) => {
    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    bot.sendMessage(
      chatId,
      `📖 *ByteBudget Bot Help & Commands*\n\n` +
      `*Account Commands:*\n` +
      `• /link \`<CODE>\` — Link your ByteBudget account\n` +
      `• /unlink — Disconnect your Telegram account\n` +
      `• /balance — View your current total income, expenses, and balance\n` +
      `• /recent — View your 5 most recent transactions\n` +
      `• /help — Show this help message\n\n` +
      `*Adding Expenses:*\n` +
      `• \`Spent 150 on lunch\`\n` +
      `• \`Paid 800 for electricity\`\n` +
      `• \`Spent 200 on petrol\`\n` +
      `• \`Bought 450 groceries\`\n\n` +
      `*Adding Income:*\n` +
      `• \`Received 26000 salary\`\n` +
      `• \`Received 500 from freelance work\`\n` +
      `• \`Got 200 cashback\`\n\n` +
      `*Adding Investments:*\n` +
      `• \`Invested 1000 in SIP\`\n` +
      `• \`Invested 2000 in RD\`\n` +
      `• \`Invested 5000 in stocks\`\n\n` +
      `💡 _Investments are categorized as Savings/Investment in your budget rules._`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /link ──────────────────────────────────────────────────────────────
  bot.onText(/^\/link(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    const rawCode = match[1];
    if (!rawCode || !rawCode.trim()) {
      return bot.sendMessage(
        chatId,
        `🔗 *Account Linking Instructions:*\n\n` +
        `1. Open ByteBudget in your browser.\n` +
        `2. Go to *Settings* ➔ *Telegram Bot*.\n` +
        `3. Click *Generate Linking Code*.\n` +
        `4. Send the code here as:\n` +
        `   \`/link YOUR_CODE\`\n\n` +
        `Example: \`/link A3F9C1\``,
        { parse_mode: 'Markdown' }
      );
    }

    const code = rawCode.trim().toUpperCase();

    try {
      // Find user with this active code
      const user = await User.findOne({
        'telegramLinkingCode.code': code,
      });

      if (!user) {
        return bot.sendMessage(
          chatId,
          '❌ *Invalid linking code.*\n\nPlease verify your code in ByteBudget Settings and try again.',
          { parse_mode: 'Markdown' }
        );
      }

      // Check if code has expired
      if (!user.telegramLinkingCode.expiresAt || new Date() > user.telegramLinkingCode.expiresAt) {
        // Clear expired code
        user.telegramLinkingCode = { code: null, expiresAt: null };
        await user.save();
        return bot.sendMessage(
          chatId,
          '⏱️ *This linking code has expired.*\n\nLinking codes are valid for 5 minutes. Please generate a fresh code in ByteBudget Settings.',
          { parse_mode: 'Markdown' }
        );
      }

      // Check if this Telegram ID is already linked to a DIFFERENT ByteBudget account
      const existingAccount = await User.findOne({
        telegramChatId: String(chatId),
        _id: { $ne: user._id },
      });

      if (existingAccount) {
        return bot.sendMessage(
          chatId,
          `⚠️ *This Telegram account is already linked to another ByteBudget account* (${existingAccount.email}).\n\n` +
          `Please unlink that account first using /unlink before linking a new account.`,
          { parse_mode: 'Markdown' }
        );
      }

      // Successfully link account and invalidate code
      user.telegramChatId = String(chatId);
      user.telegramLinkingCode = { code: null, expiresAt: null };
      await user.save();

      bot.sendMessage(
        chatId,
        `✅ *Account Linked Successfully!*\n\n` +
        `Welcome, *${user.name}*! Your Telegram account is now connected to *${user.email}*.\n\n` +
        `You can now log transactions directly from chat:\n` +
        `• _Spent 150 on lunch_\n` +
        `• _Received 26000 salary_\n` +
        `• _Invested 1000 in SIP_\n\n` +
        `Check your balance anytime with /balance.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('[Telegram /link Error]', err.message);
      bot.sendMessage(chatId, '❌ An error occurred while linking your account. Please try again.');
    }
  });

  // ─── /unlink ────────────────────────────────────────────────────────────
  bot.onText(/^\/unlink\b/i, async (msg) => {
    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    try {
      const user = await findLinkedUser(chatId);
      if (!user) {
        return bot.sendMessage(
          chatId,
          'ℹ️ This Telegram account is not currently linked to any ByteBudget account.'
        );
      }

      user.telegramChatId = undefined;
      user.telegramLinkingCode = { code: null, expiresAt: null };
      await user.save();

      bot.sendMessage(
        chatId,
        `✅ *Your Telegram account has been unlinked from ByteBudget.* (${user.email})\n\n` +
        `You can reconnect anytime using /link with a new code from Settings.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('[Telegram /unlink Error]', err.message);
      bot.sendMessage(chatId, '❌ Failed to unlink account. Please try again.');
    }
  });

  // ─── /balance ───────────────────────────────────────────────────────────
  bot.onText(/^\/balance\b/i, async (msg) => {
    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    try {
      const user = await findLinkedUser(chatId);
      if (!user) {
        return bot.sendMessage(
          chatId,
          `⚠️ *Your Telegram account is not linked to ByteBudget.*\n\n` +
          `Please log in to ByteBudget, go to *Settings* ➔ *Telegram Bot*, generate a code, and send \`/link YOUR_CODE\` here.`,
          { parse_mode: 'Markdown' }
        );
      }

      // Calculate balance using existing ByteBudget logic
      const transactions = await Transaction.find({ user: user._id });
      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          totalIncome += amt;
        } else if (t.type === 'expense') {
          totalExpenses += amt;
        }
      });

      const balance = totalIncome - totalExpenses;
      const balanceSign = balance >= 0 ? '+' : '';

      bot.sendMessage(
        chatId,
        `💰 *ByteBudget Financial Summary*\n\n` +
        `👤 *Account:* ${user.name}\n` +
        `🟢 *Total Income:* ${formatAmount(totalIncome)}\n` +
        `🔴 *Total Expenses:* ${formatAmount(totalExpenses)}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💵 *Net Balance:* *${balanceSign}${formatAmount(balance)}*\n` +
        `📊 *Total Transactions:* ${transactions.length}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('[Telegram /balance Error]', err.message);
      bot.sendMessage(chatId, '❌ Could not retrieve balance. Please try again later.');
    }
  });

  // ─── /recent ────────────────────────────────────────────────────────────
  bot.onText(/^\/recent\b/i, async (msg) => {
    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    try {
      const user = await findLinkedUser(chatId);
      if (!user) {
        return bot.sendMessage(
          chatId,
          `⚠️ *Your Telegram account is not linked to ByteBudget.*\n\n` +
          `Send \`/link YOUR_CODE\` to connect your account.`,
          { parse_mode: 'Markdown' }
        );
      }

      const recentTxns = await Transaction.find({ user: user._id })
        .sort({ date: -1 })
        .limit(5);

      if (!recentTxns || recentTxns.length === 0) {
        return bot.sendMessage(
          chatId,
          `📭 *No transactions recorded yet.*\n\n` +
          `Try logging one now! For example:\n` +
          `_Spent 150 on lunch_\n` +
          `_Received 26000 salary_\n` +
          `_Invested 1000 in SIP_`,
          { parse_mode: 'Markdown' }
        );
      }

      let responseText = `📋 *Your 5 Most Recent Transactions:*\n\n`;
      recentTxns.forEach((txn, index) => {
        const isIncome = txn.type === 'income';
        const icon = isIncome ? '🟢' : '🔴';
        const sign = isIncome ? '+' : '-';
        const dateStr = new Date(txn.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        });
        const categoryLabel = txn.subcategory ? `${txn.category} (${txn.subcategory})` : txn.category;
        const desc = txn.description || categoryLabel;

        responseText += `${index + 1}. ${icon} *${sign}${formatAmount(txn.amount)}* • ${desc}\n` +
                        `    └ _${categoryLabel}_ • ${dateStr}\n`;
      });

      bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('[Telegram /recent Error]', err.message);
      bot.sendMessage(chatId, '❌ Could not retrieve recent transactions.');
    }
  });

  // ─── Natural Language Transaction Messages ──────────────────────────────
  bot.on('message', async (msg) => {
    // Ignore commands or empty/non-text messages
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    if (isDuplicateMessage(chatId, msg.message_id)) return;

    try {
      // 1. Authenticate user by Telegram Chat ID
      const user = await findLinkedUser(chatId);
      if (!user) {
        return bot.sendMessage(
          chatId,
          `⚠️ *Your Telegram account is not linked to ByteBudget.*\n\n` +
          `To record transactions automatically, please connect your account:\n` +
          `1. Open ByteBudget in your browser.\n` +
          `2. Go to *Settings* ➔ *Telegram Bot*.\n` +
          `3. Click *Generate Linking Code*.\n` +
          `4. Send \`/link YOUR_CODE\` here.\n\n` +
          `Type /help for more instructions.`,
          { parse_mode: 'Markdown' }
        );
      }

      // 2. Parse natural language message
      const parseResult = parseTelegramMessage(msg.text);

      if (!parseResult.success) {
        return bot.sendMessage(
          chatId,
          `❓ *Could not understand that transaction.*\n\n` +
          `${parseResult.reason}\n\n` +
          `*Examples:*\n` +
          `• \`Spent 150 on lunch\`\n` +
          `• \`Paid 800 for electricity\`\n` +
          `• \`Received 26000 salary\`\n` +
          `• \`Invested 1000 in SIP\`\n\n` +
          `Type /help for supported formats.`,
          { parse_mode: 'Markdown' }
        );
      }

      // 3. Create the transaction
      const transaction = await Transaction.create({
        user: user._id,
        type: parseResult.type,
        category: parseResult.category,
        subcategory: parseResult.subcategory || '',
        amount: parseResult.amount,
        description: parseResult.description,
        budgetCategory: parseResult.budgetCategory || '',
        date: new Date(),
      });

      // 4. Send Confirmation Response (Section 6 format)
      const typeDisplay = parseResult.type === 'income' ? 'Income' : 'Expense';
      let confirmation =
        `✅ *Transaction added successfully!*\n\n` +
        `*Type:* ${typeDisplay}\n` +
        `*Amount:* ${formatAmount(transaction.amount)}\n` +
        `*Category:* ${transaction.category}\n` +
        (transaction.subcategory ? `*Subcategory:* ${transaction.subcategory}\n` : '') +
        `*Description:* ${transaction.description}`;

      if (transaction.budgetCategory === 'Savings/Investment') {
        confirmation += `\n*Budget Rule:* 💰 Savings / Investment`;
      }

      bot.sendMessage(chatId, confirmation, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('[Telegram Transaction Error]', err.message);
      bot.sendMessage(
        chatId,
        `❌ *Failed to record transaction:*\n${err.message || 'Please try again.'}`,
        { parse_mode: 'Markdown' }
      );
    }
  });
}

module.exports = {
  startTelegramBot,
  stopTelegramBot,
  findLinkedUser,
  isDuplicateMessage,
};
