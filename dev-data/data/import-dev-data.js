import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import { Tour } from './../../models/tourModel.js';

const __dirname = fileURLToPath(new URL('../..', import.meta.url));
const toursData  = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const PORT = 8000;
const URL_DB = "mongodb+srv://admin:VrwzMsnU2S2Vn0dp@cluster0.bmulhpo.mongodb.net/natours?retryWrites=true&w=majority";

mongoose.connect(URL_DB).then(connection => {
    console.log('DB connected...');
}).catch(err => {
    console.log(err, err.message);
});


async function importData(){
    try{
        await Tour.create(toursData);
        console.log('Data importada para a database.');
        process.exit();
    }catch(err){
        console.log(err);
    }
};

async function deleteData(){
    try{
        await Tour.deleteMany();
        console.log('All Data Deleted from Database.');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2] === '--import') importData();
else if(process.argv[2] === '--delete') deleteData();