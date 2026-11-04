# PrintBox API

## Description
PrintBox is a RESTful API developed to manage a product catalog. This project supports CRUD (Create, Read, Update, and Delete) operations on product records, following development best practices to keep the code scalable, modular, and easy to maintain.

## Technologies and Tools

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MySQL (through XAMPP)
* **ORM (Object-Relational Mapping):** Sequelize (for managing models, migrations, and seeders)
* **Architecture:** Clean Architecture (layered separation: Domain, Application, Infrastructure, and API)
* **Documentation and Testing:** Swagger (for interactive documentation) and Postman (for endpoint testing)

## Local Installation and Execution

1. Install the project dependencies:
   `npm install`
2. Configure the database credentials in the `.env` file.
3. Run the migrations and seed the database with sample data:
   `npm run db:migrate`
   `npm run db:seed`
4. Start the development server:
   `npm run dev`

## Documentation
Once the server is running, interactive endpoint documentation is available at `http://localhost:3000/api/docs`.
