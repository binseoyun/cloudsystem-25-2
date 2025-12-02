# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from mock_db import get_all_courses
from scheduler import generate_schedule

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
    courses = get_all_courses()
    
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)