const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Estimate = require('../models/Estimate');
const Client = require('../models/Client');
const Item = require('../models/Item');

// POST /estimate/create
router.post('/create', auth, async (req, res) => {
  try {
    const { client, items, totalAmount } = req.body; // client is an object, items is array
    
    // Save or update client
    let newClient = new Client({
      userId: req.user.id,
      name: client.name,
      mobile: client.mobile,
      address: client.address
    });
    await newClient.save();

    // Create Estimate
    const newEstimate = new Estimate({
      userId: req.user.id,
      clientId: newClient.id,
      totalAmount: totalAmount
    });
    await newEstimate.save();

    // Save Items
    const savedItems = [];
    for (let item of items) {
      const newItem = new Item({
        estimateId: newEstimate.id,
        userId: req.user.id,
        itemName: item.itemName,
        length: item.length,
        width: item.width,
        qty: item.qty,
        rate: item.rate,
        sqft: item.sqft,
        amount: item.amount
      });
      await newItem.save();
      savedItems.push(newItem);
    }

    res.json({ msg: 'Estimate created perfectly', estimate: newEstimate, client: newClient, items: savedItems });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /estimate/all
router.get('/all', auth, async (req, res) => {
  try {
    const estimates = await Estimate.find({ userId: req.user.id })
                                    .populate('clientId')
                                    .sort({ date: -1 });
    res.json(estimates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /estimate/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const estimate = await Estimate.findOne({ _id: req.params.id, userId: req.user.id }).populate('clientId');
    if (!estimate) return res.status(404).json({ msg: 'Estimate not found' });
    
    const items = await Item.find({ estimateId: estimate.id, userId: req.user.id });
    
    res.json({ estimate, client: estimate.clientId, items });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /estimate/update/:id
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { client, items, totalAmount } = req.body;
    let estimate = await Estimate.findOne({ _id: req.params.id, userId: req.user.id });
    if (!estimate) return res.status(404).json({ msg: 'Estimate not found' });

    // Update client
    await Client.findByIdAndUpdate(estimate.clientId, { $set: client });

    // Update estimate
    estimate.totalAmount = totalAmount;
    await estimate.save();

    // Update items (delete old, insert new for simplicity)
    await Item.deleteMany({ estimateId: estimate.id, userId: req.user.id });
    for (let item of items) {
      const newItem = new Item({
        ...item,
        estimateId: estimate.id,
        userId: req.user.id
      });
      await newItem.save();
    }

    res.json({ msg: 'Estimate updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /estimate/delete/:id
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    let estimate = await Estimate.findOne({ _id: req.params.id, userId: req.user.id });
    if (!estimate) return res.status(404).json({ msg: 'Estimate not found' });

    await Item.deleteMany({ estimateId: estimate.id });
    await Estimate.deleteOne({ _id: estimate.id });
    
    res.json({ msg: 'Estimate removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
