import { Timetable } from '../App';

type TimetableViewProps = {
  timetable: Timetable;
};

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const days = ['월', '화', '수', '목', '금'];

const colors = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-green-100 border-green-300 text-green-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-orange-100 border-orange-300 text-orange-900',
  'bg-pink-100 border-pink-300 text-pink-900',
  'bg-indigo-100 border-indigo-300 text-indigo-900',
  'bg-yellow-100 border-yellow-300 text-yellow-900',
  'bg-red-100 border-red-300 text-red-900',
];

export function TimetableView({ timetable }: TimetableViewProps) {
  const getCourseColor = (courseId: string) => {
    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getCourseAtSlot = (day: string, time: string) => {
    return timetable.courses.find(
      course => course.day.includes(day) && course.time.startsWith(time)
    );
  };

  return (
    <div className="space-y-4">
      {/* Course List */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-gray-900 mb-3">수업 목록</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {timetable.courses.map(course => (
            <div key={course.id} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${getCourseColor(course.id)}`}></div>
              <span className="text-gray-700">{course.name} ({course.credits}학점)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 bg-gray-100">
          <div className="p-3 text-center border-r border-gray-300">
            <span className="text-gray-600">시간</span>
          </div>
          {days.map(day => (
            <div key={day} className="p-3 text-center border-r border-gray-300 last:border-r-0">
              <span className="text-gray-900">{day}</span>
            </div>
          ))}
        </div>

        {timeSlots.map(time => (
          <div key={time} className="grid grid-cols-6 border-t border-gray-300">
            <div className="p-3 text-center border-r border-gray-300 bg-gray-50">
              <span className="text-gray-600">{time}</span>
            </div>
            {days.map(day => {
              const course = getCourseAtSlot(day, time);
              return (
                <div
                  key={`${day}-${time}`}
                  className="p-2 border-r border-gray-300 last:border-r-0 min-h-[60px] relative"
                >
                  {course && (
                    <div className={`absolute inset-1 rounded border-2 p-2 ${getCourseColor(course.id)}`}>
                      <div className="overflow-hidden">
                        <div className="truncate">{course.name}</div>
                        <div className="text-xs opacity-75">{course.professor}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
