const express = require("express"); // express를 가져온다.
const app = express(); // express를 이용해서 app을 만들어준다.
require('dotenv').config(); 
const port = process.env.PORT || 5000; // port 번호를 5000번으로 설정

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter.js");


// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors(corsOptions));

app.use("/api/auths", authRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));