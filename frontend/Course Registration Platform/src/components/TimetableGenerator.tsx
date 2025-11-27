import { useState } from 'react';
import { Timetable, Course } from '../App';
import { TimetableView } from './TimetableView';
import { Loader2, Save, RefreshCw, Plus, X, Search } from 'lucide-react';
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

export function TimetableGenerator({ onSave, interestedCourses }: TimetableGeneratorProps) {
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

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourseType = 
      selectedCourseType === '전체' || course.courseType === selectedCourseType;
    
    return matchesSearch && matchesCourseType;
  });

  const handleToggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const selectedCourseDetails = mockCourses.filter(c => selectedCourses.includes(c.id));
  const totalSelectedCredits = selectedCourseDetails.reduce((sum, c) => sum + c.credits, 0);

  const generateTimetables = () => {
    if (selectedCourses.length === 0) {
      alert('최소 1개 이상의 과목을 선택해주세요!');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const planA = createOptimizedTimetable('PLAN A', 0);
      const planB = createOptimizedTimetable('PLAN B', 1);
      const planC = createOptimizedTimetable('PLAN C', 2);
      
      setGeneratedTimetables([planA, planB, planC]);
      setIsGenerating(false);
    }, 1500);
  };

  const createOptimizedTimetable = (name: string, seed: number): Timetable => {
    // Start with selected courses as base
    const baseCourses = mockCourses.filter(c => selectedCourses.includes(c.id));
    
    // Check for conflicts in selected courses
    const validBaseCourses: Course[] = [];
    for (const course of baseCourses) {
      const hasConflict = validBaseCourses.some(s => 
        s.day.some(d => course.day.includes(d)) && s.time === course.time
      );
      
      if (!hasConflict) {
        validBaseCourses.push(course);
      }
    }
    
    let currentCredits = validBaseCourses.reduce((sum, c) => sum + c.credits, 0);
    
    // Get additional courses to fill the timetable
    let availableAdditionalCourses = mockCourses.filter(c => 
      !selectedCourses.includes(c.id)
    );
    
    // Filter by time preferences
    if (conditions.avoidMorning) {
      availableAdditionalCourses = availableAdditionalCourses.filter(c => 
        !c.time.startsWith('09') && !c.time.startsWith('10')
      );
    }
    
    if (conditions.avoidEvening) {
      availableAdditionalCourses = availableAdditionalCourses.filter(c => 
        !c.time.startsWith('18') && !c.time.startsWith('19')
      );
    }

    // Filter by preferred days if any
    if (conditions.preferredDays.length > 0) {
      availableAdditionalCourses = availableAdditionalCourses.filter(c =>
        c.day.some(d => conditions.preferredDays.includes(d))
      );
    }
    
    // Shuffle for variation between plans
    const shuffled = [...availableAdditionalCourses].sort(() => 
      Math.random() - 0.5 + (seed * 0.1)
    );
    
    // Add courses ensuring no conflicts
    const finalCourses = [...validBaseCourses];
    
    for (const course of shuffled) {
      if (currentCredits >= conditions.maxCredits) break;
      
      const hasConflict = finalCourses.some(s => 
        s.day.some(d => course.day.includes(d)) && s.time === course.time
      );
      
      if (!hasConflict && currentCredits + course.credits <= conditions.maxCredits) {
        finalCourses.push(course);
        currentCredits += course.credits;
        
        if (currentCredits >= conditions.minCredits) {
          // Try to reach maxCredits but don't force it
          if (Math.random() > 0.3) continue;
        }
      }
    }
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      courses: finalCourses,
      createdAt: new Date(),
    };
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

  const totalCredits = generatedTimetables[selectedPlan === 'A' ? 0 : selectedPlan === 'B' ? 1 : 2]
    ?.courses.reduce((sum, c) => sum + c.credits, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">시간표 생성</h2>
        <p className="text-gray-600">듣고 싶은 수업을 선택하고 조건을 입력하면 3가지 시간표를 자동으로 생성해드립니다</p>
      </div>

      {/* Course Selection Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 mb-4">1. 듣고 싶은 수업 선택</h3>
        
        {/* Selected Courses Summary */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-900">선택된 과목: {selectedCourses.length}개</span>
            <span className="text-blue-900">총 {totalSelectedCredits}학점</span>
          </div>
          {selectedCourseDetails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCourseDetails.map(course => (
                <div
                  key={course.id}
                  className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full text-sm"
                >
                  <span className="text-gray-700">{course.name} ({course.credits}학점)</span>
                  <button
                    onClick={() => handleToggleCourse(course.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Filter */}
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
                className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                  selectedCourseType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Course List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredCourses.map(course => {
            const isSelected = selectedCourses.includes(course.id);
            return (
              <div
                key={course.id}
                className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleToggleCourse(course.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-gray-900">{course.name}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {course.code}
                        </span>
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

      {/* Conditions Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 mb-4">2. 시간표 조건 설정</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credits Range */}
          <div>
            <label className="block text-gray-700 mb-2">학점 범위</label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={conditions.minCredits}
                  onChange={(e) => setConditions({ ...conditions, minCredits: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="21"
                />
                <span className="text-gray-600">최소 학점</span>
              </div>
              <span className="text-gray-400">~</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={conditions.maxCredits}
                  onChange={(e) => setConditions({ ...conditions, maxCredits: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="21"
                />
                <span className="text-gray-600">최대 학점</span>
              </div>
            </div>
          </div>

          {/* Preferred Days */}
          <div>
            <label className="block text-gray-700 mb-2">선호 요일 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => {
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

          {/* Time Preferences */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">시간 선호도</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conditions.avoidMorning}
                  onChange={(e) => setConditions({ ...conditions, avoidMorning: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">오전 수업 피하기 (9시~11시)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conditions.avoidEvening}
                  onChange={(e) => setConditions({ ...conditions, avoidEvening: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">저녁 수업 피하기 (18시 이후)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conditions.preferLongBreak}
                  onChange={(e) => setConditions({ ...conditions, preferLongBreak: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">긴 공강 선호 (점심시간 확보)</span>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={generateTimetables}
          disabled={isGenerating || selectedCourses.length === 0}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>시간표 생성 중...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>시간표 생성하기</span>
            </>
          )}
        </button>
        
        {selectedCourses.length === 0 && (
          <p className="mt-2 text-center text-red-600 text-sm">
            최소 1개 이상의 과목을 선택해주세요
          </p>
        )}
      </div>

      {/* Generated Timetables */}
      {generatedTimetables.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">생성된 시간표</h3>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">총 {totalCredits}학점</span>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>저장하기</span>
              </button>
            </div>
          </div>

          {/* Plan Selector */}
          <div className="flex space-x-2 mb-6">
            {(['A', 'B', 'C'] as const).map(plan => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedPlan === plan
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                PLAN {plan}
              </button>
            ))}
          </div>

          {/* Timetable Display */}
          <TimetableView 
            timetable={generatedTimetables[selectedPlan === 'A' ? 0 : selectedPlan === 'B' ? 1 : 2]}
          />
        </div>
      )}
    </div>
  );
}