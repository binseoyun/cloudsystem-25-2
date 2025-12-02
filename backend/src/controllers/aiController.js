const axios = require('axios');


exports.getRecommendation = async (req, res) => {
    try {
        const { jobInterest, major } = req.body;
/*
DB조회 코드 삭제(python이 mock_db 가지고 있어서)
        // 1. DB에서 전체 강의 목록 가져오기 (AI가 고를 후보군)
        const allCourses = await Course.findAll(); 
        
        // 데이터 정제 (필요한 정보만 추림)
        const courseData = allCourses.map(c => ({
            code: c.code,
            name: c.name,
            description: c.description || c.name // 강의 설명이 없으면 이름으로 대체
        }));
*/
        // 2. Python AI 서버로 요청 보내기
        // (주의: Python 서버는 5000번 포트)
        const response = await axios.post('http://127.0.0.1:5000/recommend', {
            major,
            job_interest: jobInterest,
            //courses: courseData
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
        console.error('AI 추천 에러:', error);
        res.status(500).json({ message: 'AI 분석 중 오류가 발생했습니다.' });
    }
};