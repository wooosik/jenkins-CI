<template>
    <header>
        <div class="headline">
            <!-- 이미지와 텍스트에 tabindex와 클래스 추가 -->
            <img src="../../assets/mk2.png" class="clickable" style="max-width: 10%; height: auto;" @click="goToHomePage" tabindex="0">
            <!-- <div class="headline-menu clickable" @click="goToHomePage" tabindex="0">
                <p>AGORA</p>
            </div> -->
            <button class="mypage-button" v-if="$route.path !== '/'" @click="goToMyPage()">Mypage</button>
        </div>
    </header>
    <nav></nav>
</template>

<script>
export default {
    data() {
        return {
            boxPadding: '20px'
        }
    },
    methods: {
        goToHomePage() {
          this.$router.push('/');
        },
        goToMyPage() {
          this.$router.push('/mypage');  
        }
    }
}
</script>

<style scoped>
header {
    top: 8px;
    height: 15%;
    border-bottom: 1px solid #E6E6E6;
    background-color: #FFFFFF;
}

.headline {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 0.5% 0.5%;
    justify-content: space-between;
}

.headline-menu {
    display: flex;
    height: 100%;
    cursor: pointer; /* 마우스 커서를 포인터로 변경 */
}

.clickable {
    cursor: pointer; /* 마우스 커서를 포인터로 변경 */
    transition: transform 0.2s; /* 부드러운 변환 효과 */
}

/* 호버 시에 시각적 효과 */
.clickable:hover {
    transform: scale(1.05); /* 이미지와 텍스트를 약간 확대 */
}

.clickable:focus {
    outline: none; /* 기본 윤곽선 제거 */
    border: 2px solid #ccc; /* 포커스 시 윤곽선 추가 */
}

.mypage-button {
    width: 10%;
    padding: 0.5rem;
    border: none;
    border-radius: 5px;
    background: black;
    color: white;
    cursor: pointer;
    margin-right: 1%
}

.mypage-button:hover {
    background: #333;
}
</style>
