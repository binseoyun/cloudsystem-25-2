import { useState } from 'react';
import { Sparkles, Briefcase, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import { User, Course } from '../App';

type AIRecommendationProps = {
  user: User;
  onToggleInterest: (courseId: string) => void;
  interestedCourses: string[];
};

type JobField = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const jobFields: JobField[] = [
  {
    id: 'backend',
    name: '백엔드 개발',
    description: '서버 개발, 데이터베이스 설계, API 개발',
    icon: '💻',
  },
  {
    id: 'data',
    name: '데이터 분석',
    description: '데이터 수집, 분석, 시각화, 머신러닝',
    icon: '📊',
  },
  {
    id: 'product',
    name: '프로덕트 매니저',
    description: '제품 기획, 프로젝트 관리, UX 설계',
    icon: '🎯',
  },
];

//백엔드 API를 8000로 호출(연결이 안되서 ai-server와 연결)

const API_BASE_URL='http://localhost:5000/api/ai'

export function AIRecommendation({ user, onToggleInterest, interestedCourses }: AIRecommendationProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // ★ 가짜 데이터 대신, 서버에서 받아온 진짜 추천 목록을 저장할 State
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFieldSelect = async (fieldId: string) => {
    setIsAnalyzing(true);
    setSelectedField(null); // 분석 중에는 선택 해제 느낌 주기
    setError(null);
    setRecommendedCourses([]); // 기존 결과 초기화

    // 선택한 직무의 한글 이름 찾기 (예: 'backend' -> '백엔드 개발')
    const selectedJob = jobFields.find(f => f.id === fieldId);

    if (!selectedJob) return;

    try {
      // 1. 백엔드(Node.js)에게 추천 요청 보내기
      // Node.js는 이걸 받아서 Python AI 서버에게 물어보고 결과를 줄 것입니다.
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobInterest: selectedJob.name, // "백엔드 개발"
          major: user.department         // "컴퓨터공학과" (유저 전공 정보 활용)
        }),
      });

      if (!response.ok) {
        throw new Error('AI 서버와 통신에 실패했습니다.');
      }

      // 2. 받아온 추천 과목 리스트 저장
      const data: Course[] = await response.json();
      setRecommendedCourses(data);
      setSelectedField(fieldId); // 선택 상태 확정

    } catch (err) {
      console.error(err);
      setError('AI 추천을 불러오지 못했습니다. 백엔드 및 AI 서버(Python)가 켜져 있는지 확인해주세요.');
      setSelectedField(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedFieldData = jobFields.find(f => f.id === selectedField);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">AI 수업 추천</h2>
        <p className="text-gray-600">희망하는 직무를 선택하면 AI가 적합한 과목을 추천해드립니다</p>
      </div>

      {/* User Info */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h3>AI 맞춤 추천</h3>
        </div>
        <p className="text-purple-100">
          {user.name}님의 전공({user.department})과 희망 직무를 고려하여 최적의 과목을 추천합니다.
        </p>
      </div>

      {/* Job Field Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 mb-4">희망 직무 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobFields.map(field => (
            <button
              key={field.id}
              onClick={() => handleFieldSelect(field.id)}
              disabled={isAnalyzing}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedField === field.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{field.icon}</span>
                <h4 className="text-gray-900">{field.name}</h4>
              </div>
              <p className="text-gray-600">{field.description}</p>
            </button>
          ))}
        </div>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-gray-900 mb-2">AI 분석 중...</h3>
          <p className="text-gray-600">학생님의 성향과 커리큘럼을 분석하고 있습니다</p>
        </div>
      )}

      {/* Recommended Courses */}
      {selectedField && !isAnalyzing && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-gray-900">
                {selectedFieldData?.name} 추천 과목
              </h3>
              <p className="text-gray-600">{selectedFieldData?.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendedCourses.map((course, index) => {
              const isInterested = interestedCourses.includes(course.id);
              // AI 추천 순위대로 점수 부여 (단순 시각적 효과)
              const matchScore = Math.max(70, 98 - (index * 3)); 

              return (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold text-sm">
                          AI 추천도 {matchScore}%
                        </span>
                        <h4 className="text-gray-900 font-bold">{course.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {course.code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-600 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">교수:</span> {course.professor}
                        </div>
                        <div>
                          <span className="text-gray-500">학점:</span> {course.credits}학점
                        </div>
                        <div>
                          <span className="text-gray-500">시간:</span> {course.day.join(', ')} {course.time}
                        </div>
                        <div>
                          <span className="text-gray-500">정원:</span> {course.enrolled}/{course.capacity}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-purple-600 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {index === 0 && '가장 강력하게 추천하는 과목입니다!'}
                          {index === 1 && '직무 역량 강화에 필수적입니다.'}
                          {index >= 2 && '함께 수강하면 시너지가 나는 과목입니다.'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleInterest(course.id)}
                      className={`ml-4 p-3 rounded-lg transition-colors ${
                        isInterested
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isInterested ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {recommendedCourses.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                조건에 맞는 추천 과목을 찾지 못했습니다.<br/>
                DB에 과목 데이터가 충분한지 확인해주세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {!selectedField && !isAnalyzing && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
          <h4 className="text-blue-800 mb-2 font-bold">💡 실시간 AI 추천 받는 방법</h4>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• 위에서 관심있는 직무 분야를 선택해주세요.</li>
            <li>• OpenAI(ChatGPT)가 학생님의 전공과 직무를 분석합니다.</li>
            <li>• 학교 데이터베이스에 있는 실제 강의 중 최적의 과목을 찾아냅니다.</li>
          </ul>
        </div>
      )}
    </div>
  );
}