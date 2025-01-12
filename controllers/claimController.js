const { executeQuery } = require('../config/db'); // Adjust the path to your db.js file
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage }).fields([{ name: 'quote' }, { name: 'photos' }]);

// Search for a policy by policy code
const searchPolicyByCode = async (req, res) => {
  const { policyCode } = req.params;
  const query = 'SELECT * FROM policyrecords WHERE policyCode = ?';
  try {
    const results = await executeQuery(query, [policyCode]);
    if (results.length === 0) return res.status(404).send('Policy not found');
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error searching for policy:', error.message);
    res.status(500).send('Error searching for policy');
  }
};

// Search for a claim by incident number
const searchClaimByIncidentNumber = async (req, res) => {
  const { incidentNumber } = req.params;
  const query = 'SELECT * FROM claims WHERE incidentNumber = ?';
  try {
    const results = await executeQuery(query, [incidentNumber]);
    if (results.length === 0) return res.status(404).send('Claim not found');
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error searching for claim:', error.message);
    res.status(500).send('Error searching for claim');
  }
};

// Create a new claim
const createClaim = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).send('Error uploading files');
    
    const { incidentDate, claimValue, planType, fault, cause, remedy, serviceType,
      repairsRequired, notes, policyCode, dealerCode } = req.body;

    const incidentNumber = `IN${Math.floor(Math.random() * 90000) + 10000}`;
    const quote = req.files['quote'] ? req.files['quote'][0].path : null;
    const photos = req.files['photos'] ? req.files['photos'][0].path : null;

    const query = `
      INSERT INTO claims (incidentNumber, incidentDate, claimValue, planType, fault, cause, remedy, serviceType, repairsRequired, quote, photos, reportedDateTime, notes, policyCode, dealerCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `;

    try {
      await executeQuery(query, [
        incidentNumber, incidentDate, claimValue, planType, fault, cause, remedy,
        serviceType, repairsRequired, quote, photos, notes, policyCode, dealerCode
      ]);
      res.status(201).send({ message: 'Claim submitted successfully', incidentNumber });
    } catch (error) {
      console.error('Error submitting claim:', error.message);
      res.status(500).send('Error submitting claim');
    }
  });
};

// Get all claims
const getAllClaims = async (req, res) => {
  const query = 'SELECT * FROM claims';
  try {
    const results = await executeQuery(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching claims:', error.message);
    res.status(500).send('Error fetching claims');
  }
};

// Approve a claim
const approveClaim = async (req, res) => {
  const { claimId } = req.params;
  const approvalCode = `AP${Math.floor(Math.random() * 90000) + 10000}`;

  const query = 'UPDATE claims SET status = ?, approvalCode = ? WHERE id = ?';
  try {
    await executeQuery(query, ['Approved', approvalCode, claimId]);
    res.status(200).send({ message: 'Claim approved', approvalCode });
  } catch (error) {
    console.error('Error approving claim:', error.message);
    res.status(500).send('Error approving claim');
  }
};

// Decline a claim
const declineClaim = async (req, res) => {
  const { claimId } = req.params;
  const declineCode = `DC${Math.floor(Math.random() * 90000) + 10000}`;

  const query = 'UPDATE claims SET status = ?, declineCode = ? WHERE id = ?';
  try {
    await executeQuery(query, ['Declined', declineCode, claimId]);
    res.status(200).send({ message: 'Claim declined', declineCode });
  } catch (error) {
    console.error('Error declining claim:', error.message);
    res.status(500).send('Error declining claim');
  }
};

// Mark claim as pending with a specific reason
const pendingClaim = async (req, res) => {
  const { claimId } = req.params;
  const { status } = req.body;

  const query = 'UPDATE claims SET status = ? WHERE id = ?';
  try {
    await executeQuery(query, [status, claimId]);
    res.status(200).send({ message: `Claim marked as ${status}`, status });
  } catch (error) {
    console.error('Error setting claim as pending:', error.message);
    res.status(500).send('Error setting claim as pending');
  }
};

// Get claim details along with policy details
const getClaimWithPolicyDetails = async (req, res) => {
  const { claimId } = req.params;
  const query = `
    SELECT claims.*, policyrecords.policyCode, policyrecords.customerInitial, 
           policyrecords.customerName, policyrecords.customerSurname, policyrecords.title,
           policyrecords.vehicleMake, policyrecords.vehicleModel, policyrecords.vinNumber,
           policyrecords.vehicleRegistration, policyrecords.sellingDealer, 
           policyrecords.productDescription, policyrecords.productCode, 
           policyrecords.costOfPlan, policyrecords.startDate, policyrecords.startKm, 
           policyrecords.endDate, policyrecords.endKm, policyrecords.idNumber, 
           policyrecords.clientPhoneNumber, policyrecords.serviceRecords, policyrecords.status
    FROM claims
    JOIN policyrecords ON claims.policyCode = policyrecords.policyCode
    WHERE claims.id = ?
  `;

  try {
    const results = await executeQuery(query, [claimId]);
    if (results.length === 0) return res.status(404).send('Claim not found');
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching claim details:', error.message);
    res.status(500).send('Error fetching claim details');
  }
};

// Export all controller functions
module.exports = {
  searchPolicyByCode,
  searchClaimByIncidentNumber,
  getAllClaims,
  createClaim,
  approveClaim,
  declineClaim,
  pendingClaim,
  getClaimWithPolicyDetails,
};
