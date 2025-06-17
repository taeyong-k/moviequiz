// section: 인트로
const $intro = document.getElementById('intro');
const $startButton = $intro.querySelector(':scope > .start > .button');
const $methodRadios = $intro.querySelectorAll(':scope > .method-container > .label > .radio');
let $quizCounter;

// 게임시작 button : 옵션 선택 (기본값: 비활성화)
$startButton.disabled = true;

$methodRadios.forEach($radio => {
    $radio.addEventListener('change', () => {
        const resolve = $intro.querySelector(':scope > .method-container > .label > .radio:checked')?.value;
        if (resolve === "10" || resolve === "20" || resolve === "30") {
            $startButton.disabled = false;
            $quizCounter = parseInt(resolve);
        } else {
            $startButton.disabled = true;
        }
    });
});

$startButton.onclick = () => {
    $intro.classList.remove('visible');
    const $input = question.querySelector(':scope > .label > .input');
    if ($input) {
        $input.focus();  // 포커스 설정
    }
}


// API
const apiKey = 'YOUR_API_KEY_HERE';
const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ko-KR&with_origin_country=KR&sort_by=popularity.desc&with_original_language=ko`;

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlYjRiYzRkMWU4MWNiN2FmYzY3NWEzNGE3NTc5ZTE4NSIsIm5iZiI6MTc0MjE3MzE3Mi4wNzIsInN1YiI6IjY3ZDc3M2Y0ODVkMTM5MjFiNTAxNDAyNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cFSDkctSKaycDI_IAwQSfI8FpjBDbIi7GE3gpypuSZ4'
    }
};

const $quiz = document.getElementById('movieQuiz');

let $repeatMovies = [];
const $totalPageMovies = 10;
let $answerTitle;
let $posterImage;

// 랜덤 페이지
function fetchRandomMoviePage() {
    const $randomPage = Math.floor(Math.random() * $totalPageMovies) + 1;
    const $randomUrl = `${apiUrl}&page=${$randomPage}`;

    fetch($randomUrl, options)
        .then(response => response.json())
        .then(data => fetchSecondThen(data))
        .catch(error => console.error("영화 데이터를 불러오지 못했습니다", error));
}

// API 추가 기능
function fetchSecondThen(data) {
    let movie;

    // 중복처리
    do {
        movie = data.results[Math.floor(Math.random() * data.results.length)];
    } while ($repeatMovies.includes(movie.id));

    $repeatMovies.push(movie.id);

    // 영화 제목, 포스터
    const $movieTitle = movie.title;
    const $moviePosterPath = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    $quiz.querySelector(':scope > .quiz.question').innerHTML = `
        <img alt="moviePoster" class="moviePoster" src="${$moviePosterPath}">
        <label class="label">
            <input class="input" name="keyword" placeholder="정답을 입력해주세요." spellcheck="false" type="text" minlength="1" maxlength="50">
            <button class="button" type="submit">&gt;</button>
        </label>`

    $answerTitle = $movieTitle
    $posterImage = $moviePosterPath
}

fetchRandomMoviePage();


// section: 메인(퀴즈)
const question = $quiz.querySelector(':scope > .quiz.question');
const answer = $quiz.querySelector(':scope > .quiz.answer');
let counter = 1;
let correctCounter = 0;

// 화면 포커스 처리
function nextScreen() {
    fetchRandomMoviePage();
    question.classList.add('visible');
    answer.classList.remove('visible');
    answer.innerHTML = ' '
    setTimeout(() => {
        const $input = question.querySelector(':scope > .label > .input');
        if ($input) {
            $input.focus();  // 포커스 설정
        }
    }, 20);  // 화면 전환 후 50ms 지연
}

question.onsubmit = (e) => {
    e.preventDefault();
    const $quizValue = question['keyword'].value.replace(/\s/g, "");    // 공백처리
    if ($quizValue.trim() !== "" && $answerTitle.includes($quizValue) === true) {   // 양쪽 끝 공백처리
        correctCounter++;
        question.classList.remove('visible');
        answer.classList.add('visible');
    } else {
        question.classList.remove('visible');
        answer.classList.add('visible');
    }
    // answer 페이지
    answer.innerHTML = ` 
            <img alt="moviePoster" class="moviePoster" src="${$posterImage}">
            <div class="caption">
                <span class="result">${$quizValue.trim() !== "" && $answerTitle.includes($quizValue) ? '정답' : '오답'}</span>
                <span class="name">${$answerTitle}</span>
            </div>
            <button class="button" type="button">&gt;</button>`

    if (counter >= $quizCounter) {
        answer.classList.add('visible');

        answer.querySelector(':scope > .button').onclick = () => {
            $quiz.classList.remove('visible');
            $footer.classList.add('visible');
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                $quiz.classList.remove('visible')
                $footer.classList.add('visible');
            }
        });

        // 푸터에 정답 개수 표시 (correctCounter 값 사용)
        $footer.querySelector(':scope > .correct > .caption').innerHTML = `
            <span class="highlight">${correctCounter}</span>개 맞히셨습니다
        `;
        return;
    }
    counter++;

    answer.querySelector(':scope > .button').onclick = () => {
        nextScreen();
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            nextScreen();
        }
    }, {once: true})
};

// section: 푸터
const $footer = document.getElementById('footer');

$footer.querySelector(':scope > .correct').innerHTML = `
        <span class="caption"><span class="highlight">${correctCounter}</span>맞히셨습니다</span>
            <form class="button-container">
                <button class="return" type="button">다시하기</button>
                <button class="home" type="button">홈으로</button>
            </form>
    `;

$footer.querySelector(':scope > .correct > .button-container > .home').onclick = () => {
    $footer.classList.remove('visible');
    location.reload();
}