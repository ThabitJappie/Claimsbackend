const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');  // Ensure this path is correct

// Define routes
router.get('/search/:incidentNumber', claimController.searchClaimByIncidentNumber); // Ensure this function exists in claimController.js
router.get('/', claimController.getAllClaims); // Ensure this function exists
router.post('/create', claimController.createClaim); // Ensure this function exists
router.post('/approve/:claimId', claimController.approveClaim); // Ensure this function exists
router.post('/decline/:claimId', claimController.declineClaim); // Ensure this function exists
router.post('/pending/:claimId', claimController.pendingClaim); // Ensure this function exists
router.get('/details/:claimId', claimController.getClaimWithPolicyDetails);
router.get('/search/:policyCode', claimController.searchPolicyByCode);
router.get('/policy/search/:policyCode', claimController.searchPolicyByCode);

module.exports = router;



