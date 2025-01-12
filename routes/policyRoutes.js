const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');  // Ensure correct path to policyController

// Define routes
router.post('/create', policyController.createPolicy);
router.get('/all', policyController.getPolicies);
router.get('/search/:policyCode', policyController.searchPolicy);
router.put('/update/:policyCode', policyController.updatePolicy);
router.delete('/delete/:policyCode', policyController.deletePolicy);  // Correct delete route
router.get('/:policyCode', policyController.getPolicyByCode);

module.exports = router;


