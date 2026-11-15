# 다이아리

팀을 만들고, 그 팀으로 야구 경기를 치르는 시뮬레이션입니다.

## 기록이 어디에 남나요

- **항상 이 브라우저**: IndexedDB에 남습니다. 동기화가 실패해도 지우지 않습니다.
- **폰 ↔ 컴퓨터 자동 연결**: Cursor에 같은 계정으로 로그인한 **private 앱**에서 클라우드 금고에 맞춰집니다. 백업 코드 입력은 없습니다.
- **GitHub Pages** (`https://krartwide.github.io/`): 이 브라우저 기록을 유지합니다. 동기화 앱 주소가 연결되면 「클라우드로 이어받기」로 한 번 넘길 수 있습니다(원본은 그대로).

## 공개 구단 투수 구종

공개 클럽 투수 **전원**에 구종·등급(E–SS)이 들어 있습니다. 현대 선수는 야구나라·KBO 구종 분석·기사 기준으로, 레전드·깊이 로스터는 회고·역할·투구폼을 반영해 `src/data/researched-arsenals.json`에 묶였고, 선수 편집 화면과 시뮬이 이를 씁니다. 재검증 보정은 `src/data/arsenal-corrections.json`이 시드보다 우선합니다. 재시드: `node scripts/seed-arsenals.mjs` (보정 적용 후 `node scripts/correct-arsenals.mjs`).

## 실행

```bash
npm install
npm run dev
```

http://127.0.0.1:43123

### GitHub Pages

```bash
npm run build:pages
```

`main` 푸시 시 https://krartwide.github.io/ 로 배포됩니다.
