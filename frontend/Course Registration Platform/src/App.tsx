import { useEffect, useState } from 'react';
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

  // 🔹 처음 앱 켰을 때 한 번만 실행: 토큰 있으면 로그인 상태로 간주
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setCurrentPage('home');
      // TODO: 나중에 /api/auth/me 로 유저 정보 불러오면 setUser도 같이
    }
  }, []);

  // 🔹 로그인 시: 유저 정보 저장 + 이 학생의 저장된 시간표/관심 과목 로드
  const handleLogin = (userData: User) => {
    setUser(userData);

    // 1) 저장된 시간표 불러오기
    const savedTimetablesRaw = localStorage.getItem(
      `timetables_${userData.studentId}`
    );
    if (savedTimetablesRaw) {
      try {
        const parsed = JSON.parse(savedTimetablesRaw) as Timetable[];
        // createdAt이 문자열로 저장되어 있을 수 있으니 Date로 한 번 감싸줌
        const restored = parsed.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        }));
        setSavedTimetables(restored);
      } catch (e) {
        console.error('저장된 시간표 파싱 오류:', e);
        setSavedTimetables([]);
      }
    } else {
      setSavedTimetables([]);
    }

    // 2) 저장된 관심 과목 불러오기
    const savedInterestedRaw = localStorage.getItem(
      `interested_${userData.studentId}`
    );
    if (savedInterestedRaw) {
      try {
        const parsed = JSON.parse(savedInterestedRaw) as string[];
        setInterestedCourses(parsed);
      } catch (e) {
        console.error('저장된 관심 과목 파싱 오류:', e);
        setInterestedCourses([]);
      }
    } else {
      setInterestedCourses([]);
    }

    setCurrentPage('home');
  };

  // 🔹 로그아웃: 백엔드에 알리고, 토큰/상태만 정리 (시간표는 localStorage에 남김)
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // 1) 토큰 제거
      localStorage.removeItem('token');

      // 2) 상태 초기화
      setUser(null);
      setCurrentPage('login');
      setSavedTimetables([]);
      setInterestedCourses([]);
    }
  };

  // 🔹 시간표 저장(메모리 상태)
  const handleSaveTimetable = (timetable: Timetable) => {
    setSavedTimetables((prev) => [...prev, timetable]);
  };

  // 🔹 관심 과목 토글
  const handleToggleInterest = (courseId: string) => {
    setInterestedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // 🔹 savedTimetables 변경될 때마다 localStorage에도 반영 (로그인된 상태일 때만)
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(
      `timetables_${user.studentId}`,
      JSON.stringify(savedTimetables)
    );
  }, [savedTimetables, user]);

  // 🔹 관심 과목도 localStorage에 저장
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(
      `interested_${user.studentId}`,
      JSON.stringify(interestedCourses)
    );
  }, [interestedCourses, user]);

  // 로그인 페이지
  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 나머지 페이지
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
                    currentPage === 'home'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  홈
                </button>
                <button
                  onClick={() => setCurrentPage('timetable')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'timetable'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  시간표 생성
                </button>
                <button
                  onClick={() => setCurrentPage('courses')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'courses'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  수업 목록
                </button>
                <button
                  onClick={() => setCurrentPage('ai')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'ai'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  AI 수업 추천
                </button>
                <button
                  onClick={() => setCurrentPage('mypage')}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 'mypage'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
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
