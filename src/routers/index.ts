import express from 'express';
import ping from 'src/controllers/ping';
import jobs from "./jobs";

const router = express.Router();

router.get('/ping', ping);

router.use('/api/jobs', jobs);

export default router;
