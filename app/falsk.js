(async () => {
    const languages = (await (await fetch('data/languages.json')).json())
    const body = document.getElementsByTagName('body')[0]

    const config = {
        // App state
        appState: '',

        // Game options
        language: '',
        words: [],
        players: 0,

        // Game state
        selectedWord: '',
        selectedCategory: '',
        fakePlayer: 0,
        currentPeek: 0,
    }

    const switchAppState = async (appState) => {
        config.appState = appState
        body.className = config.appState;
    }

    const bootstrap = async () => {
        const setupForm = document.getElementById('setupForm')
        const swipeTarget = document.getElementById('swipeTarget')
        const currentPlayerDisplay = document.getElementById('currentPlayerDisplay')
        const wordDisplay = document.getElementById('wordDisplay')

        // Build language options
        const languageSelect = setupForm.language
        for (const [language, options] of Object.entries(languages)) {
            let option = document.createElement('option')
            option.value = language
            option.innerHTML = options.label
            languageSelect.appendChild(option);
        }

        // Update display for players on input
        const playersRange = setupForm.players
        const updatePlayerCount = () => {
            document.getElementById('playerCount').innerHTML = playersRange.value
        }
        playersRange.addEventListener('input', updatePlayerCount);
        updatePlayerCount();

        // Form handler
        setupForm.addEventListener('submit', (evt) => {
            evt.preventDefault()
            const formData = new FormData(evt.currentTarget);
            startGame(formData.get('language'), formData.get('players'));
        });

        // Reset button handler
        document.getElementById('resetButton').addEventListener('click', resetGameState);

        // Swipe handler
        var swipingStart = -1
        const touchstart = (evt) => {
            swipeTarget.style.opacity = 0;
            const clientY = (evt.touches ? evt.touches[0].clientY : evt.clientY)
            swipingStart = clientY;
        }
        const touchend = () => {
            swipingStart = -1;
            wordDisplay.style.opacity = 0;
            currentPlayerDisplay.style.opacity = 0;
            swipeTarget.style.opacity = 1;
            nextReveal();
        }
        const touchmove = (evt) => {
            if (swipingStart >= 0) {
                const clientY = (evt.touches ? evt.touches[0].clientY : evt.clientY)
                const swipeDistance = swipingStart - clientY
                if (swipeDistance >= 0) {
                    const opacity = Math.min(swipeDistance / 200.0, 1)
                    currentPlayerDisplay.style.opacity = opacity
                    wordDisplay.style.opacity = opacity
                }
            }
        }
        swipeTarget.addEventListener('touchstart', touchstart);
        swipeTarget.addEventListener('mousedown', touchstart);
        body.addEventListener('touchend', touchend);
        body.addEventListener('mouseup', touchend);
        body.addEventListener('touchmove', touchmove);
        body.addEventListener('mousemove', touchmove);

        //
        await switchAppState('setup');

    }

    const startGame = async (language, players) => {
        // Set options
        config.language = language
        config.players = players

        // Load words
        config.words = [];
        const data = (await (await fetch('data/' + languages[language].data)).json())
        for (const [category, words] of Object.entries(data)) {
            for (const word of words) {
                config.words.push({ word, category })
            }
        }
        await resetGameState();
        await switchAppState('game');
    }

    const nextReveal = async () => {
        config.currentPeek++
        if (config.currentPeek == config.fakePlayer) {
            document.getElementById('currentPlayerDisplay').innerHTML = config.currentPeek
            document.getElementById('wordDisplay').innerHTML = 'X'
        } else if (config.currentPeek <= config.players) {
            document.getElementById('currentPlayerDisplay').innerHTML = config.currentPeek
            document.getElementById('wordDisplay').innerHTML = config.selectedWord
        } else {
            document.getElementById('currentPlayerDisplay').innerHTML = ''
            document.getElementById('wordDisplay').innerHTML = ''
            swipeTarget.style.opacity = 0;
        }
    }

    const resetGameState = async () => {
        // Reset fake player
        config.currentPeek = 0
        config.fakePlayer = Math.ceil(Math.random() * config.players);

        // Randomly pick a word and category
        const selection = config.words[Math.floor(Math.random() * config.words.length)]
        config.selectedCategory = selection.category
        config.selectedWord = selection.word

        // Update the UI
        document.getElementById('playersDisplay').innerHTML = config.players
        document.getElementById('categoryDisplay').innerHTML = config.selectedCategory
        swipeTarget.style.opacity = 1;


        //
        await nextReveal();
    }

    bootstrap()
})();
