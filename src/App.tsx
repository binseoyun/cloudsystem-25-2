import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { TimetableGenerator } from './components/TimetableGenerator';
import { CourseList } from './components/CourseList';
import { AIRecommendation } from './components/AIRecommendation';
import { MyPage } from './components/MyPage';

export type Course = {
  id: string;
  code: string;
  name: string;
  professor: string;
  credits: number;
  time: string;
  day: string[];
  capacity: number;
  enrolled: number;
  department: string;
  courseType: '전공 필수' | '전공 선택' | '교양';
};

export type Timetable = {
  id: string;
  name: string;
  courses: Course[];
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  studentId: string;
  department: string;
};

export type Page = 'login' | 'home' | 'timetable' | 'courses' | 'ai' | 'mypage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [savedTimetables, setSavedTimetables] = useState<Timetable[]>([]);
  const [interestedCourses, setInterestedCourses] = useState<string[]>([]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setSavedTimetables([]);
    setInterestedCourses([]);
  };

  const handleSaveTimetable = (timetable: Timetable) => {
    setSavedTimetables([...savedTimetables, timetable]);
  };

  const handleToggleInterest = (courseId: string) => {
    if (interestedCourses.includes(courseId)) {
      setInterestedCourses(interestedCourses.filter(id => id !== courseId));
    } else {
      setInterestedCourses([...interestedCourses, courseId]);
    }
  };

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 
                className="text-blue-600 cursor-pointer"
                onClick={() => setCurrentPage('home')}
              >
                수강신청 도우미
              </h1>
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  홈
                </button>
                <button
                  onClick={() => setCurrentPage('timetable')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'timetable' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  시간표 생성
                </button>
                <button
                  onClick={() => setCurrentPage('courses')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  수업 목록
                </button>
                <button
                  onClick={() => setCurrentPage('ai')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'ai' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  AI 수업 추천
                </button>
                <button
                  onClick={() => setCurrentPage('mypage')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'mypage' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  마이페이지
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}님</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage onNavigate={setCurrentPage} user={user!} />
        )}
        {currentPage === 'timetable' && (
          <TimetableGenerator 
            onSave={handleSaveTimetable}
            interestedCourses={interestedCourses}
          />
        )}
        {currentPage === 'courses' && (
          <CourseList 
            interestedCourses={interestedCourses}
            onToggleInterest={handleToggleInterest}
          />
        )}
        {currentPage === 'ai' && (
          <AIRecommendation 
            user={user!}
            onToggleInterest={handleToggleInterest}
            interestedCourses={interestedCourses}
          />
        )}
        {currentPage === 'mypage' && (
          <MyPage 
            user={user!}
            savedTimetables={savedTimetables}
            interestedCourses={interestedCourses}
          />
        )}
      </main>
    </div>
  );
}