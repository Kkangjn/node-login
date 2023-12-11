const express = require("express"); // express를 가져온다.
const app = express(); // express를 이용해서 app을 만들어준다.
require('dotenv').config(); 
const port = process.env.PORT || 5000; // port 번호를 5000번으로 설정
