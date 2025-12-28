import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import chatRouter from './routes/chat.routes';

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.PORT) console.log("PORT is not define is env, using default port 3000");

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

app.get('/health', (req, res) => {
    res.send('AI Support Agent API is running');
});

app.listen(port, () => {
    console.log(`Server running at port:${port}`);
});
