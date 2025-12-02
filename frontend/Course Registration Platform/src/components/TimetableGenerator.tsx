import { useState } from 'react';
import { Timetable, Course } from '../App';
import { TimetableView } from './TimetableView';
import { Loader2, Save, RefreshCw, X, Search } from 'lucide-react';
import { mockCourses } from '../data/mockData';

type TimetableGeneratorProps = {
  onSave: (timetable: Timetable) => void;
  interestedCourses: string[];
};

type TimetableConditions = {
  minCredits: number;
  maxCredits: number;
  preferredDays: string[];
  avoidMorning: boolean;
  avoidEvening: boolean;
  preferLongBreak: boolean;
};

// --- [계산 함수] 시간 충돌 및 시간 변환 로직 (컴포넌트 밖) ---
const parseTime = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
};

const checkConflict = (courseA: Course, courseB: Course) => {
  // 1. 요일이 하나라도 겹치는지 확인
  const sameDays = courseA.day.filter(day => courseB.day.includes(day));
  if (sameDays.length === 0) return false; // 요일이 다르면 충돌 없음

  // 2. 시간 계산
  const startA = parseTime(courseA.time);
  const durationA = courseA.day.length >= 2 ? 1.5 : courseA.credits; // 주2회면 1.5시간, 아니면 학점만큼
  const endA = startA + durationA;

  const startB = parseTime(courseB.time);
  const durationB = courseB.day.length >= 2 ? 1.5 : courseB.credits;
  const endB = startB + durationB;

  // 3. 교차 검증 공식: (A시작 < B끝) AND (A끝 > B시작)
  return (startA < endB) && (endA > startB);
};
// -----------------------------------------------------------

export function TimetableGenerator({ onSave }: TimetableGeneratorProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('전체');
  
  const [conditions, setConditions] = useState<TimetableConditions>({
    minCredits: 12,
    maxCredits: 18,
    preferredDays: [],
    avoidMorning: false,
    avoidEvening: false,
    preferLongBreak: false,
  });
  
  const [generatedTimetables, setGeneratedTimetables] = useState<Timetable[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'A' | 'B' | 'C'>('A');

  const days = ['월', '화', '수', '목', '금'];
  const courseTypes = ['전체', '전공 필수', '전공 선택', '교양'];

  // 현재 선택된 과목들의 상세 정보 객체들
  const selectedCourseDetails = mockCourses.filter(c => selectedCourses.includes(c.id));
  
  // 현재 선택된 총 학점 계산
  const totalSelectedCredits = selectedCourseDetails.reduce((sum, c) => sum + c.credits, 0);

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourseType = 
      selectedCourseType === '전체' || course.courseType === selectedCourseType;
    
    return matchesSearch && matchesCourseType;
  });

  // --- [핵심 로직] 과목 선택 시 유효성 검사 ---
  const handleToggleCourse = (courseId: string) => {
    // 1. 이미 선택된 과목이면 -> 해제 (제한 없음)
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
      return;
    }

    // 선택하려는 과목 정보 가져오기
    const targetCourse = mockCourses.find(c => c.id === courseId);
    if (!targetCourse) return;

    // 2. [검사] 7개 제한
    if (selectedCourses.length >= 7) {
      alert("최대 7개까지만 선택할 수 있습니다.");
      return;
    }

    // 3. [검사] 21학점 제한
    if (totalSelectedCredits + targetCourse.credits > 21) {
      alert(`최대 21학점까지만 신청할 수 있습니다.\n(현재: ${totalSelectedCredits}학점 + 추가: ${targetCourse.credits}학점)`);
      return;
    }

    // 4. [검사] 시간 충돌 여부
    let isConflict = false;
    let conflictName = "";

    selectedCourses.forEach((id) => {
      const existingCourse = mockCourses.find(c => c.id === id);
      if (existingCourse && checkConflict(targetCourse, existingCourse)) {
        isConflict = true;
        conflictName = existingCourse.name;
      }
    });

    if (isConflict) {
      alert(`'${conflictName}' 수업과 시간이 겹쳐서 선택할 수 없습니다!`);
      return;
    }

    // 모든 검사 통과 -> 선택 목록에 추가
    setSelectedCourses([...selectedCourses, courseId]);
  };

  // --- 백엔드 API 호출 ---
  const generateTimetables = async () => {
    if (selectedCourses.length === 0) {
      alert('최소 1개 이상의 과목을 선택해주세요!');
      return;
    }

    setIsGenerating(true);

    try {
      // Python 백엔드(5000번 포트)로 요청
      const response = await fetch('http://localhost:5000/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_course_ids: selectedCourses,
          preferences: conditions
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        const planA: Timetable = { id: 'plan-a', name: 'PLAN A', courses: result.data['PLAN A'], createdAt: new Date() };
        const planB: Timetable = { id: 'plan-b', name: 'PLAN B', courses: result.data['PLAN B'], createdAt: new Date() };
        const planC: Timetable = { id: 'plan-c', name: 'PLAN C', courses: result.data['PLAN C'], createdAt: new Date() };

        setGeneratedTimetables([planA, planB, planC]);
      } else {
        alert(`생성 실패: ${result.message}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert('서버와 연결할 수 없습니다. 백엔드(main.py)가 실행 중인지 확인해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const timetableToSave = generatedTimetables[selectedPlan === 'A' ? 0 : selectedPlan === 'B' ? 1 : 2];
    if (timetableToSave) {
      onSave({
        ...timetableToSave,
        name: `${timetableToSave.name} - ${new Date().toLocaleDateString('ko-KR')}`,
      });
      alert('시간표가 저장되었습니다!');
    }
  };

  const currentTimetable = generatedTimetables[selectedPlan === 'A' ? 0 : selectedPlan === 'B' ? 1 : 2];
  const totalCredits = currentTimetable?.courses.reduce((sum, c) => sum + c.credits, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">시간표 생성</h2>
        <p className="text-gray-600">듣고 싶은 수업을 선택하고 조건을 입력하면 AI가 3가지 시간표를 자동으로 생성해드립니다</p>
      </div>

      {/* 1. 과목 선택 영역 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 mb-4">1. 듣고 싶은 수업 선택</h3>
        
        {/* 선택된 과목 요약 (배지 영역) */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-900 font-medium">선택된 과목: {selectedCourses.length}개</span>
            <span className={`font-medium ${totalSelectedCredits > 21 ? 'text-red-600' : 'text-blue-900'}`}>
              총 {totalSelectedCredits}학점 / 최대 21학점
            </span>
          </div>
          {selectedCourseDetails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCourseDetails.map(course => (
                <div key={course.id} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full text-sm shadow-sm">
                  <span className="text-gray-700">{course.name} ({course.credits}학점)</span>
                  <button onClick={() => handleToggleCourse(course.id)} className="text-red-600 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="과목명, 과목코드, 교수명으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {courseTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedCourseType(type)}
                className={`px-3 py-1 rounded-lg transition-colors text-sm ${selectedCourseType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 과목 리스트 (스크롤 영역) */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredCourses.map(course => {
            const isSelected = selectedCourses.includes(course.id);
            return (
              <div
                key={course.id}
                className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => handleToggleCourse(course.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input type="checkbox" checked={isSelected} readOnly className="mt-1 w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-gray-900 font-medium">{course.name}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{course.code}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-x-4">
                        <span>{course.professor}</span>
                        <span>{course.credits}학점</span>
                        <span>{course.day.join(', ')} {course.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 조건 설정 영역 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 mb-4">2. 시간표 조건 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">학점 범위</label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input type="number" value={conditions.minCredits} onChange={(e) => setConditions({ ...conditions, minCredits: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" max="21" />
                <span className="text-gray-600">최소 학점</span>
              </div>
              <span className="text-gray-400">~</span>
              <div className="flex-1">
                <input type="number" value={conditions.maxCredits} onChange={(e) => setConditions({ ...conditions, maxCredits: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" max="21" />
                <span className="text-gray-600">최대 학점</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">원하는 공강 요일</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => {
                    // 클릭 시 해당 요일을 조건에 추가/제거
                    if (conditions.preferredDays.includes(day)) {
                      setConditions({
                        ...conditions,
                        preferredDays: conditions.preferredDays.filter(d => d !== day)
                      });
                    } else {
                      setConditions({
                        ...conditions,
                        preferredDays: [...conditions.preferredDays, day]
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    conditions.preferredDays.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">시간 선호도</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={conditions.avoidMorning} onChange={(e) => setConditions({ ...conditions, avoidMorning: e.target.checked })} className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">오전 수업 피하기 (9시~11시)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={conditions.avoidEvening} onChange={(e) => setConditions({ ...conditions, avoidEvening: e.target.checked })} className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">저녁 수업 피하기 (18시 이후)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={conditions.preferLongBreak} onChange={(e) => setConditions({ ...conditions, preferLongBreak: e.target.checked })} className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">짧은 공강 선호</span>
              </label>
            </div>
          </div>
        </div>
        <button onClick={generateTimetables} disabled={isGenerating || selectedCourses.length === 0} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
          {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>AI가 시간표를 계산중입니다...</span></>) : (<><RefreshCw className="w-5 h-5" /><span>AI 시간표 생성하기</span></>)}
        </button>
      </div>

      {/* 3. 생성 결과 표시 */}
      {generatedTimetables.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">생성된 시간표</h3>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">총 {totalCredits}학점</span>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Save className="w-4 h-4" /><span>저장하기</span>
              </button>
            </div>
          </div>
          <div className="flex space-x-2 mb-6">
            {(['A', 'B', 'C'] as const).map(plan => (
              <button key={plan} onClick={() => setSelectedPlan(plan)} className={`px-6 py-2 rounded-lg transition-colors ${selectedPlan === plan ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>PLAN {plan}</button>
            ))}
          </div>
          <TimetableView timetable={currentTimetable} />
        </div>
      )}
    </div>
  );
}