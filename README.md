# 다이아리

팀을 만들고, 그 팀으로 야구 경기를 치르는 시뮬레이션입니다.

## 기록이 어디에 남나요

- **항상 이 브라우저**: IndexedDB에 남습니다. 동기화가 실패해도 지우지 않습니다.
- **폰 ↔ 컴퓨터 자동 연결**: Cursor에 같은 계정으로 로그인한 **private 앱**에서 클라우드 금고에 맞춰집니다. 백업 코드 입력은 없습니다.
- **GitHub Pages** (`https://krartwide.github.io/`): 이 브라우저 기록을 유지합니다. 동기화 앱 주소가 연결되면 「클라우드로 이어받기」로 한 번 넘길 수 있습니다(원본은 그대로).

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
