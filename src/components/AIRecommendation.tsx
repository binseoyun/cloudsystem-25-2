import { useState } from 'react';
import { Sparkles, Briefcase, Heart, TrendingUp } from 'lucide-react';
import { User, Course } from '../App';
import { mockCourses } from '../data/mockData';

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
    id: 'public',
    name: '공공행정',
    description: '정책 분석, 행정 관리, 공공서비스',
    icon: '🏛️',
  },
  {
    id: 'marketing',
    name: '마케팅',
    description: '디지털 마케팅, 브랜드 전략, 소비자 분석',
    icon: '📈',
  },
  {
    id: 'finance',
    name: '금융',
    description: '재무 분석, 투자 관리, 리스크 관리',
    icon: '💰',
  },
  {
    id: 'product',
    name: '프로덕트 매니저',
    description: '제품 기획, 프로젝트 관리, UX 설계',
    icon: '🎯',
  },
];

const courseRecommendations: Record<string, string[]> = {
  backend: ['CS301', 'CS302', 'CS303', 'CS304'],
  data: ['CS303', 'STAT301', 'STAT302', 'CS305'],
  public: ['ECON301', 'PSY301', 'MGT301', 'ECON302'],
  marketing: ['MGT302', 'PSY301', 'STAT301', 'MGT303'],
  finance: ['ECON301', 'ECON302', 'STAT301', 'MGT301'],
  product: ['CS301', 'MGT302', 'PSY301', 'MGT303'],
};

export function AIRecommendation({ user, onToggleInterest, interestedCourses }: AIRecommendationProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFieldSelect = (fieldId: string) => {
    setIsAnalyzing(true);
    setSelectedField(null);
    
    // Simulate AI analysis
    setTimeout(() => {
      setSelectedField(fieldId);
      setIsAnalyzing(false);
    }, 1000);
  };

  const getRecommendedCourses = (): Course[] => {
    if (!selectedField) return [];
    
    const recommendedCodes = courseRecommendations[selectedField] || [];
    return mockCourses.filter(course => recommendedCodes.includes(course.code));
  };

  const recommendedCourses = getRecommendedCourses();
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
      </div>

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-gray-900 mb-2">AI 분석 중...</h3>
          <p className="text-gray-600">최적의 과목을 찾고 있습니다</p>
        </div>
      )}

      {/* Recommended Courses */}
      {selectedField && !isAnalyzing && (
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
              const matchScore = 95 - (index * 5);

              return (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          추천도 {matchScore}%
                        </span>
                        <h4 className="text-gray-900">{course.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {course.code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-600 mb-3">
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

                      <div className="flex items-center space-x-2 text-purple-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {index === 0 && '필수 추천 과목입니다'}
                          {index === 1 && '기초를 다지기 좋은 과목입니다'}
                          {index === 2 && '실무 역량 향상에 도움이 됩니다'}
                          {index >= 3 && '심화 학습에 추천합니다'}
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
            <p className="text-center text-gray-500 py-8">
              추천할 수 있는 과목이 없습니다.
            </p>
          )}
        </div>
      )}

      {/* Tips */}
      {!selectedField && !isAnalyzing && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
          <h4 className="text-blue-800 mb-2">💡 추천 받는 방법</h4>
          <ul className="text-blue-700 space-y-1">
            <li>• 위에서 관심있는 직무 분야를 선택해주세요</li>
            <li>• AI가 해당 직무에 필요한 역량을 분석합니다</li>
            <li>• 추천받은 과목을 시간표 생성에 활용해보세요</li>
          </ul>
        </div>
      )}
    </div>
  );
}
