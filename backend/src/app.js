// backend/src/app.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); // DB 연결 설정
const User = require('./models/User'); // 모델 불러오기
const Class = require('./models/class'); // Class 모델 불러오기
const ClassSchedule = require('./models/ClassSchedule');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// CORS 설정 (프론트 주소)
app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(express.json());

// /api/auth → authRoutes
app.use('/api/auth', authRoutes);

// 404 처리
app.use((req, res, next) => {
  console.log(`[404 에러] 경로를 찾을 수 없음: ${req.url}`);
  res.status(404).json({ message: `페이지를 찾을 수 없습니다: ${req.url}` });
});


// DB 동기화 후 서버 실행
sequelize.sync({ force: false })
//api 경로 설정(수업 목록) /api/courses요청 => 수업 조회 
// 클래스와 스케줄 관계 설정
Class.hasMany(ClassSchedule, { foreignKey: 'class_id', as: 'schedules' });
ClassSchedule.belongsTo(Class, { foreignKey: 'class_id' });

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Class.findAll({
      include: [{ model: ClassSchedule, as: 'schedules' }]
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error('수업 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


//서버 실행 및 DB 동기화




//핵심: 서버 켤 때 DB랑 동기화 (테이블 없으면 자동 생성)
sequelize.sync({ force: false }) // force: true면 켤 때마다 다 지우고 다시 만듦 (주의!)
  .then(() => {
    console.log('데이터베이스 연결 및 테이블 생성 완료!');
    app.listen(PORT, () => {
      console.log(`서버 실행 중! PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB 연결 실패:', err);
  });

  // ✅ 포트 8000으로 고정 (환경변수에 PORT가 있어도 8000 쓰고 싶으면 그냥 8000 상수로)
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`서버 실행 중: ${PORT}`);
});