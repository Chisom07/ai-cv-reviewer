const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cvController = require('../controllers/cvController');

router.post('/upload', upload.single('cv'), cvController.uploadCV);
router.post('/analyse', cvController.analyse);
router.post('/match-jobs', cvController.matchJobs);
router.get('/history', cvController.history);

module.exports = router;