const axios = require('axios');
const Class = require('../models/Class'); // 실제 수업 모델 불러오기

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:5000';

exports.getRecommendation = async (req, res) => {
    try {
        const { jobInterest, major } = req.body;


        // 1. DB에서 전체 강의 목록 가져오기 (AI가 고를 후보군)
        const allCourses = await Course.findAll({
            attributes: ['code', 'name', 'professor', 'time', 'day', 'department', 'description']
        }); 
        /*
        // 데이터 정제 (필요한 정보만 추림)
        const courseData = allCourses.map(c => ({
            code: c.code,
            name: c.name,
            description: c.description || c.name // 강의 설명이 없으면 이름으로 대체
        }));
*/
        // 2. Python AI 서버로 요청 보내기
        // (주의: Python 서버는 5000번 포트)
        const response = await axios.post(`${AI_SERVER_URL}/recommend`, {
            major,
            job_interest: jobInterest,
            courses: allCourses //DB 데이터 통째로 전달
        });

        // 3. AI가 추천한 과목 코드(['CS101', 'CS202'])를 받음
        //const recommendedCodes = response.data.recommended_codes;

        // 4. 코드에 해당하는 실제 강의 정보를 DB에서 다시 조회해서 프론트에 전달
        //const recommendedCourses = allCourses.filter(c => 
          //  recommendedCodes.includes(c.code)
        //);

        //res.status(200).json(recommendedCourses);
        res.status(200).json(response.data);

    } catch (error) {
        const detail = error.response?.data || error.message;
        console.error('AI 추천 에러:', detail);
        res.status(500).json({ message: 'AI 분석 중 오류가 발생했습니다.', detail });
    }
};