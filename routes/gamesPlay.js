import express from 'express';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const db = new sqlite3.Database(process.env.DATA_BASE_PATH);