const path = require('path');
const db = require('../db');

exports.getExpensePage = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const [expenses] = await db.execute('SELECT * FROM expenses WHERE user_id = ?', [userId]);
        res.sendFile(path.join(__dirname, '../views/expenses.html'));
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).send('Error fetching expenses. Please try again.');
    }
};

exports.addExpense = async (req, res) => {
    const { amount, description, category } = req.body;
    const userId = req.session.user.id;

    if (!amount || isNaN(amount) || !description || !category) {
        return res.status(400).send('Invalid input');
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO expenses (user_id, amount, description, category) VALUES (?, ?, ?, ?)',
            [userId, amount, description, category]
        );
        const newExpense = { id: result.insertId, amount, description, category };
        res.json(newExpense);
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).send('Error adding expense. Please try again.');
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    if (!id || isNaN(id)) {
        return res.status(400).send('Invalid expense ID');
    }

    try {
        const [result] = await db.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Expense not found');
        }

        res.status(200).send('Expense deleted successfully');
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).send('Error deleting expense. Please try again.');
    }
};
