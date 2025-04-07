## Installation
```bash
git init -y
git clone <repo_name.git>
npm install //install all dependencies
```

## Environment Variables
Add below environment variables in .env file and configure mysql database accordingly
PORT\
DB_USER\
DB_PORT\
DB_HOST\
DB_PASS\
DATABASE\
SECRET //for session secret\
TOKEN_SECRET //for jwt token

## DDL commands to create tables
The DDL commands for table structure are provided in below file
```bash
/db/ddl.sql
```

## Execution
```bash
npm run dev //starts nodemon server
```
