//Since we are using async await so we use mysql2/promise
import mysql from "mysql2/promise";
let connection;
export const connectToDB = async () => {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
  }
  return connection;
};
