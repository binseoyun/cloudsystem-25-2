# main.py
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware



import google.generativeai as genai

import os
from dotenv import load_dotenv

#from mock_db import get_all_courses
from scheduler import generate_schedule

#.env 파일 로드
load_dotenv()

# 1. Gemini 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# 2. 모델 설정 (환경 변수를 통해 모델을 바꿀 수 있게 함)
GENAI_MODEL = os.getenv("GENAI_MODEL", "models/gemini-pro-latest")
model = genai.GenerativeModel(GENAI_MODEL)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 주소 허용 (보안상 실제 배포 때는 프론트엔드 주소만 적어야 함)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


    





# 프론트엔드 요청 데이터 구조 정의
class ScheduleRequest(BaseModel):
    # 사용자가 선택한 과목 ID 리스트 
    selected_course_ids: List[str] 
    
    # 시간표 조건 (프론트엔드 변수명과 일치시킴)
    preferences: Dict[str, Any]
    

@app.post("/api/schedule")
def create_schedule_endpoint(request: ScheduleRequest):
    try:
        courses = get_all_courses()
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    
    # 사용자가 선택한 과목이 0개면 에러 처리 
    if not request.selected_course_ids:
        raise HTTPException(status_code=400, detail="최소 1개 이상의 과목을 선택해주세요.")

    # 3가지 플랜 생성 (Seed를 다르게 주어서 변화를 줌)
    # Seed 0: 정석적인 추천 (Plan A)
    # Seed 1, 2: 약간의 랜덤성을 섞은 추천 (Plan B, C)
    plan_a = generate_schedule(courses, request.selected_course_ids, request.preferences, seed=10)
    plan_b = generate_schedule(courses, request.selected_course_ids, request.preferences, seed=20)
    plan_c = generate_schedule(courses, request.selected_course_ids, request.preferences, seed=30)
    
    # 결과가 하나라도 없으면 실패 메시지
    if not plan_a:
        return {
            "status": "fail",
            "message": "조건에 맞는 시간표를 생성할 수 없습니다. 학점 범위를 확인해주세요."
        }

    return {
        "status": "success",
        "data": {
            "PLAN A": plan_a,
            "PLAN B": plan_b,
            "PLAN C": plan_c
        }
    }


#수업 추천
class RecommendationRequest(BaseModel):
    major: str | None= None #학생 전공없어도 에러 안남(컴퓨터과학과 학생을 위한 서비스이니)
    job_interest: str #희망 직무
    courses: list[Dict[str, Any]] #DB에 있는 전체 강의 목록

@app.post("/recommend")
def recommand_courses(req: RecommendationRequest):
    try:
        # 1. mock_db.py에서 강의 데이터 직접 로딩
        #all_courses = get_all_courses()
        all_courses = req.courses

       # 2. AI에게 보낼 텍스트로 변환
        courses_text = "\n".join([
            f"- {c['code']} {c['name']} ({c['department']}): {c['time']} {','.join(c['day'])}" 
            for c in all_courses
        ])
        if req.major:
            student_intro=f"나는 {req.major} 전공 학생이고,"
        else:
            student_intro="나는 컴퓨터 과학과 학생이고,"    
        
        # 3. 프롬프트 작성 (JSON 형식을 강력하게 요구)
        prompt = f"""
        너는 대학교 수강신청 도우미 AI야.
        나는 {req.major} 전공 학생이고, 희망 직무는 '{req.job_interest}'야.
        
        아래는 우리 학교에 개설된 강의 목록이야:
        {courses_text}

        이 중에서 내 희망 직무와 가장 관련성이 높고 도움이 될만한 강의 3~4개를 추천해줘.
        
        [중요] 반드시 아래와 같은 순수한 JSON 형식으로만 답변해. 마크다운(```json)이나 다른 말은 절대 넣지 마.
        {{
            "recommended_codes": ["과목코드1", "과목코드2", "과목코드3"]
        }}
        """

        # 4. Gemini에게 질문하기
        response = model.generate_content(prompt)
        response_text = response.text.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(response_text)
        
        # 5. [중요] AI가 추천한 '코드'를 가지고, 실제 '강의 정보(객체)'를 찾아서 반환
        recommended_codes = result_json.get("recommended_codes", [])
        
        # mock_db 데이터 중에서 추천된 과목만 필터링
        final_recommendations = [
            c for c in all_courses 
            if c["code"] in recommended_codes
        ]
        
        return final_recommendations
        
        

    except Exception as e:
        print(f"AI Error: {e}")
        # 에러가 나면 빈 리스트라도 반환해서 프론트가 멈추지 않게 함
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)