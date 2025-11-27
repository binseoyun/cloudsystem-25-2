import { useState } from 'react';
import { User } from '../App';
import { LogIn, UserPlus } from 'lucide-react';

type LoginPageProps = {
  onLogin: (user: User) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
    name: '',
    department: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login/signup
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: `${formData.studentId}@university.ac.kr`,
      name: formData.name || '학생',
      studentId: formData.studentId,
      department: formData.department || '컴퓨터공학과',
    };
    
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-blue-600 mb-2">수강신청 도우미</h1>
          <p className="text-gray-600">개인화된 시간표 관리 서비스</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              !isSignup
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LogIn className="inline-block w-4 h-4 mr-2" />
            로그인
          </button>
          <button
            onClick={() => setIsSignup(true)}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isSignup
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserPlus className="inline-block w-4 h-4 mr-2" />
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">학과</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="컴퓨터공학과"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-700 mb-2">학번</label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="20240001"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        {!isSignup && (
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:underline">
              비밀번호를 잊으셨나요?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}