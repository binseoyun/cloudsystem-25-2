const express = require('express');
const sequelize = require('./config/database'); // DB 연결 설정
const User = require('./models/User'); // 모델 불러오기
const Class = require('./models/class'); // Class 모델 불러오기
const ClassSchedule = require('./models/ClassSchedule');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

// 개발 편의를 위한 간단한 CORS 허용 (로컬 개발용)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    return res.sendStatus(200);
  }
  next();
});

//규칙 설정

//api 경로 설정(회원가입, 로그인) /api/auth요청 => authRoutes로 연결
app.use('/api/auth', authRoutes);

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
   
  })
  .catch((err) => {
    console.error('DB 연결 실패:', err);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버 실행 중: ${PORT}`);
});