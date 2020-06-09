import express from 'express';
import cors from 'cors';
import routes from './routes';

require('dotenv').config();

const port = process.env.PORT;
const app = express();

app.use(cors());
app.use(routes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
