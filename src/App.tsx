import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { TimetableGenerator } from './components/TimetableGenerator';
import { CourseList } from './components/CourseList';
import { AIRecommendation } from './components/AIRecommendation';
import { MyPage } from './components/MyPage';

export type ClassSchedule = {
  class_id: string;
  weekday: number;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  location: string | null;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  professor: string;
  credits: number;
  capacity: number;
  enrolled: number;
  department: string;
  courseType: '전공필수' | '전공선택' | '교양';
  day: string[];
  time: string;
  schedules: ClassSchedule[];
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTimetables, setSavedTimetables] = useState<Timetable[]>([]);
  const [interestedCourses, setInterestedCourses] = useState<string[]>([]);

  const normalizeCourses = (data: any[]): Course[] => {
    const weekdayMap = ['일', '월', '화', '수', '목', '금', '토'];

    return data.map((course) => {
      const rawId = course.id ?? course.code ?? '';
      const normalizedSchedules: ClassSchedule[] = Array.isArray(course.schedules)
        ? course.schedules.map((schedule: any) => ({
            class_id: String(schedule.class_id ?? rawId),
            weekday: schedule.weekday ?? 0,
            start_time: schedule.start_time ?? '',
            end_time: schedule.end_time ?? null,
            duration_minutes: schedule.duration_minutes ?? null,
            location: schedule.location ?? null,
          }))
        : [];

      const day = Array.from(
        new Set(
          normalizedSchedules
            .map((schedule) => weekdayMap[schedule.weekday])
            .filter(Boolean)
        )
      );

      const time =
        normalizedSchedules.length > 0
          ? normalizedSchedules
              .map((schedule) => {
                const start = schedule.start_time?.slice(0, 5) ?? '';
                const end = schedule.end_time?.slice(0, 5) ?? '';
                return end ? `${start}~${end}` : start;
              })
              .join(', ')
          : '시간 정보 없음';

      const normalizedCourseType = (course.courseType ?? '').replace(/\s+/g, '');
      const courseType: Course['courseType'] =
        normalizedCourseType === '전공필수'
          ? '전공필수'
          : normalizedCourseType === '전공선택'
          ? '전공선택'
          : '교양';

      return {
        ...course,
        id: String(rawId),
        code: course.code ?? String(rawId),
        courseType,
        day,
        time,
        schedules: normalizedSchedules,
      };
    });
  };

  // API에서 수업 데이터 로드
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/courses');
        if (!response.ok) {
          throw new Error('수업 데이터를 불러올 수 없습니다');
        }
        const data = await response.json();
        setCourses(normalizeCourses(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        console.error('수업 데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">데이터를 불러오는 중입니다...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">오류: {error}</p>
          </div>
        )}
        {currentPage === 'home' && !loading && (
          <HomePage onNavigate={setCurrentPage} user={user!} />
        )}
        {currentPage === 'timetable' && !loading && (
          <TimetableGenerator 
            courses={courses}
            onSave={handleSaveTimetable}
            interestedCourses={interestedCourses}
          />
        )}
        {currentPage === 'courses' && !loading && (
          <CourseList 
            courses={courses}
            interestedCourses={interestedCourses}
            onToggleInterest={handleToggleInterest}
          />
        )}
        {currentPage === 'ai' && !loading && (
          <AIRecommendation 
            courses={courses}
            user={user!}
            onToggleInterest={handleToggleInterest}
            interestedCourses={interestedCourses}
          />
        )}
        {currentPage === 'mypage' && !loading && (
          <MyPage 
            user={user!}
            courses={courses}
            savedTimetables={savedTimetables}
            interestedCourses={interestedCourses}
          />
        )}
      </main>
    </div>
  );
}