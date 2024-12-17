const Chat = require("../models/Chat");
const RideListings = require("../models/rideListingsModel");

const addChat = async (req, res) => {
  try {
    const {listingId, userId} = req.params;
    const {message} = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "Chat creation failed" });
    }

    const chat = await Chat.create({message, listingId, from:userId});
    console.log(chat);
    if (!chat) {
      return res.status(400).json({ success: false, error: "Chat creation failed." });

      throw new Error("Something went wrong while sending the message. Please try again.");
    }
    res.json({success : true});
  } catch (error) {
    res.json({success : false, error: error.message });
  }
};

const removeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndDelete(chatId);

    res.json({chat, message: "Chat deleted successfully"});
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all listings where the userId is either the driver or a passenger
    const listings = await RideListings.find({
      $or: [
        { driverId: userId },
        { 'passengers.userId': userId }
      ]
    });

    console.log(`initiallistings: ${listings}`);

    
    const chats = listings.map(listing => {
      console.log(`listing: ${listing}`);
      
      return {
        departure: listing.departure,
        destination: listing.destination,
        date: listing.date,
        time: listing.time,
        listingId: listing._id,
        isDriver: userId == listing.driverId
      };
    });

    res.json({success:true, chats});
  } catch (error) {
    res.json({ success : false, error: error.message });
  }
};

const getChat = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Find all chats associated with the given listingId, populate the 'from' field to get user details, and sort them by creation time (oldest first)
    const chats = await Chat.find({ listingId })
      .populate('from', 'username _id')
      .sort({ createdAt: 1 });

      console.log(`chats: ${chats}`);

    // Extract required information (username, _id, message) from each chat
    const formattedChats = chats.map(chat => {
      return {
        username: chat.from.username,
        _id: chat.from._id,
        message: chat.message
      };
    });

    res.json({ success: true, chats: formattedChats });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

module.exports = {
  addChat,
  removeChat,
  getAllChats,
  getChat
};
