<template>
  <div class="container">
      <!--<input class="search-bar" type="text" v-model="searchTerm" placeholder="검색..." />-->
      <div class="mypage-notice">내가 등록한 문제 수: <span class="mypage-count">{{ add_count }}</span></div>
      <div v-if="no_add_questions == 1" class="list-container" >
        <div class="list-item">
          <p>등록한 문제가 없습니다</p>
        </div>
      </div>
      <div v-if="no_add_questions == 0" class="list-container">
          <div class="list-item" v-for="question in add_questions" :key="question.id">
              <p>User ID: {{ question.user_id }}</p>
              <p>Question: {{ question.question_text }}</p>
              <!-- 문제 풀기 버튼 -->
              <button class="action-button" @click="goToSolvingQuestion(question.id)">문제 풀기</button>
              <!-- 토론장 이동 버튼 -->
              <button class="action-button" @click="goToDiscussQuestion(question.id)">토론장으로</button>
              <!-- 삭제 버튼 -->
              <button class="action-button" @click="deleteAddedQuestion(question.id)">문제 삭제</button>
          </div>
      </div>

      <div class="mypage-notice">내가 푼 문제 수: <span class="mypage-count">{{ solved_count }}</span></div>
      <div v-if="no_sol_questions == 1" class="list-container" >
        <div class="list-item">
          <p>푼 문제가 없습니다</p>
        </div>
      </div>
      <div v-if="no_sol_questions == 0" class="list-container">
          <div class="list-item" v-for="question in solved_questions" :key="question.id">
              <p>User ID: {{ question.user_id }}</p>
              <p>Question: {{ question.question_text }}</p>
              <!-- 문제 풀기 버튼 -->
              <!-- <button class="action-button" @click="goToSolvingQuestion(question.id)">문제 풀기</button> -->
              <!-- 토론장 이동 버튼 -->
              <button class="action-button" @click="goToDiscussQuestion(question.id)">토론장으로</button>
              <!-- 삭제 버튼 -->
              <!-- <button class="action-button" @click="deleteQuestion(question.id)">문제 삭제</button> -->
          </div>
      </div>
      <!-- <button class="add-button" @click="addQuestion">문제 추가</button>-->
  </div>
</template>

<script>
import axios from 'axios';

/* eslint-disable */
export default {
  name: 'QuestionList',
  data(){
      return {
        add_questions: [],
        solved_questions: [],
        searchTerm: '',
        qualification_type: '',
        add_count: 0,
        solved_count: 0,
        no_add_questions: 0,
        no_sol_questions: 0
      };
  },
  // computed: {
  //   filteredQuestions() {
  //       return this.questions.filter(question =>
  //           question.question_text && // question_text가 null 또는 undefined가 아닌 경우에만 진행합니다.
  //           question.question_text.toLowerCase().includes(this.searchTerm.toLowerCase())
  //       );
  //   }
  // },
  methods: {
      // addQuestion() {
      //     this.$router.push({ name: 'addquestion', query: { category: this.qualification_type } });
      // },
      goToSolvingQuestion(questionId) {
          this.$router.push({ name: 'solvingquestion', params: { questionId } });
      },
      goToDiscussQuestion(questionId) {
          this.$router.push({ name: 'discussquestion', params: { questionId } });
      },
      // 사용자가 추가한 문제 조회
      loadAddedQuestions() { 
          const userId = localStorage.getItem('user_id');
          axios.get(`${process.env.VUE_APP_BACKEND_API}/question/useraddquestions?user_id=${userId}`, {
              headers: {
                  'Content-Type': 'application/json', 
              }
          }).then(response => {
              if(response.status === 204){
                this.no_add_questions = 1;
              } else {
                this.no_add_questions = 0;
                this.add_questions = response.data.data.map(item => ({
                  id: item._id,
                  user_id: item.user_id,
                  question_text: item.question_text
                }));
              }
          }).catch(error => {
              console.error('Error loading addedQuestions:', error);
          });
      },
      // 사용자가 추가한 문제 수
      countAddedQuestions(){
        const userId = localStorage.getItem('user_id');
        axios.get(`${process.env.VUE_APP_BACKEND_API}/question/useraddcount?user_id=${userId}`, {
              headers: {
                  'Content-Type': 'application/json',
              }
          }).then(response => {
              this.add_count = response.data;
          }).catch(error => {
              console.error('Error loading addedQuestionCounts:', error);
          });
      },
      // 사용자가 추가한 문제 삭제
      deleteAddedQuestion(questionId){
          const userId = localStorage.getItem('user_id'); // 로컬 스토리지에서 사용자 ID 가져오기
          const index = this.add_questions.findIndex(add_questions => add_questions.id === questionId);
          if (index !== -1){
              const confirmDelete = confirm('정말로 이 문제를 삭제하시겠습니까?');
              if (!confirmDelete) {
                // 사용자가 '취소'를 클릭한 경우, 함수를 종료합니다.
                return;
              }
              axios.delete(`${process.env.VUE_APP_BACKEND_API}/question/delete?_id=${questionId}&user_id=${userId}`)
                  .then(response => {
                      if (response.status === 200){
                          this.add_questions.splice(index, 1);
                          alert('질문이 정상적으로 삭제되었습니다');
                      }
                  })
                  .catch(error => {
                    if (error.response.status === 403) {
                      alert('본인이 등록한 문제만 삭제할 수 있습니다');
                    } else {
                      console.error('Error deleting the question:', error);
                      alert('Failed to delete the question');}
                  });
          }
      },
      // 사용자가 푼 문제 조회
      loadSolvedQuestions() { 
          const userId = localStorage.getItem('user_id');
          axios.get(`${process.env.VUE_APP_BACKEND_API}/answers/solquestions?user_id=${userId}`, {
              headers: {
                  'Content-Type': 'application/json',
              }
          }).then(response => {
              if(response.status === 204){
                this.no_sol_questions = 1;
              } else {
                this.no_sol_questions = 0;
                this.solved_questions = response.data.data.map(item => ({
                  id: item._id,
                  user_id: item.user_id,
                  question_text: item.question_text
                }));
              }
          }).catch(error => {
              console.error('Error loading solvedQuestions:', error);
          });
      },
      // 사용자가 푼 문제 수
      countSolvedQuestions(){
        const userId = localStorage.getItem('user_id');
        axios.get(`${process.env.VUE_APP_BACKEND_API}/answers/solcount?user_id=${userId}`, {
              headers: {
                  'Content-Type': 'application/json',
              }
          }).then(response => {
              this.solved_count = response.data;
          }).catch(error => {
              console.error('Error loading solvedQuestionCounts:', error);
          });
      },
      // deleteQuestion(questionId){
      //     const userId = localStorage.getItem('user_id'); // 로컬 스토리지에서 사용자 ID 가져오기
      //     const index = this.questions.findIndex(question => question.id === questionId);
      //     if (index !== -1){
      //         axios.delete(`${process.env.VUE_APP_BACKEND_API}/question/delete?_id=${questionId}&user_id=${userId}`)
      //             .then(response => {
      //                 if (response.status === 200){
      //                     this.questions.splice(index, 1);
      //                     alert('질문이 정상적으로 삭제되었습니다');
      //                 }
      //             })
      //             .catch(error => {
      //               if (error.response.status === 403) {
      //                 alert('본인이 등록한 문제만 삭제할 수 있습니다');
      //               } else {
      //                 console.error('Error deleting the question:', error);
      //                 alert('Failed to delete the question');}
      //             });
      //     }
      // },
  },
  created(){
      this.qualification_type = decodeURIComponent(this.$route.query.category || '');
      this.loadAddedQuestions(); // 데이터 로딩을 위해 메서드 호출
      this.countAddedQuestions();
      this.loadSolvedQuestions();
      this.countSolvedQuestions();
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  width: 100%;
  /* 가로 전체 길이 사용 */
  padding: 10px;
  border: 2px solid #ccc;
  /* 그레이 테두리 */
  border-radius: 5px;
  /* 약간의 둥근 모서리 */
}

.list-container {
  width: 100%;
  /* 가로 전체 길이 사용 */
  background-color: #f9f9f9;
  /* 밝은 그레이 배경 */
  border: 1px solid #ddd;
  /* 섬세한 테두리 */
  border-radius: 5px;
  max-height: 300px;
  /* 최대 높이 설정 */
  overflow-y: auto;
  /* 내용이 넘칠 경우 스크롤 */
}

.list-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  /* 항목 간 구분선 */
}

.list-item:last-child {
  border-bottom: none;
  /* 마지막 항목은 구분선 제거 */
}

.add-button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #333;
  /* 어두운 배경 */
  color: white;
  /* 텍스트 색상 */
  border: none;
  /* 테두리 제거 */
  border-radius: 5px;
  /* 둥근 모서리 */
  cursor: pointer;
  /* 클릭 가능한 핸드 커서 */
  font-weight: bold;
  /* 글자 진하게 */
}

.add-button:hover {
  background-color: #555;
  /* 마우스 호버시 배경색 변경 */
}

.action-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #333;
  /* Green */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.action-button:hover {
  background-color: #333;
}

.mypage-notice {
  display: flex;
  font-size: 1.2em;
  font-weight: bold;
  width: 100%;
  margin-top: 0.5em;
}

.mypage-count{
  display: flex;
  font-size: 1.3em;
  color: darksalmon;
  margin-left: 0.3em;
}

</style>