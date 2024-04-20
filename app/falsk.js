(async () => {
    const languages = (await (await fetch('languages.json')).json())
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
        const gameWord = document.getElementById('gameWord')
        var swipingStart = -1;
        document.getElementById('swipeTarget').addEventListener('mousedown', (evt) => {
            swipingStart = evt.clientY;
        });
        body.addEventListener('mouseup', (evt) => {
            swipingStart = -1;
            gameWord.style.opacity = 0;
            nextReveal();
        });
        body.addEventListener('mousemove', (evt) => {
            if (swipingStart >= 0) {
                const swipeDistance = swipingStart - evt.clientY;
                if (swipeDistance >= 0) {
                    gameWord.style.opacity = Math.min(swipeDistance / 300.0, 1)
                }
            }
        });

        //
        await switchAppState('setup');

    }

    const startGame = async (language, players) => {
        // Set options
        config.language = language
        config.players = players

        // Load words
        config.words = [];
        const data = (await (await fetch(languages[language].data)).json())
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

        //
        await nextReveal();
    }

    bootstrap()
})();
