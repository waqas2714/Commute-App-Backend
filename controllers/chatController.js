const Chat = require("../models/Chat");

const addChat = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);

    res.json(chat);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndDelete(chatId);

    res.json(chat);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getChat = async (req, res) => {
  try {
    const { from, to } = req.params;

    const chat = await Chat.find({
      $or: [
        { $and: [{ from: from }, { to: to }] },
        { $and: [{ from: to }, { to: from }] },
      ],
    });

    chat.sort((a, b) => a.createdAt - b.createdAt);

    res.json(chat);
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = {
  addChat,
  removeChat,
  getChat,
};
