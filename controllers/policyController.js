const { executeQuery } = require('../config/db'); // Adjust the path to your db.js
const multer = require('multer');

// Set up file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Helper function to format dates to YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return null; // Return null if no date provided
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Create a new policy
exports.createPolicy = (req, res) => {
  upload.single('serviceRecords')(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err.message);
      return res.status(500).send('Error uploading file');
    }

    const {
      customerInitials, customerName, customerSurname, title, sellingDealer, vehicleMake,
      vehicleModel, vinNumber, vehicleRegistration, productDescription, productCode,
      costOfPlan, startDate, startKm, endDate, endKm, idNumber, clientPhoneNumber
    } = req.body;

    const policyCode = `AS${Math.floor(Math.random() * 90000) + 10000}`; // Generate unique Policy Code
    const serviceRecordsPath = req.file ? req.file.path : null;

    const query = `
      INSERT INTO policyrecords 
      (policyCode, customerInitials, customerName, customerSurname, title, vehicleMake, 
      vehicleModel, vinNumber, vehicleRegistration, sellingDealer, productDescription, 
      productCode, costOfPlan, startDate, startKm, endDate, endKm, idNumber, 
      clientPhoneNumber, serviceRecords, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      await executeQuery(query, [
        policyCode, customerInitials, customerName, customerSurname, title, vehicleMake,
        vehicleModel, vinNumber, vehicleRegistration, sellingDealer, productDescription,
        productCode, costOfPlan, startDate, startKm, endDate, endKm, idNumber,
        clientPhoneNumber, serviceRecordsPath, 'Inactive'
      ]);
      res.status(201).send({ message: 'Policy created', policyCode });
    } catch (error) {
      console.error('Error creating policy:', error.message);
      res.status(500).send('Error creating policy');
    }
  });
};

// Get all policies
exports.getPolicies = async (req, res) => {
  const query = 'SELECT * FROM policyrecords';
  try {
    const results = await executeQuery(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching policies:', error.message);
    res.status(500).send('Error fetching policies');
  }
};

// Search for a policy by policy code
exports.searchPolicy = async (req, res) => {
  const { policyCode } = req.params;
  const query = 'SELECT * FROM policyrecords WHERE policyCode = ?';

  try {
    const results = await executeQuery(query, [policyCode]);
    if (results.length === 0) {
      return res.status(404).send('Policy not found');
    }
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching policy:', error.message);
    res.status(500).send('Error fetching policy');
  }
};

// Update a policy by policy code
exports.updatePolicy = async (req, res) => {
  const { policyCode } = req.params;
  const fieldsToUpdate = { ...req.body };

  // Remove 'id' from the fields to update if it exists
  delete fieldsToUpdate.id;

  // Format dates to YYYY-MM-DD if they exist
  if (fieldsToUpdate.startDate) {
    fieldsToUpdate.startDate = formatDate(fieldsToUpdate.startDate);
  }
  if (fieldsToUpdate.endDate) {
    fieldsToUpdate.endDate = formatDate(fieldsToUpdate.endDate);
  }

  const query = 'UPDATE policyrecords SET ? WHERE policyCode = ?';

  try {
    const result = await executeQuery(query, [fieldsToUpdate, policyCode]);
    if (result.affectedRows === 0) {
      return res.status(404).send('Policy not found');
    }
    res.status(200).send({ message: 'Policy updated successfully' });
  } catch (error) {
    console.error('Error updating policy:', error.message);
    res.status(500).send('Error updating policy');
  }
};

// Get policy details by policy code
exports.getPolicyByCode = async (req, res) => {
  const { policyCode } = req.params;
  const query = 'SELECT * FROM policyrecords WHERE policyCode = ?';

  try {
    const results = await executeQuery(query, [policyCode]);
    if (results.length === 0) {
      return res.status(404).send('Policy not found');
    }
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching policy details:', error.message);
    res.status(500).send('Error fetching policy details');
  }
};

// Delete a policy by policy code
exports.deletePolicy = async (req, res) => {
  const { policyCode } = req.params;
  const query = 'DELETE FROM policyrecords WHERE policyCode = ?';

  try {
    await executeQuery(query, [policyCode]);
    res.status(200).send({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error.message);
    res.status(500).send('Error deleting policy');
  }
};
