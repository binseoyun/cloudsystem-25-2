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
    major: '', //department를 전공인 major로 변경
  });

  //비동기 통신을 위해 async 추가
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
   //1. 요청 보낼 주소
   const url= isSignup
   ? 'http://127.0.0.1:3000/api/auth/signup' // 회원가입 주소
   : 'http://127.0.0.1:3000/api/auth/login'; // 로그인 주소

   //2. 백엔드로 보낼 데이터 준비
   const requestBody = isSignup
   ? {
    studentId: formData.studentId,
    password: formData.password,
    name: formData.name,
    major: formData.major,
   }
   :{
    studentId: formData.studentId,
    password: formData.password, 
   };
   try{
    //3. fetch 로 요청 보내기
    const response = await fetch(url,{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data=await response.json();

    //4. 에러 처리
    if(!response.ok){
      alert(data.message || '요청 처리에 실패했습니다.');
      return;
    }
    //5. 성공 처리
    if(isSignup){
      ///회원가입 성공 시=> 로그인 화면으로 전환
      alert('회원가입이 완료되었습니다! 로그인해주세요');
      setIsSignup(false);
    }else{
      //로그인 성공 시
      //백엔드가 준 토큰 저장
      localStorage.setItem('token',data.token);
      //메인 화면으로 이동
      onLogin(data.user);
    }

    
   }
   catch(error){
    console.error("연결 에러",error);
    alert('서버와 연결할 수 없습니다. ');
   }
  };




  //jsx 화면 코드
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
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
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