# AWS Cloud School Side Project : AGORA-MK2

## 프로젝트의 구성

해당 프로젝트는 aws cloud school 4기의 Docker, Kubernetes 수업 일환으로 진행됐던 사이드 프로젝트입니다.

본 프로젝트는 간단한 웹 페이지를 제작하여 Docker 환경에서의 고가용성(HA) 서비스 구축을 하는 것으로 시작하였습니다.

Docker 프로젝트에서 사용했던 웹 소스를 Kubernetes에서도 또한 고가용성(HA) 서비스를 고려하여 설계하는 것을 목표로 진행했습니다.

## 프로젝트 프로그램 설치 방법

1. Node JS, docker 설치

2. frontend dir에 command line tool로 접속하여 npm install 실행

3. docker-compose.yml에서 mongodb volume의 경로 자신의 os 환경에 맞게 수정

## 디버깅 하는 방법

1. 각자 맡은 부분의 코드를 각자의 로컬 환경에서 Pull 받아 수정합니다.

2. docker compose up을 통해 front-back-db의 3 tier 프로그램을 실행합니다.

3. 자신이 원하는 대로 코드가 잘 작성됐는지 확인하고, docker compose를 종료합니다

#### 프론트엔드 디버깅 방법

1. frontend 디렉터리에 cli로 접근합니다

2. npm run serve를 통해 웹 페이지를 호스팅 합니다

3. 코드를 수정하고 저장하면, 저장 사항이 바로 반영됩니다

## 프로그래머 정보

AWS School 4기 참여자들
