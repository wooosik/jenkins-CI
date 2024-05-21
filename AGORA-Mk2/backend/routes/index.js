const express = require("express");
const bodyParser = require("body-parser");
const User = require("./users");
const Discussion = require("./discussions");
const UserAnswer = require("./userAnswers");
const Question = require("./questions");
const Category = require("./category");

const router = express.Router();
router.use(bodyParser.json());
router.use(express.json());

// users =========================================================================
// 회원가입
router.post("/signup", (req, res) => {
  console.log(`user collections`);
  try {
    const tmp = User.usersModel.findById(req.body.user_id, (err, users) => {
      console.log(users);
      if (users) {
        return res.status(409).json({ message: "이미 가입된 유저입니다." });
      } else {
        User.create({ user_id: req.body.user_id, password: req.body.password, is_admin: req.body.is_admin });
        res
          .status(201)
          .json({ user_id: req.body.user_id, message: "회원 가입 성공" });
      }
    });
  } catch (err) {
    if (err.name == "ValidationError") {
      console.error("validation error: " + err);
      res.status(400).json(err);
    } else {
      console.error("could not save: " + err);
      res.status(500).json(err);
    }
  }
});

// 로그인
router.post("/login", (req, res) => {
  const { user_id, password } = req.body;
  // 요청된 user_id를 데이터베이스에서 찾는다.
  try {
    User.usersModel.findById(user_id, (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: "서버 에러 발생" });
      }

      if (!user) {
        return res.status(400).json({ success: false, message: "존재하지 않는 아이디입니다." });
      }
      // 비밀번호 확인 
      if (user.password === password) {
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({ // 상태 코드를 201로 변경
          success: true,
          user_id: user.id, // 사용자의 ID를 반환
          is_admin: user.is_admin // admin 여부 반환
        });
      } else {
        return res.status(401).json({ success: false, message: "비밀번호가 틀렸습니다." });
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "서버 처리 중 오류 발생" });
  }
});

// 유저 삭제 (탈퇴)
router.post("/user/delete", async(req, res) => {
  console.log(`delete user`);
  const id = req.body.user_id;
  const pwd = req.body.password;

  try {
    // 사용자 정보 조회
    const user = await User.usersModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // 비밀번호 일치 여부 확인
    if (user.password !== pwd) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 비밀번호가 일치하면 사용자 정보 삭제
    await User.usersModel.deleteOne({ _id: id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

// discussion =========================================================================
router.post("/discussion", (req, res) => {
  console.log(`create opinion`);
  try {
    //Question 모델 생성되면
    Discussion.create({
      user_id: req.body.user_id,
      question_id: req.body.question_id,
      discussion_content: req.body.discussion_content,
    });
    res.status(200).send();
  } catch (err) {
    if (err.name == "ValidationError") {
      console.error("validation error: " + err);
      res.status(400).json(err);
    } else {
      console.error("could not save: " + err);
      res.status(500).json(err);
    }
  }
});

router.get("/discussion", (req, res) => {
  console.log(`get discussion`);
  try {
    Discussion.discussionsModel.find(
      { question_id: req.query.question_id },
      (err, messages) => {
        let list = [];
        console.log(messages);
        if (messages.length > 0) {
          messages.forEach((message) => {
            if (message.user_id && message.discussion_content) {
              list.push({
                user_id: message.user_id,
                discussion_content: message.discussion_content,
              });
            }
          });
        }
        res.status(200).json(list);
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// userAnswers =========================================================================
// 문제 풀기
router.post("/answer", (req, res) => {
  console.log(`create answer`);
  try {
      UserAnswer.userAnswersModel.find(
          { user_id: req.body.user_id, question_id: req.body.question_id },
          (err, messages) => {
              if (messages.length > 0) {
                  return res.status(409).json({ message: "이미 푼 문제입니다." });
              } else {
                  let selectedAnswers;
                  // selected_answer가 배열인지 확인하고, 대문자로 변환 처리
                  if (Array.isArray(req.body.selected_answer)) {
                      selectedAnswers = req.body.selected_answer.map(answer => answer.toUpperCase());
                  } else {
                      selectedAnswers = [req.body.selected_answer.toUpperCase()];
                  }

                  UserAnswer.create({
                      user_id: req.body.user_id,
                      question_id: req.body.question_id,
                      selected_answer: selectedAnswers,
                  });
                  res.status(200).send();
              }
          }
      );
  } catch (err) {
      console.error("could not save: " + err);
      res.status(500).json(err);
  }
});

// 특정 문제에 대한 유저의 답변 조회 *사용 안함
router.get("/answer", (req, res) => {
  console.log(`get answer`);
  try {
    UserAnswer.userAnswersModel.find(
      { user_id: req.query.user_id, question_id: req.body.question_id },
      (err, messages) => {
        console.log(messages);
        if (messages.length > 0) {
          messages.forEach((message) => {
            if (message.selected_answer) {
              return res
                .status(200)
                .json({ selected_answer: message.selected_answer });
            }
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// 사용자가 푼 문제들 조회 - 리스트 {문제번호, 선택한 답} *사용 안함
router.get("/answers", (req, res) => {
  console.log(`get answer`);
  try {
    UserAnswer.userAnswersModel.find(
      { user_id: req.body.user_id },
      (err, messages) => {
        let list = [];
        console.log(messages);
        if (messages.length > 0) {
          messages.forEach((message) => {
            if (message.selected_answer) {
              list.push({
                question_id: message.question_id,
                selected_answer: message.selected_answer,
              });
            }
          });
        }
        res.status(200).json(list);
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// 사용자가 푼 문제 개수 조회
router.get("/answers/solcount", async(req, res) => {
  console.log("count solved questions");
  const id = req.query.user_id;
  
  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.usersModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const count = await UserAnswer.userAnswersModel.countDocuments({ user_id : id});
    res.status(200).json(count);
  } catch (err){
    res.status(500).json(err);
  }
});

// 사용자가 푼 문제 조회
router.get("/answers/solquestions", async(req, res) => {
  console.log(`get solved questions`);
  const id = req.query.user_id;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.usersModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // useranswer에서 id로 검색 후 반환
    const answerkv = await UserAnswer.userAnswersModel.find(
      { user_id: id }
    );
    
    if (answerkv.length === 0) {
      return res.status(204).json({ message: "No solved questions" });
    }

    // 가져온 값 question_id만 배열로 변환
    const answerlist = answerkv.map(a => a.question_id);

    // 배열을 이용해 해당하는 문제 출력
    // $in 연산자 : 배열 안의 값 중 일치하는 값 찾기
    const answerqsts = await Question.qstModel.find(
      { _id:  { $in: answerlist }}
    );

    // document(mongoose)를 object로 변환(js)
    const answers = {
      data: answerqsts.map((q) => q.toObject( { getters: false }))
    };

    res.status(200).json(answers);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 답 선택 비율 조회
router.get("/ratio", async (req, res) => {
  try {
    const messages = await UserAnswer.userAnswersModel.find({ question_id: req.query.question_id }).exec();
    let counts = {}; // 각 선택지에 대한 카운트
    let total = 0; // 전체 답변 수

    messages.forEach((message) => {
      // 다중 선택지 처리
      message.selected_answer.forEach((answer) => {
        // answer는 선택된 답변의 텍스트
        if (!counts[answer]) {
          counts[answer] = 0;
        }
        counts[answer]++;
        total++;
      });
    });

    let result = {};
    Object.keys(counts).forEach((key) => {
      result[key] = ((counts[key] / total) * 100).toFixed(2);
    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// question =========================================================================
//문제 추가
router.post("/question", async (req, res) => {
  try {
    let temp = req.body;

    // // 질문 텍스트 중복 체크
    // const dupCheck = await Question.qstModel.findOne({
    //   question_text: temp.question_text,
    // });
    // if (dupCheck) {
    //   return res.status(409).json({ message: "Duplicate question text" });
    // }

    // qst_counter에서 name 조회 후 count 판단
    const type = req.body.qualification_type;
    let response = await Question.qstCounter.findOne({ type: type });
    if (response) {
      temp._id = `${type}_${++response.count}`;
      await createQuestion(temp);
      await response.save();
    } else {
      // 없으면 초기등록
      temp._id = `${type}_1`;
      await createQuestion(temp);
      await Question.qstCounter.create({ type: type, count: 1 });
    }
    res.status(201).json({ message: "Question add success" });
  } catch (err) {
    if (err.name == "ValidationError") {
      console.error("validation error: " + err);
      res.status(400).json(err);
    } else {
      console.error("could not save: " + err);
      res.status(500).json(err);
    }
  }
});

async function createQuestion(temp) {
  await Question.qstModel.create({
    _id: temp._id,
    user_id: temp.user_id,
    qualification_type: temp.qualification_type,
    question_text: temp.question_text,
    options: temp.options,
    correct_answer: temp.correct_answer,
  });
}

// 문제 전체 출력 (유형별)
router.get("/question", async (req, res) => {
  const { qualification_type } = req.query;
  console.log(`get question by qualification_type`);
  try {
    const questions = await Question.qstModel.find({
      qualification_type: qualification_type,
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions" });
    }

    const list = {
      data: questions.map((q) => q.toObject({ getters: false })),
    };

    res.status(200).json(list);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 문제 출력 (개별)
router.get("/question-detail", async (req, res) => {
  const { _id } = req.query;
  console.log(`get each question by _id`);
  try {
    const qid = await Question.qstModel.findOne({ _id: _id });

    if (!qid || qid.length === 0) {
      return res.status(404).json({ message: "No question" });
    }

    const question = qid.toObject({ getters: false });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 문제 삭제 
router.delete("/question/delete", async (req,res) => {
  const { _id, user_id } = req.query;
  console.log(`delete question by _id: ${_id} and user_id: ${user_id}`);
  try{
    // 문제 id로 문제 find
    const question = await Question.qstModel.findOne({
      _id: _id
    });

    // 문제 자체가 존재하지 않으면 404
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    if (question.user_id !== user_id) {
      return res.status(403).json({ message: "user_id does not match" });
    }

    // 문제 자체 삭제
    const result = await Question.qstModel.deleteOne({
      _id: _id,
      user_id: user_id
    });

    // 문제 풀이여부 삭제 (useranswers)
    await UserAnswer.userAnswersModel.deleteMany({
      question_id: _id
    })

    // 문제 댓글 삭제 (discussions)
    await Discussion.discussionsModel.deleteMany({
      question_id: _id
    })  
    
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Question deleted successfully" });
    } else {
      res.status(404).json({ message: "Question not found" });
    }
    
  } catch (err) {
    res.status(500).json(err);
  }
});

// 사용자가 추가한 문제 개수 조회
router.get("/question/useraddcount", async(req, res) => {
  console.log("count added questions");
  const id = req.query.user_id;
  
  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.usersModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const count = await Question.qstModel.countDocuments({ user_id : id});
    res.status(200).json(count);
  } catch (err){
    res.status(500).json(err);
  }
});

// 사용자가 추가한 문제 조회
router.get("/question/useraddquestions", async (req, res) => {
  console.log(`get added questions`);
  const id = req.query.user_id;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.usersModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const questions = await Question.qstModel.find(
      { user_id: id }
    );

    if (questions.length === 0) {
      return res.status(204).json({ message: "No added questions" });
    }

    const list = {
      data: questions.map((q) => q.toObject({ getters: false })),
    };

    res.status(200).json(list);
  } catch (err) {
    res.status(500).json(err);
  }
});

// category =========================================================================
// 카테고리 추가
router.post("/category", async (req, res) => {
  console.log(`add category`);
  try {
    const dupCheck = await Category.cateModel.findOne({
      qualification_type: req.body.qualification_type,
    });
    if (dupCheck) {
      return res.status(409).json({ message: "Duplicate category" });
    }

    await Category.cateModel.create({
      qualification_type: req.body.qualification_type,
    });
    res.status(200).json({ message: "Category add success" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 카테고리 조회
router.get("/category", async (req, res) => {
  console.log(`get category`);
  try {
    const tempCate = await Category.cateModel.find({}).exec();
    const categories = tempCate.map((category) => category.qualification_type);
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 카테고리 삭제(하위 문제 전부 삭제)
router.delete("/category/delete", async (req,res) => {
  const { qualification_type, is_admin } = req.query;
  console.log(`delete catgory`);
  
  if(is_admin == 'true'){
    try{
      await Category.cateModel.deleteOne({
        qualification_type: qualification_type
      });
      await Question.qstCounter.deleteOne({
        type: qualification_type
      })
      await Question.qstModel.deleteMany({
        qualification_type: qualification_type
      })
      
      // 문제 풀이여부 삭제 (useranswers)
      await UserAnswer.userAnswersModel.deleteMany({
        question_id: new RegExp('^' + qualification_type + '_')
      })

      // 문제 댓글 삭제 (discussions)
      await Discussion.discussionsModel.deleteMany({
        question_id: new RegExp('^' + qualification_type + '_')
      })  

      res.status(200).json({ message: "Category and Questions deleted successfully" });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json({ message: "deleted failed: not admin user"});
  }
});


module.exports = router;
