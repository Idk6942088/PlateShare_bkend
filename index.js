import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());


app.get('/', (req, resp) => resp.send('Élelmiszermentő platform v1.0.0'));

app.listen(88, (error) => {
    if(error) console.log(error);
    else console.log('Server on 88 port');
})