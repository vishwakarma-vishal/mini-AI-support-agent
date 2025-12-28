import { Router } from "express";
import { chatWithAgent, getChatHistory } from "../controllers/chat.controller";

const chatRouter = Router();

chatRouter.get('/history/:sessionId', getChatHistory);
chatRouter.post('/message', chatWithAgent);

export default chatRouter;