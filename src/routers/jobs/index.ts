import express from 'express';

import {getJobCountByEmployeeId, getJobsByEmployeeId, saveJob} from "../../controllers/jobs";

const router = express.Router();

router.post('', saveJob);

router.get('', getJobsByEmployeeId);

router.post('/_counts', getJobCountByEmployeeId);

export default router;
