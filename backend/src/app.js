const express = require('express');
const sequelize = require('./config/database'); // DB 연결 설정
const User = require('./models/User'); // 모델 불러오기
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

//규칙 설정

//api 경로 설정(회원가입, 로그인) /api/auth요청 => authRoutes로 연결
app.use('/api/auth', authRoutes);





//서버 실행 및 DB 동기화
const PORT = process.env.PORT || 3000;




//핵심: 서버 켤 때 DB랑 동기화 (테이블 없으면 자동 생성)
sequelize.sync({ force: false }) // force: true면 켤 때마다 다 지우고 다시 만듦 (주의!)
  .then(() => {
    console.log('데이터베이스 연결 및 테이블 생성 완료!');
   
  })
  .catch((err) => {
    console.error('DB 연결 실패:', err);
  });

app.listen(3000, () => {
  console.log('서버 실행 중');
});