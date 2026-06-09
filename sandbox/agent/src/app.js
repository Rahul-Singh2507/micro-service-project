import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
const app = express();


const WORKING_DIR = '/workspace';
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({message: 'Hello from Agent Service'

  });
})

app.get('/list-files',  async (req,res) => {

    const elemets = await fs.promises.readdir(WORKING_DIR);
    res.status(200).json({
message: 'Files in WORKING_DIR',
 elemets

    })


})


export default app;