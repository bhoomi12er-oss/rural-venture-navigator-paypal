const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const mockStore = require('../utils/mockStore');

const getProfile = async (req, res) => {
  try {
    let profile;
    if (global.dbConnected) {
      profile = await EntrepreneurProfile.findOne({ entrepreneurId: req.user._id });
    } else {
      profile = mockStore.findOne('entrepreneur_profiles', { entrepreneurId: req.user._id });
    }

    if (!profile) {
      // Return a default profile block to populate initial views
      return res.status(200).json({
        success: true,
        profile: {
          entrepreneurId: req.user._id,
          businessName: 'Mahila Millet Ventures',
          category: 'cookies',
          description: '',
          productionCapacity: 200,
          targetCustomers: '',
          location: 'Dhamtari, Chhattisgarh',
          languagePreference: 'en',
        }
      });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { 
    businessName, 
    category, 
    description, 
    productionCapacity, 
    targetCustomers, 
    location, 
    languagePreference 
  } = req.body;

  try {
    const profileData = {
      businessName,
      category,
      description,
      productionCapacity: Number(productionCapacity) || 200,
      targetCustomers,
      location,
      languagePreference: languagePreference || 'en',
    };

    let profile;
    if (global.dbConnected) {
      profile = await EntrepreneurProfile.findOneAndUpdate(
        { entrepreneurId: req.user._id },
        profileData,
        { new: true, upsert: true }
      );
    } else {
      profile = mockStore.findOneAndUpdate(
        'entrepreneur_profiles',
        { entrepreneurId: req.user._id },
        profileData,
        { upsert: true }
      );
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
