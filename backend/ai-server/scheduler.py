from ortools.sat.python import cp_model
import random

def check_time_conflict(c1, c2):
    """ 두 강의가 시간이 겹치면 True 반환 """
    for t1 in c1['times']:
        for t2 in c2['times']:
            if t1['day'] == t2['day']:
                # (Start1 < End2) AND (End1 > Start2)
                if (t1['start'] < t2['end']) and (t1['end'] > t2['start']):
                    return True
    return False

def generate_schedule(courses, selected_ids, preferences, seed=0):
    model = cp_model.CpModel()
    
    # 1. [전처리] 사용자 선택 과목 확정
    target_ids = selected_ids[:7] if selected_ids else []
    fixed_course_ids = []
    course_map = {c['id']: c for c in courses}

    for cid in target_ids:
        if cid not in course_map: continue
        
        current_course = course_map[cid]
        is_conflict = False
        
        for fixed_cid in fixed_course_ids:
            if check_time_conflict(current_course, course_map[fixed_cid]):
                is_conflict = True
                break
        
        if not is_conflict:
            fixed_course_ids.append(cid)

    # 2. [모델링] 변수 생성
    selected = {} 
    for course in courses:
        selected[course['id']] = model.NewBoolVar(f"course_{course['id']}")

    # 제약조건 추가
    for f_id in fixed_course_ids:
        model.Add(selected[f_id] == 1)

    model.Add(sum(selected.values()) <= 7)

    for i in range(len(courses)):
        for j in range(i + 1, len(courses)):
            c1 = courses[i]
            c2 = courses[j]
            if check_time_conflict(c1, c2):
                model.Add(selected[c1['id']] + selected[c2['id']] <= 1)

    min_c = preferences.get("minCredits", 12)
    max_c = preferences.get("maxCredits", 18)
    
    total_credits = sum(selected[c['id']] * int(c['credits']) for c in courses)
    model.Add(total_credits >= min_c)
    model.Add(total_credits <= max_c)

    # 3. [최적화] 점수 계산 (다양성 확보를 위한 로직 강화)
    # Seed 값을 이용해 난수 생성기 초기화
    random.seed(seed) 
    
    # [전략] Plan마다 서로 다른 '행운의 요일'을 부여해서 구성을 확 바꿈
    # 예: Plan A는 월요일 수업 선호, Plan B는 화요일 수업 선호...
    lucky_day = seed % 5 

    objective_terms = []
    for course in courses:
        # 기본 점수: 학점 * 10 (3학점 = 30점)
        score = int(course['credits']) * 10
        
        # [변동성 강화 1] 랜덤 점수 폭을 ±30으로 대폭 증가
        # 이러면 2학점짜리가 3학점짜리를 이길 수도 있음 -> 시간표가 바뀜
        if course['id'] not in fixed_course_ids:
            noise = random.randint(-30, 30)
            score += noise

        # [변동성 강화 2] 행운의 요일 보너스
        # 이 Plan에서는 특정 요일 수업에 가산점을 줌
        for t in course['times']:
            if t['day'] == lucky_day:
                score += 20 

        # 사용자 조건 반영
        if preferences.get("avoidMorning"):
             for t in course['times']:
                 if t['start'] < 11.0: score -= 50
        
        if preferences.get("avoidEvening"):
             for t in course['times']:
                 if t['end'] > 18.0: score -= 50
                 
        if preferences.get("preferLongBreak"):
            for t in course['times']:
                if (t['start'] < 13.0) and (t['end'] > 12.0):
                    score -= 20

        objective_terms.append(selected[course['id']] * score)

    model.Maximize(sum(objective_terms))

    # 4. 해결
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        result_plan = []
        for course in courses:
            if solver.Value(selected[course['id']]) == 1:
                result_plan.append(course)
        return result_plan 
    else:
        return []