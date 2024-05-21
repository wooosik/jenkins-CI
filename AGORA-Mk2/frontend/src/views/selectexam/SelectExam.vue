<template>
  <div>
    <div class="container">
      <!-- 카테고리 리스트 -->
      <div v-for="category in categories" :key="category" class="category">
        <div @click="goToQuestionZone(category)">
          {{ category }}
        </div>
        <!-- 삭제 버튼 추가 -->
        <button v-if="is_admin == 'true'" @click="deleteCategory(category)" class="delete-button">X</button>
        <!-- <button @click="deleteCategory(category)" class="delete-button">X</button> -->
      </div>
      <!-- 새 시험 추가 버튼 -->
      <div class="category add-new" @click="showAddCategoryModal = true">
        +
      </div>
    </div>

    <!-- 카테고리 추가 모달 -->
    <div v-if="showAddCategoryModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddCategoryModal = false">&times;</span>
        <h2>새 카테고리 추가</h2>
        <input v-model="newCategoryName" placeholder="시험 이름">
        <!-- 비밀번호 필드 제거 -->
        <button @click="addNewCategory">추가하기</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Vue Router 사용
import axios from 'axios';

export default {
  setup() {
    const categories = ref([]);

    const router = useRouter(); // useRouter 훅 사용
    const showAddCategoryModal = ref(false);
    const newCategoryName = ref('');

    // const userId = localStorage.getItem('user_id');
    const is_admin = localStorage.getItem('is_admin');

    onMounted(() => {
      // API를 통해 카테고리 리스트 불러오기
      fetchCategories();
    }); const fetchCategories = async () => {
      try {
        const { data, status } = await axios.get(`${process.env.VUE_APP_BACKEND_API}/category`);
        if (status === 200) {
          categories.value = data; // 직접 데이터를 할당
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.log(is_admin);
        if (error.response) {
          alert(`Error: ${error.response.data.message}`); // 직접 오류 메시지 처리
        }
      }
    };
    const addNewCategory = async () => {
      if (newCategoryName.value) {
        try {
          const { status } = await axios.post(`${process.env.VUE_APP_BACKEND_API}/category`, {
            qualification_type: newCategoryName.value,
          });
          if (status === 200 || status === 201) { // 성공 상태 코드 확인
            alert('Category add success');
            fetchCategories(); // 카테고리 리스트 갱신
            newCategoryName.value = ''; // 입력 필드 초기화
            showAddCategoryModal.value = false; // 모달 닫기
          }
        } catch (error) {
          if (error.response) {
            const { status, data } = error.response;
            if (status === 409) {
              alert('Duplicate category');
            } else {
              alert(`Error: ${data.message}`);
            }
          } else {
            console.error('Error adding category:', error);
          }
        }
      } else {
        alert('시험 이름을 입력해주세요.');
      }
    };

    // 카테고리 삭제
    const deleteCategory = async (category) => {
      const confirmDelete = confirm('정말로 이 카테고리를 삭제하시겠습니까?');
      if (!confirmDelete) {
        // 사용자가 '취소'를 클릭한 경우, 함수를 종료합니다.
        return;
      }
      try {
        const response = await axios.delete(`${process.env.VUE_APP_BACKEND_API}/category/delete`, {
          params: {
            is_admin: is_admin,
            qualification_type: category
          }
        });
        if (response.status === 200) {
          alert('Category and Questions deleted successfully');
          fetchCategories(); // 삭제 후 카테고리 리스트 갱신
        }
      } catch (error) {
        if (error.response) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          console.error('Error deleting category:', error);
        }
      }
    };

    // 카테고리 클릭 시 실행될 함수
    const goToQuestionZone = (category) => {
      router.push({ name: 'questionzone', query: { category } });
      // 예: /questionzone?category=SAA
    };

    return {
      categories,
      is_admin,
      addNewCategory,
      deleteCategory,
      goToQuestionZone,
      showAddCategoryModal,
      newCategoryName
    };
  }
};
</script>

<style>
.container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* 변경됨 */
  align-items: center;
  justify-content: center;
  min-height: 88vh;
  background: #f5f5f5;
  font-family: Arial, sans-serif;
  gap: 2rem;
  /* 컨테이너 너비를 추가하여 항목들이 5열로 나누어질 수 있게 함 */
}

.category {
  position: relative;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  font-size: 1.5rem;
  text-align: center;
  width: calc((100% / 6) - 4rem);
  /* 5개의 열로 나누기 위한 계산식 */
}

.category:hover {
  transform: translateY(-5px);
}

.add-new {
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 5px;
}

.delete-button{
  color: rgb(255, 255, 255);
  background-color: rgb(254, 138, 138);
  position: absolute;
  top: 10px; 
  right: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>