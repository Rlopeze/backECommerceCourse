import dotenv from "dotenv";
import Product from '../models/product.js';
import mongoose from 'mongoose';
import products from './data.js';

dotenv.config({ path: "./.env" });


const seedProducts = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany();
    console.log('Products are deleted');

    await Product.insertMany(products);
    console.log('All Products are added.');

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
}

seedProducts();