# InterviewFit 카카오 로그인 연결

## 1. 프론트 환경변수

프로젝트 루트의 `.env.local`을 아래처럼 설정합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_REST_API_KEY=카카오_REST_API_키
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/oauth/kakao/callback
```

`NEXT_PUBLIC_KAKAO_REST_API_KEY`에는 JavaScript 키가 아니라 REST API 키를 입력합니다.

## 2. 카카오 디벨로퍼스 Redirect URI

아래 URI를 정확히 등록합니다.

```text
http://localhost:3000/oauth/kakao/callback
```

## 3. Spring Boot 실행

```bash
cd /Users/mxxxdxxx/interview-fit/InterviewFit-BE
export KAKAO_REST_API_KEY='카카오_REST_API_키'
./gradlew bootRun
```

Client Secret을 활성화한 앱에서만 아래 환경변수를 추가합니다.

```bash
export KAKAO_CLIENT_SECRET='클라이언트_시크릿'
```

## 4. Next.js 실행

```bash
cd /Users/mxxxdxxx/interview-fit/InterviewFit-FE
npm install
npm run dev
```

브라우저에서 `http://localhost:3000/login`으로 접속한 후 `카카오로 시작하기` 버튼을 누릅니다.

## 5. 로그인 성공 시 저장되는 값

브라우저 `localStorage`에 다음 값이 저장됩니다.

- `interviewfit_access_token`: Spring에서 발급한 JWT
- `interviewfit_user`: 로그인한 사용자 정보
- `interviewfit_user_id`: 사용자 DB ID

`lib/api.ts`의 보호 API는 이 JWT를 자동으로 `Authorization: Bearer ...` 헤더에 담습니다.

## 참고

현재 Spring의 답변 영상 업로드 API는 `questionId`를 필수로 받지만, 프론트는 정적 질문 문자열만 사용하고 있습니다. 카카오 로그인과 면접 시작 연결 이후 영상 업로드 단계에서는 질문 생성 API와 `questionId` 연결이 추가로 필요합니다.
