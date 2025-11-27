import { useState } from 'react';
import { Search, Heart, AlertCircle, Users } from 'lucide-react';
import { mockCourses } from '../data/mockData';

type CourseListProps = {
  interestedCourses: string[];
  onToggleInterest: (courseId: string) => void;
};

export function CourseList({ interestedCourses, onToggleInterest }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('전체');
  const [sortBy, setSortBy] = useState<'name' | 'credits' | 'enrollment'>('name');

  const courseTypes = ['전체', '전공 필수', '전공 선택', '교양'];

  const filteredCourses = mockCourses
    .filter(course => {
      const matchesSearch = 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.professor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourseType = 
        selectedCourseType === '전체' || course.courseType === selectedCourseType;
      
      return matchesSearch && matchesCourseType;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'credits') return b.credits - a.credits;
      if (sortBy === 'enrollment') return (b.enrolled / b.capacity) - (a.enrolled / a.capacity);
      return 0;
    });

  const getEnrollmentStatus = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity;
    if (ratio >= 1) return { text: '정원 초과', color: 'text-red-600', bg: 'bg-red-50' };
    if (ratio >= 0.9) return { text: '마감 임박', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (ratio >= 0.7) return { text: '여유', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: '여유', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">수업 목록</h2>
        <p className="text-gray-600">수강 희망 과목을 등록하고 정원 현황을 확인하세요</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="과목명, 과목코드, 교수명으로 검색..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Course Type Filter */}
        <div className="flex flex-wrap gap-2">
          {courseTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedCourseType(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCourseType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">과목명</option>
            <option value="credits">학점순</option>
            <option value="enrollment">수강신청률</option>
          </select>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {filteredCourses.map(course => {
          const status = getEnrollmentStatus(course.enrolled, course.capacity);
          const isInterested = interestedCourses.includes(course.id);
          
          return (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-gray-900">{course.name}</h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {course.code}
                    </span>
                    <span className={`px-2 py-1 ${
                      course.courseType === '전공 필수' ? 'bg-purple-100 text-purple-700' :
                      course.courseType === '전공 선택' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    } rounded text-xs`}>
                      {course.courseType}
                    </span>
                    <span className={`px-2 py-1 ${status.bg} ${status.color} rounded text-xs flex items-center space-x-1`}>
                      {status.text === '정원 초과' && <AlertCircle className="w-3 h-3" />}
                      <span>{status.text}</span>
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
                      <span className="text-gray-500">학과:</span> {course.department}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {course.enrolled} / {course.capacity}명
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          course.enrolled >= course.capacity
                            ? 'bg-red-500'
                            : course.enrolled / course.capacity >= 0.9
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((course.enrolled / course.capacity) * 100, 100)}%` }}
                      />
                    </div>
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

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}