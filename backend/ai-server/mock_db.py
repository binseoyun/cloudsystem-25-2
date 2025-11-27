# mock_db.py

# 프론트엔드의 mockData.ts와 동일한 데이터
RAW_COURSES = [
  # 컴퓨터공학
  {"id": "1", "code": "CS301", "name": "데이터베이스 시스템", "credits": 3, "time": "09:00", "day": ["월", "수"], "department": "컴퓨터공학"},
  {"id": "2", "code": "CS302", "name": "운영체제", "credits": 3, "time": "11:00", "day": ["화", "목"], "department": "컴퓨터공학"},
  {"id": "3", "code": "CS303", "name": "머신러닝 기초", "credits": 3, "time": "14:00", "day": ["월", "수"], "department": "컴퓨터공학"},
  {"id": "4", "code": "CS304", "name": "웹 프로그래밍", "credits": 3, "time": "16:00", "day": ["화", "목"], "department": "컴퓨터공학"},
  {"id": "5", "code": "CS305", "name": "인공지능", "credits": 3, "time": "13:00", "day": ["금"], "department": "컴퓨터공학"},
  # 경영학
  {"id": "6", "code": "MGT301", "name": "재무관리", "credits": 3, "time": "10:00", "day": ["월", "수"], "department": "경영학"},
  {"id": "7", "code": "MGT302", "name": "마케팅 전략", "credits": 3, "time": "14:00", "day": ["화", "목"], "department": "경영학"},
  {"id": "8", "code": "MGT303", "name": "경영정보시스템", "credits": 3, "time": "16:00", "day": ["월", "수"], "department": "경영학"},
  # 경제학
  {"id": "9", "code": "ECON301", "name": "미시경제학", "credits": 3, "time": "09:00", "day": ["화", "목"], "department": "경제학"},
  {"id": "10", "code": "ECON302", "name": "거시경제학", "credits": 3, "time": "11:00", "day": ["월", "수"], "department": "경제학"},
  {"id": "11", "code": "ECON303", "name": "계량경제학", "credits": 3, "time": "15:00", "day": ["화", "목"], "department": "경제학"},
  # 통계학
  {"id": "12", "code": "STAT301", "name": "통계학개론", "credits": 3, "time": "10:00", "day": ["화", "목"], "department": "통계학"},
  {"id": "13", "code": "STAT302", "name": "데이터마이닝", "credits": 3, "time": "13:00", "day": ["월", "수"], "department": "통계학"},
  {"id": "14", "code": "STAT303", "name": "회귀분석", "credits": 3, "time": "15:00", "day": ["금"], "department": "통계학"},
  # 심리학
  {"id": "15", "code": "PSY301", "name": "소비자심리학", "credits": 3, "time": "11:00", "day": ["화", "목"], "department": "심리학"},
  {"id": "16", "code": "PSY302", "name": "조직심리학", "credits": 3, "time": "14:00", "day": ["월", "수"], "department": "심리학"},
  {"id": "17", "code": "PSY303", "name": "인지심리학", "credits": 3, "time": "16:00", "day": ["금"], "department": "심리학"},
  # 교양
  {"id": "18", "code": "GEN101", "name": "글쓰기와 의사소통", "credits": 2, "time": "09:00", "day": ["금"], "department": "교양"},
  {"id": "19", "code": "GEN102", "name": "비판적 사고", "credits": 2, "time": "11:00", "day": ["금"], "department": "교양"},
  {"id": "20", "code": "GEN103", "name": "영어회화", "credits": 2, "time": "10:00", "day": ["수"], "department": "교양"},
  {"id": "21", "code": "GEN104", "name": "세계문화의 이해", "credits": 3, "time": "13:00", "day": ["화", "목"], "department": "교양"},
]

DAY_MAP = {"월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6}

def parse_time_str(time_str):
    """ '09:00' -> 9.0 """
    h, m = map(int, time_str.split(':'))
    return h + (m / 60.0)

def preprocess_course(course):
    """ 문자열 데이터를 계산 가능한 숫자로 변환 """
    start_time = parse_time_str(course["time"])
    # 수업 시간: 주2회면 1.5시간, 주1회면 학점만큼 진행한다고 가정
    duration = 1.5 if len(course["day"]) >= 2 else float(course["credits"])
    end_time = start_time + duration

    formatted_times = []
    for d in course["day"]:
        if d in DAY_MAP:
            formatted_times.append({
                "day": DAY_MAP[d],
                "start": start_time,
                "end": end_time
            })
    
    new_course = course.copy()
    new_course["times"] = formatted_times
    return new_course

def get_all_courses():
    return [preprocess_course(c) for c in RAW_COURSES]