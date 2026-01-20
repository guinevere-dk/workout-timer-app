HANDOFF.md

Project: fitness-buddy-app (Expo + React Native, TypeScript)
Status: EditPlaylistScreen 중심 기능 구현 중

1. 지금까지 한 일 (FACT)
1) 앱 구조

Expo 기반 React Native 앱

진입점: index.ts → App.tsx

화면 구성:

HomeScreen

PlayerScreen

CompleteScreen

EditPlaylistScreen (현재 작업 중, 핵심)

2) 도메인 타입 (src/domain/types.ts)

Playlist, PlaylistStep

ExerciseStep | RestStep

ExerciseType은 string union

현재 구조는 시간 기반(step.durationSec) 플레이리스트

Player/Character/AppState까지 타입 정의 완료

3) EditPlaylistScreen 구현 상태 (UI/기능)

루틴 이름 수정 가능

총 시간 계산 + 최소 3분 검증

step duration ±10초 조절

step 순서 변경: 위로 / 아래로 버튼 방식 (드래그 미사용)

하단 sticky total bar 겹침 문제 해결

footer height 실측 → ScrollView paddingBottom 동적 처리

SafeArea + KeyboardAvoidingView 안정화 완료

4) 운동 선택 UX

운동 이름을 직접 입력하지 않음

BottomSheet/Modal로 “운동 선택하기” 구현

운동 목록에서 탭하면 step.label / exerciseType 설정

5) 기술적 이슈 해결 내역

❌ react-native-draggable-flatlist 도입 시도 → 완전히 포기

Worklets version mismatch (JS/native)

Expo newArch + Reanimated 충돌

✔ 대신 버튼 기반 순서 변경으로 안정성 확보

PowerShell 환경 (Windows)

rm -rf 불가 → Remove-Item -Recurse -Force

2. 현재 상태 요약 (FACT)

EditPlaylistScreen UI는 거의 완성

현재 가능한 조작:

시간 변경

순서 변경

운동 선택

아직 없는 핵심 기능:

❌ step 추가

❌ step 삭제

도메인 레벨에서 step 편집 함수는 아직 없음

3. 다음으로 해야 할 일 (NEXT STEPS)
STEP 1. Step 추가 / 삭제 도메인 로직 추가 (우선순위 ★★★★★)

새 파일 생성:

src/domain/editSteps.ts


필요 함수:

insertStepAfter(playlist, index, 'exercise' | 'rest')

removeStepAt(playlist, index)

moveStep(playlist, from, to) ← 이미 UI에서 유사 로직 있음

(선택) normalizePhases()

warmup / exercise / cooldown 자동 재정렬

👉 중요: UI는 절대 배열 직접 조작하지 말고, 도메인 함수만 호출하게 할 것

STEP 2. EditPlaylistScreen에 버튼 연결

각 step 카드에 다음 버튼 추가:

운동 추가

휴식 추가

삭제

상태 변경 방식:

setPlaylist(prev => insertStepAfter(prev, index, 'exercise'));

STEP 3. 타입 개선 (중요 설계 포인트)

현재:

exerciseType: ExerciseType;


문제:

“운동 선택하기” 상태를 타입으로 표현 불가

권장 수정 (강력 추천):

exerciseType?: ExerciseType;


그리고:

validatePlaylist에서

exercise step인데 exerciseType === undefined → 저장 불가 에러

4. 절대 주의할 점 (VERY IMPORTANT)
❌ 1) 드래그 라이브러리 다시 쓰지 말 것

react-native-draggable-flatlist

react-native-reanimated 직접 의존

Expo new architecture와 충돌 가능성 매우 높음

이미 실패 사례 있음

❌ 2) UI에서 steps 배열 직접 splice 금지

반드시 domain 함수 거칠 것

이유:

phase 정규화

validation 일관성

추후 undo/redo, analytics 확장 대비

❌ 3) babel / reanimated 설정 건드리지 말 것

이전에 babel.config.js 추가 이후 Worklets 에러 발생

현재는 안정 상태

새 라이브러리 추가 시 반드시 Expo 공식 문서 확인

5. 설계 의도 (CONTEXT – WHY)

이 앱은 조용하고 비경쟁적인 루틴 앱

“편집 UX의 안정성”이 드래그 화려함보다 우선

모든 편집은:

명시적 버튼

예측 가능한 결과

도메인 로직을 두껍게 → UI는 얇게

6. 현재 화면 상태 한 줄 요약

EditPlaylistScreen은 ‘거의 완성’ 상태이며,
step 추가/삭제만 붙이면 Phase 1 기능 완료 수준이다.