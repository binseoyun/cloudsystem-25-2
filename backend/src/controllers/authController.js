//회원가입과 로그인 구현
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//1. 회원가입 controller
exports.register = async (req, res) => {
    try{
        const{  name, major,studentId,password} = req.body;
        //이미 존재하는 학생ID인지 확인
        const existingUser = await User.findOne({ where: { studentId } });
        if(existingUser){
            return res.status(400).json({ message: '이미 존재하는 학생ID입니다.'});
        }

        //비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 12);

        //새로운 사용자 생성
        await User.create({
            studentId,
            password: hashedPassword,
            name,
            major
        });
        res.status(201).json({ message: '회원가입이 완료되었습니다.'});
    } catch (error){
        console.error('회원가입 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.'});

    }
    };

    //2. 로그인 controller
    exports.login = async (req, res) => {
        try{
            const{studentId, password} = req.body;
            //유저 찾기
            const user = await User.findOne({ where: { studentId } });
            if(!user){
                return res.status(400).json({ message: '존재하지 않는 학번입니다.'});
            }
            //비밀번호 확인
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({ message: '비밀번호가 올바르지 않습니다.'});
            }

           //JWT 생성
           //유저 DB ID인 user.id를 토큰에 담아줌
              const token = jwt.sign({ id:user.id}, process.env.JWT_SECRET, { expiresIn: '1h'});
              
              res.status(200).json({ 
                    message: '로그인 성공',
                    token,
                user:{name: user.name, studentId: user.studentId}
             });
        } catch (error){
            console.error('로그인 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.'});
        }
    };