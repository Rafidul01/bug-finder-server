import express, { type Application, type Request, type Response } from 'express'
import { authRouter } from './modules/auth/auth.route';
import { issuesRouter } from './modules/issues/issues.route';
import cors from 'cors';
import { globalErrorHandler } from './middleware/globalErrorHandler';


const app : Application= express()

app.use(express.json());
app.use(express.text());

const corsOptions = {
  origin: 'http://localhost:3000',
}

app.use(cors(corsOptions));

app.get('/', (req : Request, res:Response) => {
  res.send('Hello World!')
})


app.use('/api/auth', authRouter);
app.use('/api/issues',issuesRouter)

app.use(globalErrorHandler)

export default app;