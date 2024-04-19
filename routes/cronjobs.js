const router = require("express").Router();

  //Remove ridelistings if date has passed(Add of that listing after deleting the listing )
router.delete("/removePastListings", async (req, res) => {
    try {
      // Find RideListings where the date is less than Date.now()
      const pastListings = await RideListings.find({ date: { $lt: Date.now() } });
  
      // Extract listing IDs for past listings
      const listingIds = pastListings.map(listing => listing._id);
  
      // Remove corresponding ride requests
      await RideRequests.deleteMany({ listingId: { $in: listingIds } });
  
      // Remove the past listings
      const removedListings = await RideListings.deleteMany({ _id: { $in: listingIds } });
  
      res.json({ success: true, removedListings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  //Remove Reviews if not given under 24hours
  router.delete("/removeUnsubmittedReviews", async (req, res) => {
    try {
      // Calculate the date 24 hours ago
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
      // Find reviews that are not given and created before 24 hours ago
      const unsubmittedReviews = await Reviews.find({
        isReviewGiven: false,
        createdAt: { $lte: twentyFourHoursAgo }
      });
  
      // Remove the unsubmitted reviews
      const removedReviews = await Reviews.deleteMany({
        _id: { $in: unsubmittedReviews.map(review => review._id) }
      });
  
      res.json({ success: true, removedReviews });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  //Remove Cloudinary Images
  router.delete('/removeCloudinaryImages', async (req, res)=>{
    try {
      const users = await User.find({}, 'image');
      const cloudinaryIds = users.map(user => {
        if (user.image) {
          const cloudinaryId = cloudinary.url(user.image, { type: 'fetch' }).split('/').slice(-1)[0].split('.')[0];
          return "nustWheelz/" + cloudinaryId;
        }
      }).filter(Boolean);
  
      // Modify the prefix to include the folder path
      const cloudinaryImages = await cloudinary.api.resources({ type: 'upload', max_results: 500, prefix: 'nustWheelz/' });
  
      const imagesToDelete = cloudinaryImages.resources.filter(image => !cloudinaryIds.includes(image.public_id));
      for (const image of imagesToDelete) {
        await cloudinary.uploader.destroy(image.public_id);
        console.log(`Deleted image with public ID: ${image.public_id}`);
      }
      res.json({ success: true, message: "Images in 'nustWheelz' folder deleted successfully" });
    } catch (error) {
      res.json({error: error.message, success: false})
    }
  })
  

  module.exports = router;
  